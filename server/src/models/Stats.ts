import { prisma } from "../services/prisma";
import logger from "../config/logger";
import { TransactionType } from "../types/transaction.types";

type TimeSeriesPoint = { date: string; value: number };
type RawTimeSeriesPoint = { date: string; value: number };

interface IStatsModel {
  getGeneralKPIs(currentFiscalYear: number): Promise<{
    totalClients: number;
    activeClients: number;
    totalAgents: number;
    totalTransactions: number;
    accountStatusDistribution: { [key: string]: number };
    topAgentsByTransactionCount: {
      agentName: string;
      transactionCount: number;
    }[];
  }>;
  getFinancialStats(currentFiscalYear: number): Promise<{
    totalBalance: number;
    totalRevenue: number;
    totalDeposits: number;
    totalPayouts: number;
  }>;
  getTimeSeriesData(currentFiscalYear: number): Promise<{
    revenue: TimeSeriesPoint[];
    deposits: TimeSeriesPoint[];
    newClients: TimeSeriesPoint[];
    transactionHistory: TimeSeriesPoint[];
    weeklyAmounts: { [key: string]: number };
  }>;
}

class StatsModel implements IStatsModel {
  public async getGeneralKPIs(currentFiscalYear: number) {
    try {
      const [totalClients, activeClients, totalAgents, totalTransactions] =
        await Promise.all([
          prisma.client.count(),
          prisma.client.count({ where: { status: "active" } }),
          prisma.agent.count(),
          prisma.transaction.count({
            where: { fiscalYear: currentFiscalYear },
          }),
        ]);

      const statusDistributionResult = await prisma.client.groupBy({
        by: ["status"],
        _count: { _all: true },
      });

      const accountStatusDistribution = statusDistributionResult.reduce(
        (
          acc: Record<string, number>,
          curr: { status: string; _count: { _all: number } },
        ) => {
          acc[curr.status] = curr._count._all;
          return acc;
        },
        {},
      );

      // Top agents by transaction count (Top 5)
      // Since we need to join through Client to Transactions, we'll fetch agents with their clients and transactions
      // and aggregate in memory for simplicity and performance on typical data sizes.
      const agentsWithTransactions = await prisma.agent.findMany({
        include: {
          clients: {
            include: {
              transactions: {
                where: { fiscalYear: currentFiscalYear },
                select: { id: true },
              },
            },
          },
        },
      });

      const topAgentsByTransactionCount = agentsWithTransactions
        .map((agent: any) => {
          const count = agent.clients.reduce(
            (sum: number, client: any) => sum + client.transactions.length,
            0,
          );
          return {
            agentName: `${agent.firstname} ${agent.lastname}`,
            transactionCount: count,
          };
        })
        .sort((a: any, b: any) => b.transactionCount - a.transactionCount)
        .slice(0, 5);

      return {
        totalClients,
        activeClients,
        totalAgents,
        totalTransactions,
        accountStatusDistribution,
        topAgentsByTransactionCount,
      };
    } catch (error) {
      logger.error("Error fetching general KPIs with Prisma:", { error });
      throw error;
    }
  }

  public async getFinancialStats(currentFiscalYear: number) {
    try {
      const [balanceResult, revenueResult, depositsResult, payoutsResult] =
        await Promise.all([
          prisma.client.aggregate({ _sum: { accountBalance: true } }),
          prisma.transaction.aggregate({
            where: {
              type: {
                in: [
                  TransactionType.FraisInscription,
                  TransactionType.FraisReactivation,
                ],
              },
              fiscalYear: currentFiscalYear,
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              type: TransactionType.Depot,
              fiscalYear: currentFiscalYear,
            },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: {
              type: TransactionType.Retrait,
              fiscalYear: currentFiscalYear,
            },
            _sum: { amount: true },
          }),
        ]);

      return {
        totalBalance: balanceResult._sum.accountBalance || 0,
        totalRevenue: revenueResult._sum.amount || 0,
        totalDeposits: depositsResult._sum.amount || 0,
        totalPayouts: payoutsResult._sum.amount || 0,
      };
    } catch (error) {
      logger.error("Error fetching financial stats with Prisma:", { error });
      throw error;
    }
  }

  private fillDateGaps(
    data: RawTimeSeriesPoint[],
    minDate: Date,
    maxDate: Date,
  ): TimeSeriesPoint[] {
    if (data.length === 0 && minDate > maxDate) return [];

    const dataMap = new Map(data.map((d) => [d.date, d.value]));
    const filledData: TimeSeriesPoint[] = [];
    const currentDate = new Date(minDate);
    currentDate.setHours(0, 0, 0, 0);

    const endMarker = new Date(maxDate);
    endMarker.setHours(23, 59, 59, 999);

    while (currentDate <= endMarker) {
      const dateString = currentDate.toISOString().split("T")[0];
      filledData.push({
        date: dateString,
        value: dataMap.get(dateString) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return filledData;
  }

  public async getTimeSeriesData(currentFiscalYear: number) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { fiscalYear: currentFiscalYear },
        orderBy: { createdAt: "asc" },
      });

      const aggregateByDate = (
        types: TransactionType[],
        sum: boolean = true,
      ): RawTimeSeriesPoint[] => {
        const filtered = transactions.filter((t: any) =>
          types.includes(t.type),
        );
        const grouped = filtered.reduce(
          (acc: Record<string, number>, t: any) => {
            const date = t.createdAt.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + (sum ? t.amount : 1);
            return acc;
          },
          {},
        );
        return Object.entries(grouped).map(
          ([date, value]): RawTimeSeriesPoint => ({
            date,
            value: value as number,
          }),
        );
      };

      const revenueData = aggregateByDate([
        TransactionType.FraisInscription,
        TransactionType.FraisReactivation,
      ]);
      const depositsData = aggregateByDate([TransactionType.Depot]);
      const newClientsData = aggregateByDate(
        [TransactionType.FraisInscription],
        false,
      );

      const transactionHistoryGrouped = transactions.reduce(
        (acc: Record<string, number>, t: any) => {
          const date = t.createdAt.toISOString().split("T")[0];
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        },
        {},
      );
      const transactionHistoryData = Object.entries(
        transactionHistoryGrouped,
      ).map(
        ([date, value]): RawTimeSeriesPoint => ({
          date,
          value: value as number,
        }),
      );

      const weeklyAmountsData = revenueData.reduce(
        (acc: Record<string, number>, item: RawTimeSeriesPoint) => {
          acc[item.date] = item.value;
          return acc;
        },
        {},
      );

      const allDates = transactions.map((t: any) => t.createdAt.getTime());
      let minDate: Date;
      if (allDates.length > 0) {
        minDate = new Date(Math.min(...allDates));
      } else {
        minDate = new Date(`${currentFiscalYear}-01-01`);
      }
      const maxDate = new Date();

      return {
        revenue: this.fillDateGaps(revenueData, minDate, maxDate),
        deposits: this.fillDateGaps(depositsData, minDate, maxDate),
        newClients: this.fillDateGaps(newClientsData, minDate, maxDate),
        transactionHistory: this.fillDateGaps(
          transactionHistoryData,
          minDate,
          maxDate,
        ),
        weeklyAmounts: weeklyAmountsData,
      };
    } catch (error) {
      logger.error("Error fetching time series data with Prisma:", { error });
      throw error;
    }
  }
}

export default new StatsModel();
