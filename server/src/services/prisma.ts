import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../../.env") });

const url = process.env.DATABASE_URL || "file:./micro_banking.db";
const adapter = new PrismaLibSql({ url });

const prisma = new PrismaClient({ adapter });

export default prisma;
