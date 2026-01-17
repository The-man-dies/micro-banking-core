import { getDbConnection } from "./database";
import logger from "../config/logger";

const EXPIRATION_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000; // Check every 12 hours

export const startExpirationService = () => {
    logger.info("Starting account expiration service...");

    // Initial check on startup
    checkAndExpireAccounts();

    // Schedule periodic checks
    setInterval(checkAndExpireAccounts, EXPIRATION_CHECK_INTERVAL_MS);
};

export const checkAndExpireAccounts = async () => {
    try {
        const db = await getDbConnection();
        const now = new Date().toISOString();

        // Transaction handling (good practice for batch updates)
        // Note: SQLite doesn't support complex updates with FROM clauses easily in one go for tracking changes precisely per row in a single query result,
        // but we can do a simple update WHERE.

        // Find candidates first to log them (optional but good for audit)
        // Or just run the update and check changes.

        const result = await db.run(
            `UPDATE Client 
             SET status = 'expired' 
             WHERE status = 'active' 
             AND accountExpiresAt < ?`,
            now
        );

        if (result.changes && result.changes > 0) {
            logger.info(`Expired ${result.changes} client accounts found with past expiration date.`);
        } else {
            // logger.debug("No expired accounts found."); // Optional debug log
        }

    } catch (error) {
        logger.error("Error running account expiration check:", { error });
    }
};
