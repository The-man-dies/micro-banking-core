import logger from "../config/logger";
import prisma from "./prisma";
import { runMigrationsIfNeeded } from "./migrationRunner";

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initializes the database.
   * With Prisma, this is mostly handled by the CLI, but we can
   * add logic here to ensure the connection is working.
   */
  public async initializeDatabase(): Promise<void> {
    try {
      await runMigrationsIfNeeded();
      logger.info("Initializing database connection via Prisma...");
      await prisma.$connect();
      logger.info("Database connection established.");
    } catch (error) {
      logger.error("Database initialization failed:", { error });
      throw error;
    }
  }

  public async closeDbConnection(): Promise<void> {
    try {
      logger.info("Closing database connection via Prisma...");
      await prisma.$disconnect();
      logger.info("Database connection closed.");
    } catch (error) {
      logger.error("Failed to close database connection:", { error });
      throw error;
    }
  }

  async getCurrentFiscalYear(): Promise<number> {
    try {
      const currentCalendarYear = new Date().getFullYear();

      const result = await prisma.appSettings.findFirst({
        orderBy: { id: "desc" },
      });

      if (!result) {
        const newSettings = await prisma.appSettings.create({
          data: { fiscalYear: currentCalendarYear },
        });
        return newSettings.fiscalYear;
      }

      if (result.fiscalYear < currentCalendarYear) {
        const updatedSettings = await prisma.appSettings.create({
          data: { fiscalYear: currentCalendarYear },
        });
        return updatedSettings.fiscalYear;
      }

      return result.fiscalYear;
    } catch (error) {
      logger.error("Failed to get current fiscal year:", { error });
      throw error;
    }
  }
}

export const databaseService = DatabaseService.getInstance();
