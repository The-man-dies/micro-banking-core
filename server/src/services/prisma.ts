import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./micro_banking.db";
}

export const prisma = new PrismaClient();
