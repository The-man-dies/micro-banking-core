import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { initializeDatabase } from './services/database';
import logger from './config/logger';
import { startExpirationService } from './services/cron';


const port = process.env.PORT || 3000;

// Initialize the database and then start the server
initializeDatabase().then(() => {
    // Start background services
    startExpirationService();

    app.listen(port, () => {
        logger.info(`Server is running on port ${port}`);
    });
}).catch(error => {
    logger.error('Failed to initialize server:', { error });
    process.exit(1);
});
