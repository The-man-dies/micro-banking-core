import { Prisma } from "@prisma/client";
import logger from "../config/logger";
import { prisma } from "../services/prisma";
import type {
  TransactionDto,
  TransactionData,
  TransactionType,
} from "../types/transaction.types";
import { databaseService } from "../services/database";

export interface ITransactionModel {
  create(
    transaction: TransactionDto,
    tx?: Prisma.TransactionClient,
    fiscalYear?: number,
  ): Promise<TransactionData>;
  getAll(
    fiscalYear: number,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionData & { agentId: number })[]>;
  getAccounting(
    fiscalYear: number,
    thirtyDaysAgoFormatted: string,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionData & { agentId: number })[]>;
}

class TransactionModel implements ITransactionModel {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || prisma;
  }

  public async create(
    transaction: TransactionDto,
    tx?: Prisma.TransactionClient,
    fiscalYear?: number,
  ): Promise<TransactionData> {
    try {
      const db = this.getClient(tx);
      const currentFiscalYear =
        fiscalYear ?? (await databaseService.getCurrentFiscalYear());

      const result = await db.transaction.create({
        data: {
          clientId: transaction.clientId,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description || null,
          fiscalYear: currentFiscalYear,
        },
      });

      return {
        id: result.id.toString(),
        clientId: result.clientId,
        amount: result.amount,
        type: result.type.toString() as TransactionType,
        description: result.description ?? undefined,
        createdAt: result.createdAt.toISOString(),
      };
    } catch (error) {
      logger.error("Error creating transaction with Prisma:", { error });
      throw error;
    }
  }

  public async getAll(
    fiscalYear: number,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionData & { agentId: number })[]> {
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
        id: t.id.toString(),
        clientId: t.clientId,
        amount: t.amount,
        type: t.type.toString() as TransactionType,
        description: t.description ?? undefined,
        createdAt: t.createdAt.toISOString(),
        agentId: t.client.agentId,
      }));
    } catch (error) {
      logger.error("Error fetching all transactions with Prisma:", { error });
      throw error;
    }
  }

  public async getAccounting(
    fiscalYear: number,
    thirtyDaysAgoFormatted: string,
    tx?: Prisma.TransactionClient,
  ): Promise<(TransactionData & { agentId: number })[]> {
    try {
      const db = this.getClient(tx);
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
        id: t.id.toString(),
        clientId: t.clientId,
        amount: t.amount,
        type: t.type.toString() as TransactionType,
        description: t.description ?? undefined,
        createdAt: t.createdAt.toISOString(),
        agentId: t.client.agentId,
      }));
    } catch (error) {
      logger.error("Error fetching accounting transactions with Prisma:", {
        error,
      });
      throw error;
    }
  }
}

export default new TransactionModel();
