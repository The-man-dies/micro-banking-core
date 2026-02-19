import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Stats from '../models/Stats';
import { databaseService } from '../services/database';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const currentFiscalYear = await databaseService.getCurrentFiscalYear();
        const generalKPIs = await Stats.getGeneralKPIs(currentFiscalYear);
        const financialStats = await Stats.getFinancialStats(currentFiscalYear);

        const allStats = {
            ...generalKPIs,
            ...financialStats,
        };

        return ApiResponse.success(res, 'Dashboard stats retrieved successfully', allStats);

    } catch (error: any) {
        logger.error('Error retrieving dashboard stats:', { message: error.message, stack: error.stack });
        return ApiResponse.error(res, 'Failed to retrieve dashboard stats', null, 500);
    }
};

export const getTimeSeriesStats = async (req: AuthRequest, res: Response) => {
    try {
        const currentFiscalYear = await databaseService.getCurrentFiscalYear();
        const timeSeriesData = await Stats.getTimeSeriesData(currentFiscalYear);
        return ApiResponse.success(res, 'Time series data retrieved successfully', timeSeriesData);

    } catch (error: any) {
        logger.error('Error retrieving time series data:', { message: error.message, stack: error.stack });
        return ApiResponse.error(res, 'Failed to retrieve time series data', null, 500);
    }
};
