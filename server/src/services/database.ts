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
    } catch (error) {
        logger.error('Database initialization failed:', { error });
        throw error; // Re-throw the error to be caught by the caller
    }
};
