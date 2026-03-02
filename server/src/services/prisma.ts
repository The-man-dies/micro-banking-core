import { PrismaClient } from "@prisma/client";

const getDatabaseUrl = () => {
  let url = process.env.DATABASE_URL;

  if (!url) {
    const databaseFile = process.env.DATABASE_FILE;
    if (databaseFile) {
      url = `file:${databaseFile}`;
    } else {
      url = "file:./micro_banking.db";
    }
  }

  // Normalize the URL for Prisma/Windows compatibility
  if (url.startsWith("file:")) {
    let filePath = url.slice(5);
    // Fix Windows backslashes
    filePath = filePath.replace(/\\/g, "/");
    // Strip Windows UNC prefix if present (//?/C:/...)
    if (filePath.startsWith("//?/")) {
      filePath = filePath.slice(4);
    }
    return `file:${filePath}`;
  }

  return url;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
  log: ["error", "warn"],
});
