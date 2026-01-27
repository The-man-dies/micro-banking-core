import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express.d';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import Client from '../models/Client';
import { databaseService } from '../services/database';

export const checkAccountStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        if (!id) {
            return ApiResponse.error(res, 'Client ID is required in URL parameters', null, 400);
        }

        let client = await Client.findById(id);
        if (!client) {
            return ApiResponse.error(res, 'Client not found', null, 404);
        }

        const now = new Date();
        const expiresAt = new Date(client.accountExpiresAt);

        // Check if the account is expired and the status needs updating
        if (now > expiresAt && client.status === 'active') {
            logger.info(`Client account ${client.id} has expired. Updating status.`);
            const db = await databaseService.getDbConnection();
            await db.run('UPDATE Client SET status = ? WHERE id = ?', ['expired', client.id]);
            client.status = 'expired'; // Update the object for the current request
        }
        
        // Attach client to the request object for subsequent middleware/controllers
        req.client = client;

        next();

    } catch (error) {
        logger.error('Error in checkAccountStatus middleware:', { error });
        return ApiResponse.error(res, 'Server error while checking account status', null, 500);
    }
};
