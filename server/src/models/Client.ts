import type { Database } from "sqlite";
import logger from "../config/logger";
import { getDbConnection } from "../services/database";
import { ClientType, ClientDto } from '../types/client.types';

export interface ClientModel {
    create(client: ClientDto, db: Database): Promise<ClientType>; // Pass db for transactions
    findById(id: string): Promise<ClientType | null>;
    update(id: string, client: Partial<ClientType>): Promise<ClientType | null>;
    delete(id: string): Promise<boolean>;
}

class Client implements ClientModel {
    public async create(client: ClientDto, db: Database): Promise<ClientType> {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        const status = 'active';

        const result = await db.run(
            `INSERT INTO Client (firstname, lastname, email, agentId, accountBalance, accountExpiresAt, initialDeposit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            client.firstname,
            client.lastname,
            client.email || null,
            client.agentId,
            0, // Initial balance
            expiresAt.toISOString(),
            client.initialDeposit,
            status
        );

        return {
            id: result.lastID!.toString(),
            accountBalance: 0,
            accountExpiresAt: expiresAt.toISOString(),
            status: status,
            ...client
        };
    }

    public async findById(id: string): Promise<ClientType | null> {
        const db = await getDbConnection();
        const row = await db.get(`SELECT * FROM Client WHERE id = ?`, id);
        if (!row) return null;
        return row as ClientType;
    }

    public async update(id: string, client: Partial<ClientType>): Promise<ClientType | null> {
        const db = await getDbConnection();
        const existing = await this.findById(id);
        if (!existing) return null;

        const updatedClient = { ...existing, ...client };

        await db.run(
            `UPDATE Client SET firstname = ?, lastname = ?, email = ?, agentId = ?, accountBalance = ?, accountExpiresAt = ?, initialDeposit = ?, status = ? WHERE id = ?`,
            updatedClient.firstname,
            updatedClient.lastname,
            updatedClient.email,
            updatedClient.agentId,
            updatedClient.accountBalance,
            updatedClient.accountExpiresAt,
            updatedClient.initialDeposit,
            updatedClient.status,
            id
        );
        return updatedClient;
    }

    public async delete(id: string): Promise<boolean> {
        const db = await getDbConnection();
        const result = await db.run(`DELETE FROM Client WHERE id = ?`, id);
        return result.changes! > 0;
    }
}

export default new Client();
