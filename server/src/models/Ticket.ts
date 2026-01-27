import type { Database } from "sqlite";
import logger from "../config/logger";
import { databaseService } from "../services/database";
import { TicketType, TicketDto } from '../types/ticket.types';

export interface ITicketModel {
    create(ticket: TicketDto, db: Database): Promise<TicketType>;
    findById(id: number, db?: Database): Promise<TicketType | null>;
    update(id: number, ticket: Partial<TicketType>, db?: Database): Promise<TicketType | null>;
    delete(id: number, db?: Database): Promise<boolean>;
}

class TicketModel implements ITicketModel {

    private async getConnection(db?: Database): Promise<Database> {
        return db || databaseService.getDbConnection();
    }

    public async create(ticket: TicketDto, db: Database): Promise<TicketType> {
        const result = await db.run(
            `INSERT INTO Ticket (description, status, clientId) VALUES (?, ?, ?)`,
            ticket.description || null,
            ticket.status,
            ticket.clientId
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
    }

    public async findById(id: number, db?: Database): Promise<TicketType | null> {
        const conn = await this.getConnection(db);
        const row = await conn.get<TicketType>(
            `SELECT * FROM Ticket WHERE id = ?`,
            id
        );
        return row || null;
    }

    public async update(id: number, ticket: Partial<TicketType>, db?: Database): Promise<TicketType | null> {
        const conn = await this.getConnection(db);
        const existingTicket = await this.findById(id, conn);
        if (!existingTicket) return null;

        const updatedTicket = {
            ...existingTicket,
            ...ticket
        };

        await conn.run(
            `UPDATE Ticket SET description = ?, status = ?, clientId = ? WHERE id = ?`,
            updatedTicket.description || null,
            updatedTicket.status,
            updatedTicket.clientId,
            id
        );
        return this.findById(id, conn);
    }

    public async delete(id: number, db?: Database): Promise<boolean> {
        const conn = await this.getConnection(db);
        const result = await conn.run(
            `DELETE FROM Ticket WHERE id = ?`,
            id
        );
        return (result.changes ?? 0) > 0;
    }
}

export default new TicketModel();