import { databaseService } from "./database";
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
    const db = await databaseService.getDbConnection();
    const now = new Date().toISOString();

    // Transaction handling (good practice for batch updates)
    // Note: SQLite doesn't support complex updates with FROM clauses easily in one go for tracking changes precisely per row in a single query result,
    // but we can do a simple update WHERE.

    // Find candidates first to log them (optional but good for audit)
    // Or just run the update and check changes.

    // Transition active accounts with positive balance past their expiry to 'withdraw_only'
    const withdrawOnlyResult = await db.run(
      `UPDATE Client 
             SET status = 'withdraw_only' 
             WHERE status = 'active' 
             AND accountExpiresAt < ?
             AND accountBalance > 0`,
      now,
    );

    if (withdrawOnlyResult.changes && withdrawOnlyResult.changes > 0) {
      logger.info(
        `Transitioned ${withdrawOnlyResult.changes} active client accounts to 'withdraw_only'.`,
      );
    }

    // Transition active accounts with zero balance past their expiry to 'expired'
    const expiredResult = await db.run(
      `UPDATE Client 
             SET status = 'expired' 
             WHERE status = 'active' 
             AND accountExpiresAt < ?
             AND accountBalance = 0`,
      now,
    );

    if (expiredResult.changes && expiredResult.changes > 0) {
      logger.info(
        `Expired ${expiredResult.changes} client accounts with zero balance.`,
      );
    } else if (withdrawOnlyResult.changes === 0) {
      logger.debug("No active accounts to transition.");
    }
  } catch (error) {
    logger.error("Error running account expiration check:", { error });
  }
};
