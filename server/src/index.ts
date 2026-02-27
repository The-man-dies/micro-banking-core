import dotenv from "dotenv";

import app from "./app";
import { databaseService } from "./services/database";
import logger from "./config/logger";
import { startExpirationService, stopExpirationService } from "./services/cron";

const tauriEnvPath = process.env.TAURI_ENV_PATH;
if (tauriEnvPath) {
  dotenv.config({ path: tauriEnvPath });
} else {
  dotenv.config();
}

const prismaSchemaPath = process.env.PRISMA_SCHEMA_PATH;
if (prismaSchemaPath) {
  process.env.PRISMA_SCHEMA_PATH = prismaSchemaPath;
}
const prismaWasmPath = process.env.PRISMA_QUERY_ENGINE_WASM_PATH;
if (prismaSchemaPath || prismaWasmPath) {
  logger.info(
    `Prisma paths: schema=${prismaSchemaPath || "default"} wasm=${prismaWasmPath || "default"}`,
  );
}

const port = Number(process.env.PORT) || 3000;
let server: ReturnType<typeof app.listen> | null = null;
let shuttingDown = false;

logger.info("Starting server bootstrap", {
  port,
  cwd: process.cwd(),
  env: {
    LOG_DIR: process.env.LOG_DIR,
    LOG_FILE: process.env.LOG_FILE,
    TAURI_ENV_PATH: process.env.TAURI_ENV_PATH,
    DATABASE_FILE: process.env.DATABASE_FILE,
    PRISMA_SCHEMA_PATH: process.env.PRISMA_SCHEMA_PATH,
    PRISMA_MIGRATIONS_PATH: process.env.PRISMA_MIGRATIONS_PATH,
    PRISMA_QUERY_ENGINE_WASM_PATH: process.env.PRISMA_QUERY_ENGINE_WASM_PATH,
  },
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
});

const shutdown = async (signal: string) => {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info(`Received ${signal}. Shutting down...`);
  stopExpirationService();

  const closeServer = new Promise<void>((resolve) => {
    if (!server) return resolve();
    server.close(() => resolve());
  });

  const timeout = setTimeout(() => {
    logger.error("Force exiting after timeout.");
    process.exit(1);
  }, 10_000);

  try {
    await Promise.allSettled([
      closeServer,
      databaseService.closeDbConnection(),
    ]);
    clearTimeout(timeout);
    logger.info("Shutdown complete.");
    process.exit(0);
  } catch (error) {
    clearTimeout(timeout);
    logger.error("Shutdown failed:", { error });
    process.exit(1);
  }
};

app.set("shutdown", shutdown);

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

// Initialize the database and then start the server
databaseService
  .initializeDatabase()
  .then(() => {
    // Start background services
    startExpirationService();

    server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
    server.on("error", (error) => {
      logger.error("Server failed to start", { error });
      process.exit(1);
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize server:", { error });
    process.exit(1);
  });
