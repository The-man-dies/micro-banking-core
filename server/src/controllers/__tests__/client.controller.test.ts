import {
  createClient,
  depositToAccount,
  renewAccount,
  payoutClientAccount,
} from "../client.controller";
import { Request, Response } from "express";
import { prisma } from "../../services/prisma";

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

describe("Client Controller", () => {
  beforeAll(async () => {
    // Ensure test agent exists
    await prisma.agent.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        firstname: "Test",
        lastname: "Agent",
        createdFiscalYear: 2026,
      },
    });
  });

  afterEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.client.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // Helper to create a client for use in other tests
  const createTestClient = async (balance = 0, montantEngagement = 1000) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await prisma.client.create({
      data: {
        id: 1,
        firstname: "Test",
        lastname: "User",
        agentId: 1,
        accountBalance: balance,
        montantEngagement: montantEngagement,
        accountExpiresAt: expiresAt.toISOString(),
        status: "active",
        createdFiscalYear: 2026,
        phone: "12345678" + Math.random(), // Unique phone
      },
    });
  };

  describe("createClient", () => {
    it("should create a client, a ticket, a transaction, and return the new client", async () => {
      const req = mockRequest({
        firstname: "John",
        lastname: "Doe",
        phone: "+223 78 33 44 33",
        location: "Bamako",
        agentId: 1,
        montantEngagement: 1000,
        createdFiscalYear: 2026,
      }) as Request;
      const res = mockResponse() as Response;

      await createClient(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const client = await prisma.client.findFirst({
        where: { firstname: "John" },
      });
      expect(client).toBeDefined();
      expect(client?.accountBalance).toBe(0);
      const transaction = await prisma.transaction.findFirst({
        where: { clientId: client?.id },
      });
      expect(transaction).toBeDefined();
      expect(transaction?.type).toBe("FraisInscription");
      const ticket = await prisma.ticket.findFirst({
        where: { clientId: client?.id },
      });
      expect(ticket).toBeDefined();
    });
  });

  describe("depositToAccount", () => {
    it("should add funds to the client balance and create a transaction when amount matches engagement", async () => {
      const engagement = 1000;
      await createTestClient(100, engagement); // Initial balance 100, engagement 1000
      const req = mockRequest({ amount: engagement }, { id: "1" }) as Request; // Deposit matching engagement
      const res = mockResponse() as Response;

      await depositToAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: { newBalance: 1100 } }),
      ); // 100 + 1000 = 1100

      const client = await prisma.client.findUnique({ where: { id: 1 } });
      expect(client?.accountBalance).toBe(1100);

      const transaction = await prisma.transaction.findFirst({
        where: { type: "Depot" },
      });
      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(engagement);
    });

    it("should return 400 if deposit amount does not match engagement amount", async () => {
      const engagement = 1000;
      await createTestClient(100, engagement); // Initial balance 100, engagement 1000
      const req = mockRequest({ amount: 500 }, { id: "1" }) as Request; // Deposit NOT matching engagement
      const res = mockResponse() as Response;

      await depositToAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: `Le montant du dépôt (500 F) doit être égal au montant d'engagement du client (1000 F).`,
        }),
      );

      const client = await prisma.client.findUnique({ where: { id: 1 } });
      expect(client?.accountBalance).toBe(100); // Balance should not change
    });
  });
  describe("renewAccount", () => {
    it("should update engagement amount, expiry date, and log a transaction", async () => {
      await createTestClient();
      const req = mockRequest(
        { fraisReactivation: 1500 },
        { id: "1" },
      ) as Request;
      const res = mockResponse() as Response;

      await renewAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);

      const client = await prisma.client.findUnique({ where: { id: 1 } });
      expect(client?.montantEngagement).toBe(1500);

      const transaction = await prisma.transaction.findFirst({
        where: { type: "FraisReactivation" },
      });
      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(1500);
    });
  });

  describe("payoutClientAccount", () => {
    it("should set balance to 0, status to expired, and log a transaction", async () => {
      await createTestClient(5000); // Client has 5000 in balance
      const req = mockRequest({}, { id: "1" }) as Request;
      const res = mockResponse() as Response;

      await payoutClientAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            amountPaidOut: 5000,
            clientId: 1,
          }),
        }),
      );

      const client = await prisma.client.findUnique({ where: { id: 1 } });
      expect(client?.accountBalance).toBe(0);
      expect(client?.status).toBe("expired");

      const transaction = await prisma.transaction.findFirst({
        where: { type: "Retrait" },
      });
      expect(transaction).toBeDefined();
      expect(transaction?.amount).toBe(5000);
    });

    it("should return 400 if balance is zero", async () => {
      await createTestClient(0); // Client has 0 in balance
      const req = mockRequest({}, { id: "1" }) as Request;
      const res = mockResponse() as Response;

      await payoutClientAccount(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
