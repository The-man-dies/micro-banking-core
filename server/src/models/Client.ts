import { Prisma } from "@prisma/client";
import logger from "../config/logger";
import { databaseService } from "../services/database";
import globalPrisma from "../services/prisma";
import { ClientType, ClientDto } from "../types/client.types";

export interface IClientModel {
  create(
    client: Partial<ClientDto>,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType>;
  findById(
    id: string | number,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType | null>;
  update(
    id: string | number,
    client: Partial<ClientType>,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType | null>;
  delete(id: string | number, tx?: Prisma.TransactionClient): Promise<boolean>;
}

class ClientModel implements IClientModel {
  private getClient(tx?: Prisma.TransactionClient) {
    return tx || globalPrisma;
  }

  public async create(
    client: Partial<ClientDto>,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType> {
    try {
      const db = this.getClient(tx);
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();

      const result = await db.client.create({
        data: {
          firstname: client.firstname!,
          lastname: client.lastname!,
          email: client.email || null,
          phone: client.phone!,
          location: client.location || "",
          agentId: client.agentId!,
          accountBalance: client.accountBalance || 0,
          montantEngagement: client.montantEngagement || 0,
          accountExpiresAt: client.accountExpiresAt!,
          status: client.status || "active",
          createdFiscalYear: currentFiscalYear,
        },
      });

      return result as unknown as ClientType;
    } catch (error) {
      logger.error("Error creating client with Prisma:", { error });
      throw error;
    }
  }

  public async findById(
    id: string | number,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType | null> {
    try {
      const db = this.getClient(tx);
      const clientId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(clientId)) return null;

      const row = await db.client.findUnique({
        where: { id: clientId },
      });
      return (row as unknown as ClientType) || null;
    } catch (error) {
      logger.error("Error finding client with Prisma:", { error });
      throw error;
    }
  }

  public async update(
    id: string | number,
    client: Partial<ClientType>,
    tx?: Prisma.TransactionClient,
  ): Promise<ClientType | null> {
    try {
      const db = this.getClient(tx);
      const clientId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(clientId)) return null;

      const result = await db.client.update({
        where: { id: clientId },
        data: {
          firstname: client.firstname,
          lastname: client.lastname,
          email: client.email,
          phone: client.phone,
          location: client.location,
          agentId: client.agentId,
          accountBalance: client.accountBalance,
          montantEngagement: client.montantEngagement,
          accountExpiresAt: client.accountExpiresAt,
          status: client.status,
        },
      });
      return result as unknown as ClientType;
    } catch (error) {
      logger.error("Error updating client with Prisma:", { error });
      throw error;
    }
  }

  public async delete(
    id: string | number,
    tx?: Prisma.TransactionClient,
  ): Promise<boolean> {
    try {
      const db = this.getClient(tx);
      const clientId = typeof id === "string" ? parseInt(id, 10) : id;
      if (isNaN(clientId)) return false;

      await db.client.delete({
        where: { id: clientId },
      });
      return true;
    } catch (error) {
      logger.error("Error deleting client with Prisma:", { error });
      return false;
    }
  }
}

export default new ClientModel();
