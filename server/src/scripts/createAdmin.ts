import { getDbConnection, initializeDatabase } from '../services/database';
import bcrypt from 'bcrypt';
import readline from 'readline';
import dotenv from 'dotenv';
import logger from '../config/logger';

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
        const db = await getDbConnection();

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if user already exists and update or insert
        const existingAdmin = await db.get('SELECT * FROM Admin WHERE username = ?', [username]);

        if (existingAdmin) {
            logger.info(`Updating password for existing admin: ${username}`);
            await db.run(
                'UPDATE Admin SET password = ? WHERE username = ?',
                [hashedPassword, username]
            );
            logger.info('Admin password updated successfully.');
        } else {
            logger.info(`Creating new admin: ${username}`);
            await db.run(
                'INSERT INTO Admin (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );
            logger.info('Admin user created successfully.');
        }

      } catch (error) {
        logger.error('Failed to create/update admin user:', { error });
      } finally {
        rl.close();
      }
    });
  });
};

createAdmin();
