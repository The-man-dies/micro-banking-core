import type { Database } from "sqlite";
import logger from "../config/logger";
import { databaseService } from "../services/database";
import { TicketType, TicketDto } from "../types/ticket.types";

export interface ITicketModel {
  create(ticket: TicketDto, db: Database): Promise<TicketType>;
  findById(id: number, db?: Database): Promise<TicketType | null>;
  update(
    id: number,
    ticket: Partial<TicketType>,
    db?: Database,
  ): Promise<TicketType | null>;
  delete(id: number, db?: Database): Promise<boolean>;
}

class TicketModel implements ITicketModel {
  private async getConnection(db?: Database): Promise<Database> {
    return db || databaseService.getDbConnection();
  }

  public async create(ticket: TicketDto, db: Database): Promise<TicketType> {
    try {
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();
      const result = await db.run(
        `INSERT INTO Ticket (description, status, clientId, createdFiscalYear) VALUES (?, ?, ?, ?)`,
        ticket.description || null,
        ticket.status,
        ticket.clientId,
        currentFiscalYear,
      );
      const newId = result.lastID;
      if (!newId) {
        throw new Error("Failed to create ticket.");
      }
      const newTicket = await this.findById(newId, db);
      if (!newTicket) {
        throw new Error("Failed to retrieve ticket after creation.");
      }
      return newTicket;
    } catch (error) {
      logger.error(
        `Error occured in ticket creation : ${(error as Error).message}`,
        { error },
      );
      throw error;
    }
  }

  public async findById(id: number, db?: Database): Promise<TicketType | null> {
    try {
      const conn = await this.getConnection(db);
      const row = await conn.get<TicketType>(
        `SELECT * FROM Ticket WHERE id = ?`,
        id,
      );
      return row || null;
    } catch (error) {
      logger.error(
        `Error occured on ticket foundation ${(error as Error).message}`,
        { error },
      );
      throw error;
    }
  }

  public async update(
    id: number,
    ticket: Partial<TicketType>,
    db?: Database,
  ): Promise<TicketType | null> {
    try {
      const conn = await this.getConnection(db);
      const existingTicket = await this.findById(id, conn);
      if (!existingTicket) return null;

      const updatedTicket = {
        ...existingTicket,
        ...ticket,
      };

      await conn.run(
        `UPDATE Ticket SET description = ?, status = ?, clientId = ? WHERE id = ?`,
        updatedTicket.description || null,
        updatedTicket.status,
        updatedTicket.clientId,
        id,
      );
      return this.findById(id, conn);
    } catch (error) {
      logger.error(
        `Error occured on ticket update ${(error as Error).message}`,
        { error },
      );
      throw error;
    }
  }

  public async delete(id: number, db?: Database): Promise<boolean> {
    try {
      const conn = await this.getConnection(db);
      const result = await conn.run(`DELETE FROM Ticket WHERE id = ?`, id);
      return (result.changes ?? 0) > 0;
    } catch (error) {
      logger.error(
        `Error occured on ticket deletion ${(error as Error).message}`,
        { error },
      );
      throw error;
    }
  }
}

export default new TicketModel();
