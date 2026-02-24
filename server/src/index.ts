import dotenv from "dotenv";
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

import app from "./app";
import { databaseService } from "./services/database";
import logger from "./config/logger";
import { startExpirationService, stopExpirationService } from "./services/cron";

const port = process.env.PORT || 3000;
let server: ReturnType<typeof app.listen> | null = null;
let shuttingDown = false;

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
  })
  .catch((error) => {
    logger.error("Failed to initialize server:", { error });
    process.exit(1);
  });
