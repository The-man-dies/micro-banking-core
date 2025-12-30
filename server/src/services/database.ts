import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import logger from '../config/logger';

const DB_FILE = process.env.DATABASE_FILE || 'database.db';

let dbConnection: Database | null = null;

export const getDbConnection = async () => {
  if (!dbConnection) {
    // Use a verbose database instance for better debugging
    const verboseDb = sqlite3.verbose();
    dbConnection = await open({
      filename: DB_FILE,
      driver: verboseDb.Database
    });
  }
  return dbConnection;
};

/**
 * Initializes the database and creates the necessary tables if they don't exist.
 */
export const initializeDatabase = async () => {
    try {
        const db = await getDbConnection();
        logger.info('Connected to the SQLite database.');

        // Use db.exec for CREATE TABLE statements
        await db.exec(`
            CREATE TABLE IF NOT EXISTS Admin (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                refreshToken TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        logger.info('Admin table is ready.');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS Agent (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                email TEXT,
                location TEXT
            )
        `);
        logger.info('Agent table is ready.');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS Client (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                firstname TEXT NOT NULL,
                lastname TEXT NOT NULL,
                email TEXT,
                agentId INTEGER NOT NULL,
                accountBalance REAL NOT NULL DEFAULT 0,
                montantEngagement REAL NOT NULL DEFAULT 0,
                accountExpiresAt TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'active',
                FOREIGN KEY (agentId) REFERENCES Agent(id)
            )
        `);
        logger.info('Client table is ready.');

        await db.exec(`
            CREATE TABLE IF NOT EXISTS Ticket (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT,
                status TEXT NOT NULL,
                clientId INTEGER NOT NULL,
                FOREIGN KEY (clientId) REFERENCES Client(id)
            )
        `);
        logger.info('Ticket table is ready.');

        await db.exec(`
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
        logger.info('Transactions table is ready.');

    } catch (error) {
        logger.error('Database initialization failed:', { error });
        throw error; // Re-throw the error to be caught by the caller
    }
};
