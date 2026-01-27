import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Client from '../models/Client';
import Ticket from '../models/Ticket';
import Transaction from '../models/Transaction';
import { databaseService } from '../services/database';
import { ClientDto } from '../types/client.types';

export const createClient = async (req: AuthRequest, res: Response) => {
    const db = await databaseService.getDbConnection();
    try {
        const { montantEngagement, ...clientData } = req.body as ClientDto & { montantEngagement: number };

        await db.run('BEGIN');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const newClient = await Client.create({
            ...clientData,
            accountBalance: 0,
            montantEngagement: montantEngagement,
            accountExpiresAt: expiresAt.toISOString(),
            status: 'active',
        }, db);

        await Transaction.create({
            clientId: newClient.id,
            amount: montantEngagement,
            type: 'FraisInscription',
            description: `Frais d'inscription initiaux.`
        }, db);

        await Ticket.create({
            description: `Ticket initial pour le client ${newClient.id}`,
            status: 'active',
            clientId: newClient.id,
        }, db);
        
        await db.run('COMMIT');

        logger.info('Client, transaction, and ticket created successfully', { clientId: newClient.id });
        return ApiResponse.success(res, 'Client created successfully', { client: newClient }, 201);

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error creating client:', { error });
        return ApiResponse.error(res, 'Failed to create client', null, 500);
    }
};

export const depositToAccount = async (req: AuthRequest, res: Response) => {
    const db = await databaseService.getDbConnection();
    try {
        const clientId = parseInt(req.params.id, 10);
        const { amount } = req.body;

        await db.run('BEGIN');

        const client = await Client.findById(clientId, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        if (client.status === 'expired') {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Cannot deposit to an expired account. Please renew first.', null, 403);
        }
        
        // New business rule: deposit amount must match montantEngagement
        if (amount !== client.montantEngagement) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, `Le montant du dépôt (${amount} F) doit être égal au montant d'engagement du client (${client.montantEngagement} F).`, null, 400);
        }
        
        const newBalance = client.accountBalance + amount;
        await Client.update(clientId, { accountBalance: newBalance }, db);
        
        await Transaction.create({
            clientId: client.id,
            amount: amount,
            type: 'Depot',
            description: `Dépôt sur le compte.`
        }, db);

        await db.run('COMMIT');

        logger.info(`Deposited ${amount} to client account ${clientId}. New balance: ${newBalance}`);
        return ApiResponse.success(res, 'Deposit successful', { newBalance });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error depositing to client account:', { error });
        return ApiResponse.error(res, 'Failed to make deposit', null, 500);
    }
};

export const renewAccount = async (req: AuthRequest, res: Response) => {
    const db = await databaseService.getDbConnection();
    try {
        const clientId = parseInt(req.params.id, 10);
        const { fraisReactivation } = req.body;

        await db.run('BEGIN');

        const client = await Client.findById(clientId, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        await Client.update(clientId, {
            montantEngagement: fraisReactivation,
            accountExpiresAt: newExpiresAt.toISOString(),
            status: 'active'
        }, db);
        
        await Transaction.create({
            clientId: client.id,
            amount: fraisReactivation,
            type: 'FraisReactivation',
            description: `Frais de réactivation du compte.`
        }, db);

        await Ticket.create({
            description: `Ticket de renouvellement pour le client ${client.id}`,
            status: 'active',
            clientId: client.id,
        }, db);

        await db.run('COMMIT');

        logger.info(`Client account ${clientId} renewed successfully.`);
        return ApiResponse.success(res, 'Account renewed successfully', { clientId: clientId });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error renewing client account:', { error });
        return ApiResponse.error(res, 'Failed to renew account', null, 500);
    }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
    try {
        const clientId = parseInt(req.params.id, 10);
        const client = await Client.findById(clientId);
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
        const db = await databaseService.getDbConnection();
        const clients = await db.all('SELECT * FROM Client');
        return ApiResponse.success(res, 'Clients retrieved successfully', clients);
    } catch (error) {
        logger.error('Error retrieving clients:', { error });
        return ApiResponse.error(res, 'Failed to retrieve clients', null, 500);
    }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
    try {
        const clientId = parseInt(req.params.id, 10);
        const clientData: Partial<ClientDto> = req.body;
        const updatedClient = await Client.update(clientId, clientData);
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
        const clientId = parseInt(req.params.id, 10);
        const deleted = await Client.delete(clientId);
        if (!deleted) {
            return ApiResponse.error(res, 'Client not found', null, 404);
        }
        return ApiResponse.success(res, 'Client deleted successfully', null, 204);
    } catch (error) {
        logger.error('Error deleting client:', { error });
        return ApiResponse.error(res, 'Failed to delete client', null, 500);
    }
};

export const payoutClientAccount = async (req: AuthRequest, res: Response) => {
    const db = await databaseService.getDbConnection();
    try {
        const clientId = parseInt(req.params.id, 10);

        await db.run('BEGIN');

        const client = await Client.findById(clientId, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        const amountToPayout = client.accountBalance;

        if (amountToPayout <= 0) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'No balance to payout for this client.', null, 400);
        }

        await Client.update(clientId, { accountBalance: 0, status: 'expired' }, db); 

        await Transaction.create({
            clientId: client.id,
            amount: amountToPayout,
            type: 'Retrait',
            description: `Retrait complet du solde du compte après cycle de 30 jours.`
        }, db);

        await db.run('COMMIT');

        logger.info(`Client account ${clientId} paid out successfully. Amount: ${amountToPayout}`);
        return ApiResponse.success(res, 'Client account paid out successfully', { clientId, amountPaidOut: amountToPayout });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error paying out client account:', { error });
        return ApiResponse.error(res, 'Failed to pay out client account', null, 500);
    }
};
