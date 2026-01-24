import { Request, Response } from 'express';
import { getDbConnection } from '../services/database';
import Transaction from '../models/Transaction';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';

export const getAllTransactions = async (req: Request, res: Response) => {
    try {
        const db = await getDbConnection();
        const transactions = await Transaction.getAll(db);
        return ApiResponse.success(res, 'Transactions retrieved successfully', transactions);
    } catch (error) {
        logger.error('Failed to get all transactions', { error });
        return ApiResponse.error(res, 'Server error while fetching transactions');
    }
};
