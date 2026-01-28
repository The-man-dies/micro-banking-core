import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import logger from '../config/logger';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Use in-memory DB for tests, otherwise use a file
const DB_FILE = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DATABASE_FILE || 'database.db');

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
        if (process.env.NODE_ENV === 'test') {
            const verboseDb = sqlite3.verbose();
            return open({
                filename: DB_FILE,
                driver: verboseDb.Database
            });
        }

        if (!this.dbConnection) {
            try {
                const verboseDb = sqlite3.verbose();
                this.dbConnection = await open({
                    filename: DB_FILE,
                    driver: verboseDb.Database
                });
                logger.info(`Connected to the SQLite database at ${DB_FILE}`);
            } catch (error) {
                logger.error('Database connection failed:', { error });
                throw error;
            }
        }
        return this.dbConnection;
    }

    public async closeDbConnection(): Promise<void> {
        if (this.dbConnection && process.env.NODE_ENV !== 'test') {
            await this.dbConnection.close();
            this.dbConnection = null;
            logger.info('Database connection closed.');
        }
    }

    /**
     * Initializes the database and creates the necessary tables if they don't exist.
     * Can be pointed at a specific db instance for testing.
     */
    public async initializeDatabase(db?: Database): Promise<void> {
        try {
            const conn = db || await this.getDbConnection();
            if (!db) logger.info('Initializing database...');

            // Use db.exec for CREATE TABLE statements
            await conn.exec(`
                CREATE TABLE IF NOT EXISTS Admin (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    refreshToken TEXT,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);
            if (!db) logger.info('Admin table is ready.');

            await conn.exec(`
                CREATE TABLE IF NOT EXISTS Agent (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    email TEXT,
                    location TEXT
                )
            `);
            if (!db) logger.info('Agent table is ready.');

            await conn.exec(`
                CREATE TABLE IF NOT EXISTS Client (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    firstname TEXT NOT NULL,
                    lastname TEXT NOT NULL,
                    email TEXT,
                    phone TEXT NOT NULL DEFAULT '',
                    location TEXT NOT NULL DEFAULT '',
                    agentId INTEGER NOT NULL,
                    accountBalance REAL NOT NULL DEFAULT 0,
                    montantEngagement REAL NOT NULL DEFAULT 0,
                    accountExpiresAt TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'active',
                    FOREIGN KEY (agentId) REFERENCES Agent(id)
                )
            `);
            if (!db) logger.info('Client table is ready.');

            // Ensure schema is up to date for existing DB files (SQLite doesn't support IF NOT EXISTS for columns).
            const clientColumns = await conn.all<{ name: string }[]>(`PRAGMA table_info(Client)`);
            const clientColumnNames = new Set(clientColumns.map(c => c.name));

            if (!clientColumnNames.has('phone')) {
                await conn.exec(`ALTER TABLE Client ADD COLUMN phone TEXT NOT NULL DEFAULT ''`);
            }
            if (!clientColumnNames.has('location')) {
                await conn.exec(`ALTER TABLE Client ADD COLUMN location TEXT NOT NULL DEFAULT ''`);
            }

            // Backfill existing rows that may have NULLs from older schemas.
            await conn.exec(`UPDATE Client SET phone = '' WHERE phone IS NULL`);
            await conn.exec(`UPDATE Client SET location = '' WHERE location IS NULL`);

            await conn.exec(`
                CREATE TABLE IF NOT EXISTS Ticket (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    description TEXT,
                    status TEXT NOT NULL,
                    clientId INTEGER NOT NULL,
                    FOREIGN KEY (clientId) REFERENCES Client(id)
                )
            `);
            if (!db) logger.info('Ticket table is ready.');

            await conn.exec(`
                CREATE TABLE IF NOT EXISTS Transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    clientId INTEGER NOT NULL,
                    amount REAL NOT NULL,
                    type TEXT NOT NULL CHECK(type IN ('FraisInscription', 'FraisReactivation', 'Depot', 'Retrait')),
                    description TEXT,
                    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (clientId) REFERENCES Client(id)
                )
            `);
            if (!db) logger.info('Transactions table is ready.');
            
            if (!db) logger.info('Database initialization complete.');

        } catch (error) {
            logger.error('Database initialization failed:', { error });
            throw error; // Re-throw the error to be caught by the caller
        }
    }
}

export const databaseService = DatabaseService.getInstance();
