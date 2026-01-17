import type { Database } from "sqlite";
import logger from "../config/logger";
import { TransactionDto, TransactionType } from '../types/transaction.types';

export interface ITransactionModel {
    create(transaction: TransactionDto, db: Database): Promise<TransactionType>;
}

class TransactionModel implements ITransactionModel {
    public async create(transaction: TransactionDto, db: Database): Promise<TransactionType> {
        try {
            const result = await db.run(
                `INSERT INTO Transactions (clientId, amount, type, description) VALUES (?, ?, ?, ?)`,
                transaction.clientId,
                transaction.amount,
                transaction.type,
                transaction.description
            );

            // SQLite does not return the created object, so we find it by lastID
            const createdTransaction = await db.get<TransactionType>(
                `SELECT * FROM Transactions WHERE id = ?`,
                result.lastID
            );
            
            if (!createdTransaction) {
                throw new Error('Failed to retrieve created transaction.');
            }

            return createdTransaction;

        } catch (error) {
            logger.error('Error creating transaction:', { error });
            throw error;
        }
    }
}

export default new TransactionModel();
