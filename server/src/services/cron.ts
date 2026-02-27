import { prisma } from "./prisma";
import logger from "../config/logger";

const EXPIRATION_CHECK_INTERVAL_MS = 12 * 60 * 60 * 1000; // Check every 12 hours
let expirationInterval: NodeJS.Timeout | null = null;

export const startExpirationService = () => {
  logger.info("Starting account expiration service...");

  // Initial check on startup
  checkAndExpireAccounts();

  // Schedule periodic checks
  if (!expirationInterval) {
    expirationInterval = setInterval(
      checkAndExpireAccounts,
      EXPIRATION_CHECK_INTERVAL_MS,
    );
  }
};

export const stopExpirationService = () => {
  if (expirationInterval) {
    clearInterval(expirationInterval);
    expirationInterval = null;
    logger.info("Stopped account expiration service.");
  }
};

export const checkAndExpireAccounts = async () => {
  try {
    const now = new Date().toISOString();

    // Transition active accounts with positive balance past their expiry to 'withdraw_only'
    const withdrawOnlyResult = await prisma.client.updateMany({
      where: {
        status: "active",
        accountExpiresAt: {
          lt: now,
        },
        accountBalance: {
          gt: 0,
        },
      },
      data: {
        status: "withdraw_only",
      },
    });

    if (withdrawOnlyResult.count > 0) {
      logger.info(
        `Transitioned ${withdrawOnlyResult.count} active client accounts to 'withdraw_only'.`,
      );
    }

    // Transition active accounts with zero balance past their expiry to 'expired'
    const expiredResult = await prisma.client.updateMany({
      where: {
        status: "active",
        accountExpiresAt: {
          lt: now,
        },
        accountBalance: 0,
      },
      data: {
        status: "expired",
      },
    });

    if (expiredResult.count > 0) {
      logger.info(
        `Expired ${expiredResult.count} client accounts with zero balance.`,
      );
    } else if (withdrawOnlyResult.count === 0) {
      logger.debug("No active accounts to transition.");
    }
  } catch (error) {
    logger.error("Error running account expiration check:", { error });
  }
};
