import { databaseService } from '../../services/database';
import { getAllTransactions } from '../transaction.controller';
import { getAccountingStats } from '../client.controller';
import { Request, Response } from 'express';
import { Database } from 'sqlite';

// Mock Express request and response
const mockRequest = (): Partial<Request> => ({});

const mockResponse = (): Partial<Response> & {
  status: jest.Mock<any, any>;
  json: jest.Mock<any, any>;
} => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// Helper to get fiscal year for test data
const getFiscalYear = (date: Date): number => date.getFullYear();

describe('Transaction Controller', () => {
  let db: Database;
  let currentFiscalYear: number;
  let oldFiscalYear: number;

  beforeAll(async () => {
    db = await databaseService.getDbConnection();
    await databaseService.initializeDatabase(db);

    // Set current fiscal year
    currentFiscalYear = new Date().getFullYear();
    oldFiscalYear = currentFiscalYear - 1;

    // Seed AppSettings for current fiscal year
    await db.run("INSERT INTO AppSettings (fiscalYear) VALUES (?)", [currentFiscalYear]);

    // Seed data
    await db.run(`
      INSERT INTO Agent (id, firstname, lastname, createdFiscalYear) VALUES
      (1, 'Test', 'Agent', ?), (2, 'Second', 'Agent', ?)
    `, [currentFiscalYear, currentFiscalYear]);
    
    await db.run(`
      INSERT INTO Client (id, firstname, lastname, agentId, accountBalance, montantEngagement, accountExpiresAt, status, createdFiscalYear) VALUES
      (1, 'John', 'Doe', 1, 1000, 500, '2027-01-01T00:00:00Z', 'active', ?),
      (2, 'Jane', 'Smith', 1, 2500, 1000, '2027-01-01T00:00:00Z', 'active', ?),
      (3, 'Peter', 'Jones', 2, 0, 1000, '2027-01-01T00:00:00Z', 'active', ?)
    `, [currentFiscalYear, currentFiscalYear, currentFiscalYear]);

    // Transactions for current fiscal year (some within last 30 days, some older)
    await db.run(`
      INSERT INTO Transactions (clientId, amount, type, createdAt, fiscalYear) VALUES
      (1, 100, 'Depot', DATE('now', '-5 days'), ?),             -- Current FY, last 30 days
      (1, 200, 'Retrait', DATE('now', '-15 days'), ?),           -- Current FY, last 30 days
      (2, 300, 'FraisInscription', DATE('now', '-40 days'), ?), -- Current FY, older than 30 days
      (2, 400, 'Depot', DATE('now', '-60 days'), ?)              -- Current FY, older than 30 days
    `, [currentFiscalYear, currentFiscalYear, currentFiscalYear, currentFiscalYear]);

    // Transactions for old fiscal year
    await db.run(`
      INSERT INTO Transactions (clientId, amount, type, createdAt, fiscalYear) VALUES
      (3, 500, 'Depot', DATE('now', '-370 days'), ?),            -- Old FY
      (3, 600, 'Retrait', DATE('now', '-380 days'), ?)           -- Old FY
    `, [oldFiscalYear, oldFiscalYear]);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('getAllTransactions', () => {
    it('should return all transactions for the current fiscal year only', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);
      const getCurrentFiscalYearSpy = jest.spyOn(databaseService, 'getCurrentFiscalYear').mockResolvedValue(currentFiscalYear);

      await getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = (res.json as jest.Mock).mock.calls[0][0];

      expect(data).toHaveLength(4); // Should only include transactions from current fiscal year
      data.forEach((transaction: any) => {
        expect(transaction.fiscalYear).toBe(currentFiscalYear);
      });

      getDbConnectionSpy.mockRestore();
      getCurrentFiscalYearSpy.mockRestore();
    });
  });

  describe('getAccountingStats', () => {
    it('should return transactions for the current fiscal year within the last 30 days', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);
      const getCurrentFiscalYearSpy = jest.spyOn(databaseService, 'getCurrentFiscalYear').mockResolvedValue(currentFiscalYear);

      await getAccountingStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = (res.json as jest.Mock).mock.calls[0][0];

      expect(data).toHaveLength(2); // Should only include transactions from current FY and last 30 days
      data.forEach((transaction: any) => {
        expect(transaction.fiscalYear).toBe(currentFiscalYear);
        const transactionDate = new Date(transaction.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        expect(transactionDate.getTime()).toBeGreaterThanOrEqual(thirtyDaysAgo.getTime());
      });

      getDbConnectionSpy.mockRestore();
      getCurrentFiscalYearSpy.mockRestore();
    });
  });
});
