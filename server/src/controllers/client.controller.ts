import { Response } from "express";
import prisma from "../services/prisma";
import logger from "../config/logger";
import { AuthRequest } from "../types/express.d";
import Client from "../models/Client";
import Ticket from "../models/Ticket";
import Transaction from "../models/Transaction";
import { ClientDto } from "../types/client.types";
import { ApiResponse } from "../utils/response.handler";
import { TransactionType } from "../types/transaction.types";
import { Prisma } from "@prisma/client";
import { databaseService } from "../services/database";

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { montantEngagement, ...clientData } = req.body as ClientDto;
    const currentFiscalYear = await databaseService.getCurrentFiscalYear();

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const newClient = await Client.create(
          {
            ...clientData,
            accountBalance: 0,
            montantEngagement: montantEngagement,
            accountExpiresAt: expiresAt.toISOString(),
            status: "active",
          },
          tx,
          currentFiscalYear,
        );

        await Transaction.create(
          {
            clientId: newClient.id as unknown as number,
            amount: montantEngagement,
            type: TransactionType.FraisInscription,
            description: `Frais d'inscription initiaux.`,
          },
          tx,
          currentFiscalYear,
        );

        await Ticket.create(
          {
            description: `Ticket initial pour le client ${newClient.id}`,
            status: "active",
            clientId: newClient.id as unknown as number,
          },
          tx,
          currentFiscalYear,
        );

        return newClient;
      },
      { timeout: 15000, maxWait: 10000 },
    );

    logger.info("Client, transaction, and ticket created successfully", {
      clientId: result.id,
    });
    return ApiResponse.success(
      res,
      "Client created successfully",
      { client: result },
      201,
    );
  } catch (error) {
    logger.error(`Error creating client: ${error}`);
    return ApiResponse.error(res, "Failed to create client", null, 500);
  }
};

export const depositToAccount = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const { amount } = req.body;
    const currentFiscalYear = await databaseService.getCurrentFiscalYear();

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const client = await Client.findById(clientId, tx);
        if (!client) {
          throw new Error("Client not found");
        }

        if (client.status === "expired") {
          throw new Error(
            "Cannot deposit to an expired account. Please renew first.",
          );
        }

        if (amount !== client.montantEngagement) {
          throw new Error(
            `Le montant du dépôt (${amount} F) doit être égal au montant d'engagement du client (${client.montantEngagement} F).`,
          );
        }

        const newBalance = client.accountBalance + amount;
        await Client.update(clientId, { accountBalance: newBalance }, tx);

        await Transaction.create(
          {
            clientId: client.id as unknown as number,
            amount: amount,
            type: "Depot",
            description: `Dépôt sur le compte.`,
          },
          tx,
          currentFiscalYear,
        );

        return { newBalance };
      },
      { timeout: 15000, maxWait: 10000 },
    );

    logger.info(
      `Deposited ${amount} to client account ${clientId}. New balance: ${result.newBalance}`,
    );
    return ApiResponse.success(res, "Deposit successful", result);
  } catch (error: any) {
    logger.error("Error depositing to client account:", { error });
    const message = error.message || "Failed to make deposit";
    const status = message.includes("not found")
      ? 404
      : message.includes("expired")
        ? 403
        : message.includes("montant")
          ? 400
          : 500;
    return ApiResponse.error(res, message, null, status);
  }
};

export const renewAccount = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const { fraisReactivation } = req.body;
    const currentFiscalYear = await databaseService.getCurrentFiscalYear();

    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const client = await Client.findById(clientId, tx);
        if (!client) {
          throw new Error("Client not found");
        }

        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        await Client.update(
          clientId,
          {
            montantEngagement: fraisReactivation,
            accountExpiresAt: newExpiresAt.toISOString(),
            status: "active",
          },
          tx,
        );

        await Transaction.create(
          {
            clientId: client.id as unknown as number,
            amount: fraisReactivation,
            type: "FraisReactivation",
            description: `Frais de réactivation du compte.`,
          },
          tx,
          currentFiscalYear,
        );

        await Ticket.create(
          {
            description: `Ticket de renouvellement pour le client ${client.id}`,
            status: "active",
            clientId: client.id as unknown as number,
          },
          tx,
          currentFiscalYear,
        );
      },
      { timeout: 15000, maxWait: 10000 },
    );

    logger.info(`Client account ${clientId} renewed successfully.`);
    return ApiResponse.success(res, "Account renewed successfully", {
      clientId: clientId,
    });
  } catch (error: any) {
    logger.error("Error renewing client account:", { error });
    const message = error.message || "Failed to renew account";
    const status = message.includes("not found") ? 404 : 500;
    return ApiResponse.error(res, message, null, status);
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const client = await Client.findById(clientId);
    if (!client) {
      return ApiResponse.error(res, "Client not found", null, 404);
    }
    return ApiResponse.success(res, "Client retrieved successfully", client);
  } catch (error) {
    logger.error("Error retrieving client:", { error });
    return ApiResponse.error(res, "Failed to retrieve client", null, 500);
  }
};

export const getAllClients = async (req: AuthRequest, res: Response) => {
  try {
    const clients = await prisma.client.findMany();
    return ApiResponse.success(res, "Clients retrieved successfully", clients);
  } catch (error) {
    logger.error("Error retrieving clients:", { error });
    return ApiResponse.error(res, "Failed to retrieve clients", null, 500);
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const clientData: Partial<ClientDto> = req.body;
    const updatedClient = await Client.update(clientId, clientData);
    if (!updatedClient) {
      return ApiResponse.error(res, "Client not found", null, 404);
    }
    return ApiResponse.success(
      res,
      "Client updated successfully",
      updatedClient,
    );
  } catch (error) {
    logger.error("Error updating client:", { error });
    return ApiResponse.error(res, "Failed to update client", null, 500);
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const deleted = await Client.delete(clientId);
    if (!deleted) {
      return ApiResponse.error(res, "Client not found", null, 404);
    }
    return ApiResponse.success(res, "Client deleted successfully", null, 204);
  } catch (error) {
    logger.error("Error deleting client:", { error });
    return ApiResponse.error(res, "Failed to delete client", null, 500);
  }
};

export const payoutClientAccount = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const { amount: withdrawalAmount } = req.body;
    const currentFiscalYear = await databaseService.getCurrentFiscalYear();

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const client = await Client.findById(clientId, tx);
        if (!client) {
          throw new Error("Client not found");
        }

        if (withdrawalAmount <= 0) {
          throw new Error("Le montant du retrait doit être supérieur à zéro.");
        }

        if (client.accountBalance === 0) {
          throw new Error(
            "Impossible de retirer. Le solde du compte est de zéro.",
          );
        }

        if (withdrawalAmount > client.accountBalance) {
          throw new Error(
            "Le montant du retrait ne peut pas être supérieur au solde disponible.",
          );
        }

        const newBalance = client.accountBalance - withdrawalAmount;
        let newStatus = client.status;
        const now = new Date();
        const expiresAt = new Date(client.accountExpiresAt);

        if (newBalance === 0 && now > expiresAt) {
          newStatus = "expired";
        }

        await Client.update(
          clientId,
          { accountBalance: newBalance, status: newStatus },
          tx,
        );

        await Transaction.create(
          {
            clientId: client.id as unknown as number,
            amount: withdrawalAmount,
            type: "Retrait",
            description: `Retrait du compte.`,
          },
          tx,
          currentFiscalYear,
        );

        return { newBalance, withdrawalAmount };
      },
      { timeout: 15000, maxWait: 10000 },
    );

    logger.info(
      `Client account ${clientId} withdrawn successfully. Amount: ${result.withdrawalAmount}. New balance: ${result.newBalance}`,
    );
    return ApiResponse.success(res, "Client account withdrawn successfully", {
      clientId,
      amountWithdrawn: result.withdrawalAmount,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    logger.error("Error processing client account withdrawal:", { error });
    const message =
      error.message || "Failed to process client account withdrawal";
    const status = message.includes("not found")
      ? 404
      : message.includes("supérieur") || message.includes("zéro")
        ? 400
        : 500;
    return ApiResponse.error(res, message, null, status);
  }
};

export const expireClientAccount = async (req: AuthRequest, res: Response) => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const currentFiscalYear = await databaseService.getCurrentFiscalYear();

    await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const client = await Client.findById(clientId, tx);
        if (!client) {
          throw new Error("Client not found");
        }

        if (client.accountBalance !== 0) {
          throw new Error("Cannot expire account with a non-zero balance.");
        }

        await Client.update(clientId, { status: "expired" }, tx);

        await Transaction.create(
          {
            clientId: client.id as unknown as number,
            amount: 0,
            type: TransactionType.Expiration,
            description: `Account manually expired by admin.`,
          },
          tx,
          currentFiscalYear,
        );
      },
      { timeout: 15000, maxWait: 10000 },
    );

    logger.info(`Client account ${clientId} expired successfully.`);
    return ApiResponse.success(
      res,
      "Client account expired successfully",
      null,
      200,
    );
  } catch (error: any) {
    logger.error("Error expiring client account:", { error });
    const message = error.message || "Failed to expire client account";
    const status = message.includes("not found") ? 404 : 400;
    return ApiResponse.error(res, message, null, status);
  }
};
