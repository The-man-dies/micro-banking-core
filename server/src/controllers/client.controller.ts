import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Client from '../models/Client';
import Ticket from '../models/Ticket';
import Transaction from '../models/Transaction';
import { getDbConnection } from '../services/database';
import { ClientDto } from '../types/client.types';

export const createClient = async (req: AuthRequest, res: Response) => {
    const db = await getDbConnection();
    try {
        const { montantEngagement, ...clientData } = req.body as ClientDto & { montantEngagement: number };

        if (typeof montantEngagement !== 'number' || montantEngagement <= 0) {
            return ApiResponse.error(res, 'Le montant de l"engagement est invalide.', null, 400);
        }

        await db.run('BEGIN');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const newClient = await Client.create({
            ...clientData,
            accountBalance: 0, // Le solde commence à 0
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
    const db = await getDbConnection();
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (typeof amount !== 'number' || amount <= 0) {
            return ApiResponse.error(res, 'Montant du dépôt invalide', null, 400);
        }

        await db.run('BEGIN');

        const client = await Client.findById(id, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        if (client.status === 'expired') {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Cannot deposit to an expired account. Please renew first.', null, 403);
        }
        
        const newBalance = client.accountBalance + amount;
        await Client.update(id, { accountBalance: newBalance }, db);
        
        await Transaction.create({
            clientId: client.id,
            amount: amount,
            type: 'Depot',
            description: `Dépôt sur le compte.`
        }, db);

        await db.run('COMMIT');

        logger.info(`Deposited ${amount} to client account ${id}. New balance: ${newBalance}`);
        return ApiResponse.success(res, 'Deposit successful', { newBalance });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error depositing to client account:', { error });
        return ApiResponse.error(res, 'Failed to make deposit', null, 500);
    }
};

export const renewAccount = async (req: AuthRequest, res: Response) => {
    const db = await getDbConnection();
    try {
        const { id } = req.params;
        const { fraisReactivation } = req.body;

        if (typeof fraisReactivation !== 'number' || fraisReactivation <= 0) {
            return ApiResponse.error(res, 'Les frais de réactivation sont invalides', null, 400);
        }

        await db.run('BEGIN');

        const client = await Client.findById(id, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);

        await Client.update(id, {
            montantEngagement: fraisReactivation, // Le nouvel engagement
            accountExpiresAt: newExpiresAt.toISOString(),
            status: 'active'
        }, db);
        
        await Transaction.create({
            clientId: client.id,
            amount: fraisReactivation,
            type: 'FraisReactivation',
            description: `Frais de réactivation du compte.`
        }, db);

        await db.run('COMMIT');

        logger.info(`Client account ${id} renewed successfully.`);
        return ApiResponse.success(res, 'Account renewed successfully', { clientId: id });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error renewing client account:', { error });
        return ApiResponse.error(res, 'Failed to renew account', null, 500);
    }
};


// Unchanged functions
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

export const payoutClientAccount = async (req: AuthRequest, res: Response) => {
    const db = await getDbConnection();
    try {
        const { id } = req.params;

        await db.run('BEGIN');

        const client = await Client.findById(id, db);
        if (!client) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        const amountToPayout = client.accountBalance;

        if (amountToPayout <= 0) {
            await db.run('ROLLBACK');
            return ApiResponse.error(res, 'No balance to payout for this client.', null, 400);
        }

        // Set account balance to 0 and status to expired after payout
        await Client.update(id, { accountBalance: 0, status: 'expired' }, db); 

        // Log the withdrawal transaction
        await Transaction.create({
            clientId: client.id,
            amount: amountToPayout,
            type: 'Retrait',
            description: `Retrait complet du solde du compte après cycle de 30 jours.`
        }, db);

        await db.run('COMMIT');

        logger.info(`Client account ${id} paid out successfully. Amount: ${amountToPayout}`);
        return ApiResponse.success(res, 'Client account paid out successfully', { clientId: id, amountPaidOut: amountToPayout });

    } catch (error) {
        await db.run('ROLLBACK');
        logger.error('Error paying out client account:', { error });
        return ApiResponse.error(res, 'Failed to pay out client account', null, 500);
    }
};

