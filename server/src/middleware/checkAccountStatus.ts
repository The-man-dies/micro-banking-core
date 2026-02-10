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

        
        const isDepositOperation = req.method === 'POST' && req.originalUrl.includes('/deposit');
        const isPayoutOperation = req.method === 'POST' && req.originalUrl.includes('/payout');

        if (client.status === 'withdraw_only') {
            if (isDepositOperation) {
                return ApiResponse.error(res, 'Deposits are not allowed in withdraw_only status.', null, 403);
            }
        } else if (client.status === 'expired') {
            if (isDepositOperation || isPayoutOperation) {
                return ApiResponse.error(res, 'Account is expired. No transactions allowed.', null, 403);
            }
        }
        
        // Attach client to the request object for subsequent middleware/controllers
        req.client = client;

        next();

    } catch (error) {
        logger.error('Error in checkAccountStatus middleware:', { error });
        return ApiResponse.error(res, 'Server error while checking account status', null, 500);
    }
};
