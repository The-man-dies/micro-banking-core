import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Accounting from '../models/Accounting';
import { databaseService } from '../services/database';

export const getAccountingStats = async (req: AuthRequest, res: Response) => {
    try {
        const currentFiscalYear = await databaseService.getCurrentFiscalYear();
        const accountingData = await Accounting.getAccountingData(currentFiscalYear);
        return ApiResponse.success(res, 'Accounting data retrieved successfully', accountingData);

    } catch (error: any) {
        logger.error('Error retrieving accounting data:', { message: error.message, stack: error.stack });
        return ApiResponse.error(res, 'Failed to retrieve accounting data', null, 500);
    }
};
