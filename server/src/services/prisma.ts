import { PrismaClient } from "@prisma/client";

const getDatabaseUrl = () => {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const databaseFile = process.env.DATABASE_FILE;
  if (databaseFile) {
    // Normalize path for Windows: use forward slashes and ensure no UNC prefix for the URL itself
    let normalizedPath = databaseFile.replace(/\\/g, "/");
    if (normalizedPath.startsWith("//?/")) {
      normalizedPath = normalizedPath.slice(4);
    }
    return `file:${normalizedPath}`;
  }

  return "file:./micro_banking.db";
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: ["error", "warn"],
});
