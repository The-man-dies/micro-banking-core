import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import logger from "../config/logger";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use in-memory DB for tests, otherwise use a file
const DB_FILE =
  process.env.NODE_ENV === "test"
    ? ":memory:"
    : process.env.DATABASE_FILE || "database.db";

class DatabaseService {
  private static instance: DatabaseService;
  private dbConnection: Database | null = null;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async getDbConnection(): Promise<Database> {
    // For tests, we want a new in-memory db for each test suite, so don't use singleton.
    if (process.env.NODE_ENV === "test") {
      const verboseDb = sqlite3.verbose();
      return open({
        filename: DB_FILE,
        driver: verboseDb.Database,
      });
    }

    if (!this.dbConnection) {
      try {
        const verboseDb = sqlite3.verbose();
        this.dbConnection = await open({
          filename: DB_FILE,
          driver: verboseDb.Database,
        });
        logger.info(`Connected to the SQLite database at ${DB_FILE}`);
      } catch (error) {
        logger.error("Database connection failed:", { error });
        throw error;
      }
    }
    return this.dbConnection;
  }

  public async closeDbConnection(): Promise<void> {
    if (this.dbConnection && process.env.NODE_ENV !== "test") {
      await this.dbConnection.close();
      this.dbConnection = null;
      logger.info("Database connection closed.");
    }
  }

  /**
   * Initializes the database and creates the necessary tables if they don't exist.
   * Can be pointed at a specific db instance for testing.
   */
  public async initializeDatabase(db?: Database): Promise<void> {
    try {
      const conn = db || (await this.getDbConnection());
      if (!db) logger.info("Initializing database...");
      await this.runMigrations(conn);

      // Use db.exec for CREATE TABLE statements
      await conn.exec(`
                CREATE TABLE IF NOT EXISTS Admin (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    refreshToken TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                    createdFiscalYear INTEGER NOT NULL
                )
            `);
      if (!db) logger.info("Admin table is ready.");

      await conn.exec(`
                CREATE TABLE IF NOT EXISTS Agent (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    email TEXT UNIQUE,
                    location TEXT,
                    createdFiscalYear INTEGER NOT NULL
                )
            `);
      if (!db) logger.info("Agent table is ready.");

      await conn.exec(`
                CREATE TABLE IF NOT EXISTS Client (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    email TEXT UNIQUE,
                    phone TEXT NOT NULL UNIQUE,
                    location TEXT NOT NULL DEFAULT '',
                    agentId INTEGER NOT NULL,
                    accountBalance REAL NOT NULL DEFAULT 0,
                    montantEngagement REAL NOT NULL DEFAULT 0,
                    accountExpiresAt TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    createdFiscalYear INTEGER NOT NULL,
                    FOREIGN KEY (agentId) REFERENCES Agent(id)
                )
            `);
      if (!db) logger.info("Client table is ready.");
      await conn.exec(`
                CREATE TABLE IF NOT EXISTS Ticket (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT,
                    status TEXT NOT NULL,
                    clientId INTEGER NOT NULL,
                    createdFiscalYear INTEGER NOT NULL,
                    FOREIGN KEY (clientId) REFERENCES Client(id)
                )
            `);
      if (!db) logger.info("Ticket table is ready.");

      await conn.exec(`
                CREATE TABLE IF NOT EXISTS Transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clientId INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    type TEXT NOT NULL CHECK(type IN ('FraisInscription', 'FraisReactivation', 'Depot', 'Retrait', 'Expiration')),
                    description TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    fiscalYear INTEGER NOT NULL,
                    FOREIGN KEY (clientId) REFERENCES Client(id)
                )
            `);
      if (!db) logger.info("Transactions table is ready.");

      await conn.exec(`
        CREATE TABLE IF NOT EXISTS AppSettings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fiscalYear INTEGER NOT NULL UNIQUE,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      if (!db) logger.info("AppSettings table is ready.");

      if (!db) logger.info("Database initialization complete.");
    } catch (error) {
      logger.error("Database initialization failed:", { error });
      throw error; // Re-throw the error to be caught by the caller
    }
  }

  private async runMigrations(conn: Database): Promise<void> {
    const currentYear = new Date().getFullYear();
    // ---- Admin
    const adminCols = await conn.all<{ name: string }[]>(
      `PRAGMA table_info(Admin)`,
    );
    const adminColNames = new Set(adminCols.map((c) => c.name));

    if (!adminColNames.has("createdFiscalYear")) {
      await conn.exec(
        `ALTER TABLE Admin ADD COLUMN createdFiscalYear INTEGER NOT NULL DEFAULT ${currentYear}`,
      );
    }

    // ---- Agent
    const agentCols = await conn.all<{ name: string }[]>(
      `PRAGMA table_info(Agent)`,
    );
    const agentColNames = new Set(agentCols.map((c) => c.name));

    if (!agentColNames.has("createdFiscalYear")) {
      await conn.exec(
        `ALTER TABLE Agent ADD COLUMN createdFiscalYear INTEGER NOT NULL DEFAULT ${currentYear}`,
      );
    }

    // ---- Client
    const clientCols = await conn.all<{ name: string }[]>(
      `PRAGMA table_info(Client)`,
    );
    const clientColNames = new Set(clientCols.map((c) => c.name));

    if (!clientColNames.has("createdFiscalYear")) {
      await conn.exec(
        `ALTER TABLE Client ADD COLUMN createdFiscalYear INTEGER NOT NULL DEFAULT ${currentYear}`,
      );
    }

    // ---- Ticket
    const ticketCols = await conn.all<{ name: string }[]>(
      `PRAGMA table_info(Ticket)`,
    );
    const ticketColNames = new Set(ticketCols.map((c) => c.name));

    if (!ticketColNames.has("createdFiscalYear")) {
      await conn.exec(
        `ALTER TABLE Ticket ADD COLUMN createdFiscalYear INTEGER NOT NULL DEFAULT ${currentYear}`,
      );
    }

    // ---- Transactions
    const txCols = await conn.all<{ name: string }[]>(
      `PRAGMA table_info(Transactions)`,
    );
    const txColNames = new Set(txCols.map((c) => c.name));

    if (!txColNames.has("fiscalYear")) {
      await conn.exec(
        `ALTER TABLE Transactions ADD COLUMN fiscalYear INTEGER NOT NULL DEFAULT ${currentYear}`,
      );
    }

    // Migration for Transactions type column to include 'Expiration'
    const transactionsSchema = await conn.get<{ sql: string }>(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='Transactions'`,
    );

    if (
      transactionsSchema &&
      transactionsSchema.sql &&
      !transactionsSchema.sql.includes(
        "CHECK(type IN ('FraisInscription', 'FraisReactivation', 'Depot', 'Retrait', 'Expiration'))",
      )
    ) {
      logger.info("Migrating Transactions table to include 'Expiration' type.");

      await conn.exec(`
        ALTER TABLE Transactions RENAME TO _Transactions_old;
      `);

      await conn.exec(`
        CREATE TABLE Transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          clientId INTEGER NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL CHECK(type IN ('FraisInscription', 'FraisReactivation', 'Depot', 'Retrait', 'Expiration')),
          description TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          fiscalYear INTEGER NOT NULL,
          FOREIGN KEY (clientId) REFERENCES Client(id)
        );
      `);

      await conn.exec(`
        INSERT INTO Transactions (id, clientId, amount, type, description, createdAt, fiscalYear)
        SELECT id, clientId, amount, type, description, createdAt, fiscalYear FROM _Transactions_old;
      `);

      await conn.exec(`
        DROP TABLE _Transactions_old;
      `);
      logger.info("Migration for Transactions table completed.");
    }

    // ---- AppSettings table
    await conn.exec(`
    CREATE TABLE IF NOT EXISTS AppSettings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fiscalYear INTEGER NOT NULL UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    logger.info("Migration applied: added createdFiscalYear to Client");
  }

  async getCurrentFiscalYear(): Promise<number> {
    try {
      const db = await this.getDbConnection();
      const currentCalendarYear = new Date().getFullYear();

      const result = await db.get<{ fiscalYear: number }>(
        "SELECT fiscalYear FROM AppSettings ORDER BY id DESC LIMIT 1",
      );

      if (!result) {
        await db.run("INSERT INTO AppSettings (fiscalYear) VALUES (?)", [
          currentCalendarYear,
        ]);
        return currentCalendarYear;
      }

      if (result.fiscalYear < currentCalendarYear) {
        await db.run("INSERT INTO AppSettings (fiscalYear) VALUES (?)", [
          currentCalendarYear,
        ]);
        return currentCalendarYear;
      }

      return result.fiscalYear;
    } catch (error) {
      logger.error("Failed to get current fiscal year:", { error });
      throw error;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
