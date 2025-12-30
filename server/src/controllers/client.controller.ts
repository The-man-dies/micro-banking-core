import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Client from '../models/Client';
import Ticket from '../models/Ticket';
import { getDbConnection } from '../services/database';
import { ClientDto, ClientType } from '../types/client.types';

export const createClient = async (req: AuthRequest, res: Response) => {
    const db = await getDbConnection();
    try {
        const clientData: ClientDto = req.body;

        // Start transaction
        await db.run('BEGIN');

        // 1. Create the client
        const newClient = await Client.create(clientData, db);

        // 2. Create the associated unique ticket
        const newTicket = await Ticket.create({
            description: `Ticket for client ${newClient.firstname}`,
            status: 'active',
            clientId: newClient.id,
        }, db);
        
        // Commit transaction
        await db.run('COMMIT');

        logger.info('Client and associated ticket created successfully', { clientId: newClient.id, ticketId: newTicket.id });
        return ApiResponse.success(res, 'Client created successfully', { client: newClient, ticket: newTicket }, 201);

    } catch (error) {
        // Rollback transaction
        await db.run('ROLLBACK');
        logger.error('Error creating client:', { error });
        return ApiResponse.error(res, 'Failed to create client', null, 500);
    }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const client = await Client.findById(id);
        if (!client) {
            return ApiResponse.error(res, 'Client not found', null, 404);
        }
        return ApiResponse.success(res, 'Client retrieved successfully', client);
    } catch (error) {
        logger.error('Error retrieving client:', { error });
        return ApiResponse.error(res, 'Failed to retrieve client', null, 500);
    }
};

export const getAllClients = async (req: AuthRequest, res: Response) => {
    try {
        const db = await getDbConnection();
        const clients = await db.all('SELECT * FROM Client');
        return ApiResponse.success(res, 'Clients retrieved successfully', clients);
    } catch (error) {
        logger.error('Error retrieving clients:', { error });
        return ApiResponse.error(res, 'Failed to retrieve clients', null, 500);
    }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const clientData: Partial<ClientDto> = req.body;
        const updatedClient = await Client.update(id, clientData);
        if (!updatedClient) {
            return ApiResponse.error(res, 'Client not found', null, 404);
        }
        return ApiResponse.success(res, 'Client updated successfully', updatedClient);
    } catch (error) {
        logger.error('Error updating client:', { error });
        return ApiResponse.error(res, 'Failed to update client', null, 500);
    }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Client.delete(id);
        if (!deleted) {
            return ApiResponse.error(res, 'Client not found', null, 404);
        }
        return ApiResponse.success(res, 'Client deleted successfully', null, 204);
    } catch (error) {
        logger.error('Error deleting client:', { error });
        return ApiResponse.error(res, 'Failed to delete client', null, 500);
    }
};

export const renewAccount = async (req: AuthRequest, res: Response) => {
    try {
        const client = req.client; // From checkAccountStatus middleware

        if (!client) {
            return ApiResponse.error(res, 'Client not found or middleware failed', null, 404);
        }

        if (client.accountBalance < client.initialDeposit) {
            return ApiResponse.error(res, 'Insufficient balance to renew account', {
                required: client.initialDeposit,
                balance: client.accountBalance
            }, 400);
        }

        const newBalance = client.accountBalance - client.initialDeposit;
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        const updatedClient = await Client.update(client.id, {
            accountBalance: newBalance,
            accountExpiresAt: newExpiresAt.toISOString(),
            status: 'active'
        });

        logger.info(`Client account ${client.id} renewed successfully.`);
        return ApiResponse.success(res, 'Account renewed successfully', updatedClient);

    } catch (error) {
        logger.error('Error renewing client account:', { error });
        return ApiResponse.error(res, 'Failed to renew account', null, 500);
    }
};

export const depositToAccount = async (req: AuthRequest, res: Response) => {
    try {
        const client = req.client; // From checkAccountStatus middleware
        const { amount } = req.body;

        if (!client) {
            return ApiResponse.error(res, 'Client not found or middleware failed', null, 404);
        }

        // Block deposits to expired accounts
        if (client.status === 'expired') {
            return ApiResponse.error(res, 'Cannot deposit to an expired account. Please renew first.', null, 403);
        }

        if (typeof amount !== 'number' || amount <= 0) {
            return ApiResponse.error(res, 'Invalid deposit amount', null, 400);
        }

        const newBalance = client.accountBalance + amount;

        const updatedClient = await Client.update(client.id, {
            accountBalance: newBalance
        });

        logger.info(`Deposited ${amount} to client account ${client.id}. New balance: ${newBalance}`);
        return ApiResponse.success(res, 'Deposit successful', updatedClient);

    } catch (error) {
        logger.error('Error depositing to client account:', { error });
        return ApiResponse.error(res, 'Failed to make deposit', null, 500);
    }
};
