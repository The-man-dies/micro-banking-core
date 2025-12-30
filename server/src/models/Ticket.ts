import type { Database } from "sqlite";
import logger from "../config/logger";
import { getDbConnection } from "../services/database";
import { TicketType, TicketDto } from '../types/ticket.types';

export interface TicketModel {
    create(ticket: TicketDto, db: Database): Promise<TicketType>;
    findById(id: string): Promise<TicketType | null>;
    update(id: string, ticket: Partial<TicketType>): Promise<TicketType | null>;
    delete(id: string): Promise<boolean>;
}

class Ticket implements TicketModel {
    public async create(ticket: TicketDto, db: Database): Promise<TicketType> {
        try {
            const result = await db.run(
            `INSERT INTO Ticket (description, status, clientId) VALUES (?, ?, ?)`,
            ticket.description || null,
            ticket.status,
            ticket.clientId
        );
        return {
            id: result.lastID?.toString() || '',
            ...ticket
        };
        }
        catch (error) {
            
            logger.error('Error creating ticket:', { error });
            throw error;
        }
    }

    public async findById(id: string): Promise<TicketType | null> {
        let dbConnection = await getDbConnection();
        try {
            const row = await dbConnection.get(
                `SELECT * FROM Ticket WHERE id = ?`,
                id
            );
            if (!row) return null;
            return {
                id: row.id.toString(),
                description: row.description,
                status: row.status,
                clientId: row.clientId
            };
        } catch (error) {
            logger.error('Error finding ticket by ID:', { error });
            throw error;
        } finally {

        }

    }

    public async update(id: string, ticket: Partial<TicketType>): Promise<TicketType | null> {
        let dbConnection = await getDbConnection();
        try {
            const existingTicket = await this.findById(id);
            if (!existingTicket) return null;
            const updatedTicket = {
                ...existingTicket,
                ...ticket
            };
            await dbConnection.run(
                `UPDATE Ticket SET description = ?, status = ?, clientId = ? WHERE id = ?`,
                updatedTicket.description || null,
                updatedTicket.status,
                updatedTicket.clientId,
                id
            );
            return updatedTicket;
        } catch (error) {
            logger.error('Error updating ticket:', { error });
            throw error;
        } finally {

        }
    }

    public async delete(id: string): Promise<boolean> {
        let dbConnection = await getDbConnection();
        try {
            const result = await dbConnection.run(
                `DELETE FROM Ticket WHERE id = ?`,
                id
            );
            return result.changes !== undefined && result.changes > 0;
        } catch (error) {
            logger.error('Error deleting ticket:', { error });
            throw error;
        } finally {

        }
    }
}

export default new Ticket();