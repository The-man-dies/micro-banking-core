import type { Database } from "sqlite";
import logger from "../config/logger";
import type { TransactionDto, TransactionType } from '../types/transaction.types';

export interface ITransactionModel {
    create(transaction: TransactionDto, db: Database): Promise<TransactionType>;
    getAll(db: Database): Promise<TransactionType[]>;
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

    public async getAll(db: Database): Promise<(TransactionType & { agentId: number })[]> {
        try {
            const transactions = await db.all<(TransactionType & { agentId: number })[]>(
                `SELECT t.*, c.agentId FROM Transactions AS t JOIN Client AS c ON t.clientId = c.id ORDER BY t.createdAt DESC`
            );
            return transactions;
        } catch (error) {
            logger.error('Error fetching all transactions:', { error });
            throw error;
        }
    }
}

export default new TransactionModel();
