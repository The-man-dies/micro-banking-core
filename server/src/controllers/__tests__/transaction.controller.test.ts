import prisma from "../../services/prisma";
import { getAllTransactions } from "../transaction.controller";
import { getAccountingStats } from "../accounting.controller";
import { Request, Response } from "express";

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

// Helper to get date objects
const getDateAgo = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

describe("Transaction Controller", () => {
  let currentFiscalYear: number;
  let oldFiscalYear: number;

  beforeAll(async () => {
    // Clear data
    await prisma.transaction.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.client.deleteMany();
    await prisma.agent.deleteMany();
    await prisma.appSettings.deleteMany();

    // Set current fiscal year
    currentFiscalYear = new Date().getFullYear();
    oldFiscalYear = currentFiscalYear - 1;

    // Seed AppSettings
    await prisma.appSettings.create({
      data: { fiscalYear: currentFiscalYear },
    });

    // Seed Agents
    await prisma.agent.createMany({
      data: [
        {
          id: 1,
          firstname: "Test",
          lastname: "Agent",
          createdFiscalYear: currentFiscalYear,
        },
        {
          id: 2,
          firstname: "Second",
          lastname: "Agent",
          createdFiscalYear: currentFiscalYear,
        },
      ],
    });

    // Seed Clients
    await prisma.client.createMany({
      data: [
        {
          id: 1,
          firstname: "John",
          lastname: "Doe",
          agentId: 1,
          accountBalance: 1000,
          montantEngagement: 500,
          accountExpiresAt: "2027-01-01T00:00:00Z",
          status: "active",
          createdFiscalYear: currentFiscalYear,
          phone: "11",
        },
        {
          id: 2,
          firstname: "Jane",
          lastname: "Smith",
          agentId: 1,
          accountBalance: 2500,
          montantEngagement: 1000,
          accountExpiresAt: "2027-01-01T00:00:00Z",
          status: "active",
          createdFiscalYear: currentFiscalYear,
          phone: "22",
        },
        {
          id: 3,
          firstname: "Peter",
          lastname: "Jones",
          agentId: 2,
          accountBalance: 0,
          montantEngagement: 1000,
          accountExpiresAt: "2027-01-01T00:00:00Z",
          status: "active",
          createdFiscalYear: currentFiscalYear,
          phone: "33",
        },
      ],
    });

    // Seed Transactions
    await prisma.transaction.createMany({
      data: [
        {
          clientId: 1,
          amount: 100,
          type: "Depot",
          createdAt: getDateAgo(5),
          fiscalYear: currentFiscalYear,
        },
        {
          clientId: 1,
          amount: 200,
          type: "Retrait",
          createdAt: getDateAgo(15),
          fiscalYear: currentFiscalYear,
        },
        {
          clientId: 2,
          amount: 300,
          type: "FraisInscription",
          createdAt: getDateAgo(40),
          fiscalYear: currentFiscalYear,
        },
        {
          clientId: 2,
          amount: 400,
          type: "Depot",
          createdAt: getDateAgo(60),
          fiscalYear: currentFiscalYear,
        },
        {
          clientId: 3,
          amount: 500,
          type: "Depot",
          createdAt: getDateAgo(370),
          fiscalYear: oldFiscalYear,
        },
        {
          clientId: 3,
          amount: 600,
          type: "Retrait",
          createdAt: getDateAgo(380),
          fiscalYear: oldFiscalYear,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("getAllTransactions", () => {
    it("should return all transactions for the current fiscal year only", async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await getAllTransactions(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = (res.json as jest.Mock).mock.calls[0][0];

      expect(data).toHaveLength(4); // Should only include transactions from current fiscal year
      data.forEach((transaction: any) => {
        expect(transaction.fiscalYear).toBe(currentFiscalYear);
      });
    });
  });

  describe("getAccountingStats", () => {
    it("should return transactions for the current fiscal year within the last 30 days", async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await getAccountingStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = (res.json as jest.Mock).mock.calls[0][0];

      expect(data).toHaveLength(2); // Should only include transactions from current FY and last 30 days
      data.forEach((transaction: any) => {
        expect(transaction.fiscalYear).toBe(currentFiscalYear);
        const transactionDate = new Date(transaction.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Normalize to midnight for fair comparison if needed, but let's see
        expect(transactionDate.getTime()).toBeGreaterThanOrEqual(
          thirtyDaysAgo.getTime() - 1000 * 60 * 5, // 5 mins grace for execution time
        );
      });
    });
  });
});
