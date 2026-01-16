import { getDbConnection, initializeDatabase } from '../../services/database';
import { getDashboardStats, getTimeSeriesStats } from '../stats.controller';
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

// Helper to get date strings
const getTestDate = (daysAgo: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
};

describe('Stats Controller', () => {
  let db: Database;

  beforeAll(async () => {
    db = await getDbConnection();
    await initializeDatabase(db);

    // Seed data for tests
    await db.run("INSERT INTO Agent (id, firstname, lastname) VALUES (1, 'Test', 'Agent'), (2, 'Second', 'Agent')");
    
    await db.run(`
      INSERT INTO Client (id, firstname, lastname, agentId, accountBalance, montantEngagement, accountExpiresAt, status) VALUES
      (1, 'John', 'Doe', 1, 1000, 500, '${getTestDate(-30)}', 'active'),
      (2, 'Jane', 'Smith', 1, 2500, 1000, '${getTestDate(-30)}', 'active'),
      (3, 'Peter', 'Jones', 2, 0, 1000, '${getTestDate(30)}', 'expired')
    `);

    // Transactions with predictable dates
    await db.run(`
      INSERT INTO Transactions (clientId, amount, type, createdAt) VALUES
      (1, 500, 'FraisInscription', '${getTestDate(3)}'),   -- Revenue, New Client (3 days ago)
      (1, 500, 'Depot', '${getTestDate(3)}'),              -- Deposit (3 days ago)
      (1, 500, 'Depot', '${getTestDate(0)}'),              -- Deposit (today)
      (2, 1000, 'FraisReactivation', '${getTestDate(0)}'), -- Revenue (today)
      (2, 1000, 'Depot', '${getTestDate(0)}'),             -- Deposit (today)
      (2, 500, 'Retrait', '${getTestDate(0)}'),            -- Payout (today)
      (3, 1000, 'FraisInscription', '${getTestDate(3)}')   -- Revenue, New Client (3 days ago)
    `);
  });

  afterAll(async () => {
    await db.close();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated KPIs and financial stats', async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      const originalGetDb = require('../../services/database').getDbConnection;
      require('../../services/database').getDbConnection = jest.fn().mockResolvedValue(db);
      await getDashboardStats(req, res);
      require('../../services/database').getDbConnection = originalGetDb;

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: {
            totalClients: 3,
            activeClients: 2,
            totalAgents: 2,
            totalBalance: 3500,
            totalRevenue: 2500,
            totalDeposits: 2000,
            totalPayouts: 500,
          },
        })
      );
    });
  });

  describe('getTimeSeriesStats', () => {
    it('should return continuous time series data with gaps filled', async () => {
        const req = mockRequest() as Request;
        const res = mockResponse() as Response;

        const originalGetDb = require('../../services/database').getDbConnection;
        require('../../services/database').getDbConnection = jest.fn().mockResolvedValue(db);
        await getTimeSeriesStats(req, res);
        require('../../services/database').getDbConnection = originalGetDb;

        expect(res.status).toHaveBeenCalledWith(200);
        const { data } = (res.json as jest.Mock).mock.calls[0][0];

        // Should have 4 days of data (day -3, -2, -1, 0)
        expect(data.revenue.length).toBe(4);
        expect(data.deposits.length).toBe(4);
        expect(data.newClients.length).toBe(4);

        // Check values for 3 days ago
        const threeDaysAgo = getTestDate(3).split('T')[0];
        expect(data.revenue.find((d: any) => d.date === threeDaysAgo).value).toBe(1500); // 500 + 1000
        expect(data.deposits.find((d: any) => d.date === threeDaysAgo).value).toBe(500);
        expect(data.newClients.find((d: any) => d.date === threeDaysAgo).value).toBe(2);

        // Check values for "gap" day (2 days ago)
        const twoDaysAgo = getTestDate(2).split('T')[0];
        expect(data.revenue.find((d: any) => d.date === twoDaysAgo).value).toBe(0);
        expect(data.deposits.find((d: any) => d.date === twoDaysAgo).value).toBe(0);
        expect(data.newClients.find((d: any) => d.date === twoDaysAgo).value).toBe(0);

        // Check values for today
        const today = getTestDate(0).split('T')[0];
        expect(data.revenue.find((d: any) => d.date === today).value).toBe(1000);
        expect(data.deposits.find((d: any) => d.date === today).value).toBe(1500); // 500 + 1000
        expect(data.newClients.find((d: any) => d.date === today).value).toBe(0);
    });
  });
});
