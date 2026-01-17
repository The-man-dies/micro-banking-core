import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d';
import Stats from '../models/Stats';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const generalKPIs = await Stats.getGeneralKPIs();
        const financialStats = await Stats.getFinancialStats();

        const allStats = {
            ...generalKPIs,
            ...financialStats,
        };

        return ApiResponse.success(res, 'Dashboard stats retrieved successfully', allStats);

    } catch (error) {
        logger.error('Error retrieving dashboard stats:', { error });
        return ApiResponse.error(res, 'Failed to retrieve dashboard stats', null, 500);
    }
};

export const getTimeSeriesStats = async (req: AuthRequest, res: Response) => {
    try {
        const timeSeriesData = await Stats.getTimeSeriesData();
        return ApiResponse.success(res, 'Time series data retrieved successfully', timeSeriesData);

    } catch (error) {
        logger.error('Error retrieving time series data:', { error });
        return ApiResponse.error(res, 'Failed to retrieve time series data', null, 500);
    }
};
