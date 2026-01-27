import { databaseService } from '../../services/database';
import { createClient, depositToAccount, renewAccount, payoutClientAccount } from '../client.controller';
import { Request, Response } from 'express';
import { Database } from 'sqlite';

// Mock Express request and response
const mockRequest = (body: any, params: any = {}): Partial<Request> => ({
  body,
  params,
});

const mockResponse = (): Partial<Response> & {
  status: jest.Mock<any, any>;
  json: jest.Mock<any, any>;
} => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


describe('Client Controller', () => {
  let db: Database;

  beforeAll(async () => {
    db = await databaseService.getDbConnection();
    await databaseService.initializeDatabase(db);
    await db.run("INSERT INTO Agent (id, firstname, lastname) VALUES (1, 'Test', 'Agent')");
  });

  afterEach(async () => {
    await db.exec('DELETE FROM Transactions');
    await db.exec('DELETE FROM Ticket');
    await db.exec('DELETE FROM Client');
    await db.exec("DELETE FROM sqlite_sequence WHERE name IN ('Transactions', 'Ticket', 'Client');");
  });

  afterAll(async () => {
    await db.close();
  });

  // Helper to create a client for use in other tests
  const createTestClient = async (balance = 0, montantEngagement = 1000) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await db.run(
      `INSERT INTO Client (id, firstname, lastname, agentId, accountBalance, montantEngagement, accountExpiresAt, status) 
       VALUES (1, 'Test', 'User', 1, ?, ?, ?, 'active')`,
      [balance, montantEngagement, expiresAt.toISOString()]
    );
  };

  describe('createClient', () => {
    it('should create a client, a ticket, a transaction, and return the new client', async () => {
      const req = mockRequest({
        firstname: 'John',
        lastname: 'Doe',
        agentId: 1,
        montantEngagement: 1000,
      }) as Request;
      const res = mockResponse() as Response;

      // We need to override getDbConnection for the controller to use our in-memory db instance
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);

      await createClient(req, res);

      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(201);
      const client = await db.get('SELECT * FROM Client WHERE id = 1');
      expect(client).toBeDefined();
      expect(client.accountBalance).toBe(0);
      const transaction = await db.get('SELECT * FROM Transactions WHERE clientId = 1');
      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('FraisInscription');
      const ticket = await db.get('SELECT * FROM Ticket WHERE clientId = 1');
      expect(ticket).toBeDefined();
    });
  });

  describe('depositToAccount', () => {
    it('should add funds to the client balance and create a transaction when amount matches engagement', async () => {
      const engagement = 1000;
      await createTestClient(100, engagement); // Initial balance 100, engagement 1000
      const req = mockRequest({ amount: engagement }, { id: '1' }) as Request; // Deposit matching engagement
      const res = mockResponse() as Response;
      
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);
      
      await depositToAccount(req, res);
      
      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { newBalance: 1100 } })); // 100 + 1000 = 1100

      const client = await db.get('SELECT * FROM Client WHERE id = 1');
      expect(client.accountBalance).toBe(1100);

      const transaction = await db.get("SELECT * FROM Transactions WHERE type = 'Depot'");
      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(engagement);
    });

    it('should return 400 if deposit amount does not match engagement amount', async () => {
      const engagement = 1000;
      await createTestClient(100, engagement); // Initial balance 100, engagement 1000
      const req = mockRequest({ amount: 500 }, { id: '1' }) as Request; // Deposit NOT matching engagement
      const res = mockResponse() as Response;
      
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);
      
      await depositToAccount(req, res);
      
      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Le montant du dépôt (500 F) doit être égal au montant d'engagement du client (1000 F).`,
        })
      );

      const client = await db.get('SELECT * FROM Client WHERE id = 1');
      expect(client.accountBalance).toBe(100); // Balance should not change
    });
  });
  describe('renewAccount', () => {
    it('should update engagement amount, expiry date, and log a transaction', async () => {
      await createTestClient();
      const req = mockRequest({ fraisReactivation: 1500 }, { id: '1' }) as Request;
      const res = mockResponse() as Response;
      
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);

      await renewAccount(req, res);
      
      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(200);

      const client = await db.get('SELECT * FROM Client WHERE id = 1');
      expect(client.montantEngagement).toBe(1500);

      const transaction = await db.get("SELECT * FROM Transactions WHERE type = 'FraisReactivation'");
      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(1500);
    });
  });

  describe('payoutClientAccount', () => {
    it('should set balance to 0, status to expired, and log a transaction', async () => {
      await createTestClient(5000); // Client has 5000 in balance
      const req = mockRequest({}, { id: '1' }) as Request;
      const res = mockResponse() as Response;
      
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);

      await payoutClientAccount(req, res);

      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amountPaidOut: 5000,
            clientId: 1,
          }),
        })
      );

      const client = await db.get('SELECT * FROM Client WHERE id = 1');
      expect(client.accountBalance).toBe(0);
      expect(client.status).toBe('expired');

      const transaction = await db.get("SELECT * FROM Transactions WHERE type = 'Retrait'");
      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(5000);
    });

    it('should return 400 if balance is zero', async () => {
      await createTestClient(0); // Client has 0 in balance
      const req = mockRequest({}, { id: '1' }) as Request;
      const res = mockResponse() as Response;
      
      const getDbConnectionSpy = jest.spyOn(databaseService, 'getDbConnection').mockResolvedValue(db);

      await payoutClientAccount(req, res);

      getDbConnectionSpy.mockRestore();

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
