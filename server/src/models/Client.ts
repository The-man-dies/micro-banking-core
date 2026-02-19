import type { Database } from "sqlite";
import logger from "../config/logger";
import { databaseService } from "../services/database";
import { ClientType, ClientDto } from "../types/client.types";

export interface IClientModel {
  create(client: Partial<ClientDto>, db: Database): Promise<ClientType>;
  findById(id: string | number, db?: Database): Promise<ClientType | null>;
  update(
    id: string | number,
    client: Partial<ClientType>,
    db?: Database,
  ): Promise<ClientType | null>;
  delete(id: string | number, db?: Database): Promise<boolean>;
}

class ClientModel implements IClientModel {
  private async getConnection(db?: Database): Promise<Database> {
    return db || databaseService.getDbConnection();
  }

  public async create(
    client: Partial<ClientDto>,
    db: Database,
  ): Promise<ClientType> {
    try {
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();
      const result = await db.run(
        `INSERT INTO Client (firstname, lastname, email, phone, location, agentId, accountBalance, montantEngagement, accountExpiresAt, status, createdFiscalYear) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        client.firstname,
        client.lastname,
        client.email || null,
        client.phone,
        client.location,
        client.agentId,
        client.accountBalance,
        client.montantEngagement,
        client.accountExpiresAt,
        client.status,
        currentFiscalYear,
      );

      const created = await this.findById<ClientType>(result.lastID!, db);
      if (!created) {
        throw new Error("Failed to create or find client after insertion.");
      }
      return created;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "unknown error", {
        error,
      });
      throw error;
    }
  }

  public async findById<T = any>(
    id: string | number,
    db?: Database,
  ): Promise<ClientType | null> {
    const conn = await this.getConnection(db);
    const row = await conn.get<ClientType>(
      `SELECT * FROM Client WHERE id = ?`,
      id,
    );
    return row || null;
  }

  public async update(
    id: string | number,
    client: Partial<ClientType>,
    db?: Database,
  ): Promise<ClientType | null> {
    try {
      const conn = await this.getConnection(db);
      const existing = await this.findById(id, conn);
      if (!existing) return null;

      const updatedClient = { ...existing, ...client };

      await conn.run(
        `UPDATE Client SET firstname = ?, lastname = ?, email = ?, phone = ?, location = ?, agentId = ?, accountBalance = ?, montantEngagement = ?, accountExpiresAt = ?, status = ? WHERE id = ?`,
        updatedClient.firstname,
        updatedClient.lastname,
        updatedClient.email,
        updatedClient.phone,
        updatedClient.location,
        updatedClient.agentId,
        updatedClient.accountBalance,
        updatedClient.montantEngagement,
        updatedClient.accountExpiresAt,
        updatedClient.status,
        id,
      );
      return this.findById(id, conn);
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "unknown error");
      throw error;
    }
  }

  public async delete(id: string | number, db?: Database): Promise<boolean> {
    try {
      const conn = await this.getConnection(db);
      const result = await conn.run(`DELETE FROM Client WHERE id = ?`, id);
      return (result.changes ?? 0) > 0;
    } catch (error) {
      logger.error(error instanceof Error ? error.message : "unknown error", {
        error,
      });
      throw error;
    }
  }
}

export default new ClientModel();
