import { databaseService } from '../services/database';
import readline from 'readline/promises';
import dotenv from 'dotenv';
import logger from '../config/logger';
import Admin from '../models/Admin';
import path from 'path';
import fs from 'fs';

// --- Load .env first ---
dotenv.config({ path: '.env' });

const DB_FILE = process.env.NODE_ENV === 'test' ? ':memory:' : (process.env.DATABASE_FILE || 'database.db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const createAdmin = async () => {
  try {
    // --- Start Enhanced Logging ---
    logger.info('--- Starting create-admin script ---');
    logger.info(`process.env.DATABASE_FILE after dotenv.config(): ${process.env.DATABASE_FILE}`);
    logger.info(`Current working directory (process.cwd()): ${process.cwd()}`);
    const dbFilePath = path.resolve(process.cwd(), DB_FILE);
    logger.info(`Database file variable (DB_FILE): ${DB_FILE}`);
    logger.info(`Resolved database file path: ${dbFilePath}`);
    logger.info(`Does database file exist before init? ${fs.existsSync(dbFilePath)}`);
    // --- End Enhanced Logging ---

    await databaseService.initializeDatabase();
    logger.info('Database initialization complete.');
    logger.info(`Does database file exist after init? ${fs.existsSync(dbFilePath)}`);


    const username = await rl.question('Enter admin username: ');
    const password = await rl.question('Enter admin password: ');

    if (!username || !password) {
      logger.error('Username and password cannot be empty.');
      return;
    }

    logger.info(`Attempting to find admin: ${username}`);
    const existingAdmin = await Admin.findByUsername(username);
    logger.info(`Admin lookup complete. Found: ${!!existingAdmin}`);

    if (existingAdmin) {
      logger.info(`Updating password for existing admin: ${username}`);
      await Admin.updatePassword(username, password);
      logger.info('Admin password updated successfully.');
    } else {
      logger.info(`Creating new admin: ${username}`);
      await Admin.create({ username, password });
      logger.info('Admin user created successfully.');
    }
  } catch (error: any) {
    logger.error('--- SCRIPT FAILED ---');
    logger.error(`Error name: ${error.name}`);
    logger.error(`Error message: ${error.message}`);
    logger.error(`Error stack: ${error.stack}`);
  } finally {
    rl.close();
    await databaseService.closeDbConnection();
    logger.info('--- Script finished ---');
  }
};

createAdmin();
