import { Prisma } from "../generated/client/client";
import logger from "../config/logger";
import globalPrisma from "../services/prisma";
import type {
  TransactionDto,
  TransactionType,
} from "../types/transaction.types";
import { databaseService } from "../services/database";

export interface ITransactionModel {
  create(
    transaction: TransactionDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionType>;
  getAll(
    fiscalYear: number,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionType & { agentId: number })[]>;
  getAccounting(
    fiscalYear: number,
    thirtyDaysAgoFormatted: string,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionType & { agentId: number })[]>;
}

class TransactionModel implements ITransactionModel {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || globalPrisma;
  }

  public async create(
    transaction: TransactionDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TransactionType> {
    try {
      const db = this.getClient(tx);
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();

      const result = await db.transaction.create({
        data: {
          clientId: transaction.clientId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description || null,
          fiscalYear: currentFiscalYear,
        },
      });

      return result as unknown as TransactionType;
    } catch (error) {
      logger.error("Error creating transaction with Prisma:", { error });
      throw error;
    }
  }

  public async getAll(
    fiscalYear: number,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionType & { agentId: number })[]> {
    try {
      const db = this.getClient(tx);
      const transactions = await db.transaction.findMany({
        where: { fiscalYear },
        include: {
          client: {
            select: { agentId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return transactions.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        agentId: t.client.agentId,
      })) as unknown as (TransactionType & { agentId: number })[];
    } catch (error) {
      logger.error("Error fetching all transactions with Prisma:", { error });
      throw error;
    }
  }

  public async getAccounting(
    fiscalYear: number,
    thirtyDaysAgoFormatted: string,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionType & { agentId: number })[]> {
    try {
      const db = this.getClient(tx);
      // Prisma doesn't have a direct strftime, but we can use GTE with Date object
      const startDate = new Date(thirtyDaysAgoFormatted);

      const transactions = await db.transaction.findMany({
        where: {
          fiscalYear,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          client: {
            select: { agentId: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return transactions.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        agentId: t.client.agentId,
      })) as unknown as (TransactionType & { agentId: number })[];
    } catch (error) {
      logger.error("Error fetching accounting transactions with Prisma:", {
        error,
      });
      throw error;
    }
  }
}

export default new TransactionModel();
