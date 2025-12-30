import { initializeDatabase } from '../services/database';
import readline from 'readline';
import dotenv from 'dotenv';
import logger from '../config/logger';
import Admin from '../models/Admin';

dotenv.config({ path: '.env' });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const createAdmin = async () => {
  rl.question('Enter admin username: ', (username) => {
    rl.question('Enter admin password: ', async (password) => {
      if (!username || !password) {
        logger.error('Username and password cannot be empty.');
        rl.close();
        return;
      }

      try {
        await initializeDatabase();
        
        const existingAdmin = await Admin.findByUsername(username);

        if (existingAdmin) {
            logger.info(`Updating password for existing admin: ${username}`);
            await Admin.updatePassword(username, password);
            logger.info('Admin password updated successfully.');
        } else {
            logger.info(`Creating new admin: ${username}`);
            await Admin.create({ username, password });
            logger.info('Admin user created successfully.');
        }

      } catch (error) {
        logger.error('Failed to create/update admin user:', { error });
      } finally {
        rl.close();
        const db = await (await import('../services/database')).getDbConnection();
        if (db) {
            // Since we're running a script, it's good practice to close the connection
            // But getDbConnection is a singleton, so this will close it for everyone.
            // In a real app, you'd handle this more gracefully.
            // For this script, we'll assume it's okay to close.
            // await db.close();
        }
      }
    });
  });
};

createAdmin();
