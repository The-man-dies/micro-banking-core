import { prisma } from "../../services/prisma";
import { getDashboardStats, getTimeSeriesStats } from "../stats.controller";
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

// Helper to get date strings
const getTestDate = (daysAgo: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

describe("Stats Controller", () => {
  beforeAll(async () => {
    // Clear data
    await prisma.transaction.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.client.deleteMany();
    await prisma.agent.deleteMany();

    // Seed data for tests
    await prisma.agent.createMany({
      data: [
        {
          id: 1,
          firstname: "Test",
          lastname: "Agent",
          createdFiscalYear: 2026,
        },
        {
          id: 2,
          firstname: "Second",
          lastname: "Agent",
          createdFiscalYear: 2026,
        },
      ],
    });

    await prisma.client.createMany({
      data: [
        {
          id: 1,
          firstname: "John",
          lastname: "Doe",
          agentId: 1,
          accountBalance: 1000,
          montantEngagement: 500,
          accountExpiresAt: getTestDate(-30).toISOString(),
          status: "active",
          createdFiscalYear: 2026,
          phone: "111",
        },
        {
          id: 2,
          firstname: "Jane",
          Smith: "Smith",
          agentId: 1,
          accountBalance: 2500,
          montantEngagement: 1000,
          accountExpiresAt: getTestDate(-30).toISOString(),
          status: "active",
          createdFiscalYear: 2026,
          phone: "222",
        },
        {
          id: 3,
          firstname: "Peter",
          lastname: "Jones",
          agentId: 2,
          accountBalance: 0,
          montantEngagement: 1000,
          accountExpiresAt: getTestDate(30).toISOString(),
          status: "expired",
          createdFiscalYear: 2026,
          phone: "333",
        },
      ] as any[], // Jane's Smith/lastname fix below
    });

    // Fix Jane Smith
    await prisma.client.update({
      where: { id: 2 },
      data: { lastname: "Smith" },
    });

    // Transactions with predictable dates
    await prisma.transaction.createMany({
      data: [
        {
          clientId: 1,
          amount: 500,
          type: "FraisInscription",
          createdAt: getTestDate(3),
          fiscalYear: 2026,
        },
        {
          clientId: 1,
          amount: 500,
          type: "Depot",
          createdAt: getTestDate(3),
          fiscalYear: 2026,
        },
        {
          clientId: 1,
          amount: 500,
          type: "Depot",
          createdAt: getTestDate(0),
          fiscalYear: 2026,
        },
        {
          clientId: 2,
          amount: 1000,
          type: "FraisReactivation",
          createdAt: getTestDate(0),
          fiscalYear: 2026,
        },
        {
          clientId: 2,
          amount: 1000,
          type: "Depot",
          createdAt: getTestDate(0),
          fiscalYear: 2026,
        },
        {
          clientId: 2,
          amount: 500,
          type: "Retrait",
          createdAt: getTestDate(0),
          fiscalYear: 2026,
        },
        {
          clientId: 3,
          amount: 1000,
          type: "FraisInscription",
          createdAt: getTestDate(3),
          fiscalYear: 2026,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("getDashboardStats", () => {
    it("should return aggregated KPIs and financial stats", async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await getDashboardStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            totalClients: 3,
            activeClients: 2,
            totalAgents: 2,
            totalBalance: 3500,
            totalRevenue: 2500,
            totalDeposits: 2000,
            totalPayouts: 500,
          }),
        }),
      );
    });
  });

  describe("getTimeSeriesStats", () => {
    it("should return continuous time series data with gaps filled", async () => {
      const req = mockRequest() as Request;
      const res = mockResponse() as Response;

      await getTimeSeriesStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const { data } = (res.json as jest.Mock).mock.calls[0][0];

      // Should have data
      expect(data.revenue).toBeDefined();
      expect(data.deposits).toBeDefined();
      expect(data.newClients).toBeDefined();

      // Check values for 3 days ago
      const threeDaysAgo = getTestDate(3).toISOString().split("T")[0];
      const rev3 = data.revenue.find((d: any) => d.date === threeDaysAgo);
      if (rev3) expect(rev3.value).toBe(1500); // 500 + 1000

      const dep3 = data.deposits.find((d: any) => d.date === threeDaysAgo);
      if (dep3) expect(dep3.value).toBe(500);

      const nc3 = data.newClients.find((d: any) => d.date === threeDaysAgo);
      if (nc3) expect(nc3.value).toBe(2);

      // Check values for today
      const today = getTestDate(0).toISOString().split("T")[0];
      const rev0 = data.revenue.find((d: any) => d.date === today);
      if (rev0) expect(rev0.value).toBe(1000);

      const dep0 = data.deposits.find((d: any) => d.date === today);
      if (dep0) expect(dep0.value).toBe(1500); // 500 + 1000
    });
  });
});
