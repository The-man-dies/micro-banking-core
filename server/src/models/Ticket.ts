import { Prisma } from "@prisma/client";
import logger from "../config/logger";
import { databaseService } from "../services/database";
import globalPrisma from "../services/prisma";
import { TicketType, TicketDto } from "../types/ticket.types";

export interface ITicketModel {
  create(ticket: TicketDto, tx?: Prisma.TransactionClient): Promise<TicketType>;
  findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<TicketType | null>;
  update(
    id: number,
    ticket: Partial<TicketType>,
    tx?: Prisma.TransactionClient,
  ): Promise<TicketType | null>;
  delete(id: number, tx?: Prisma.TransactionClient): Promise<boolean>;
}

class TicketModel implements ITicketModel {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || globalPrisma;
  }

  public async create(
    ticket: TicketDto,
    tx?: Prisma.TransactionClient,
  ): Promise<TicketType> {
    try {
      const db = this.getClient(tx);
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();

      const result = await db.ticket.create({
        data: {
          description: ticket.description || null,
          status: ticket.status,
          clientId: ticket.clientId,
          createdFiscalYear: currentFiscalYear,
        },
      });

      return result as unknown as TicketType;
    } catch (error) {
      logger.error("Error creating ticket with Prisma:", { error });
      throw error;
    }
  }

  public async findById(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<TicketType | null> {
    try {
      const db = this.getClient(tx);
      const row = await db.ticket.findUnique({
        where: { id },
      });
      return (row as unknown as TicketType) || null;
    } catch (error) {
      logger.error("Error finding ticket with Prisma:", { error });
      throw error;
    }
  }

  public async update(
    id: number,
    ticket: Partial<TicketType>,
    tx?: Prisma.TransactionClient,
  ): Promise<TicketType | null> {
    try {
      const db = this.getClient(tx);
      const result = await db.ticket.update({
        where: { id },
        data: {
          description: ticket.description,
          status: ticket.status,
          clientId: ticket.clientId,
        },
      });
      return result as unknown as TicketType;
    } catch (error) {
      logger.error("Error updating ticket with Prisma:", { error });
      throw error;
    }
  }

  public async delete(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    try {
      const db = this.getClient(tx);
      await db.ticket.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      logger.error("Error deleting ticket with Prisma:", { error });
      return false;
    }
  }
}

export default new TicketModel();
