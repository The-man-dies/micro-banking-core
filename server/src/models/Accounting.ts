import prisma from "../services/prisma";
import logger from "../config/logger";

type TimeSeriesPoint = {
  date: string;
  totalAmount: number;
  transactionCount: number;
};
type RawTimeSeriesPoint = {
  date: string;
  totalAmount: number;
  transactionCount: number;
};

interface IAccountingModel {
  getAccountingData(currentFiscalYear: number): Promise<{
    deposits: TimeSeriesPoint[];
    payouts: TimeSeriesPoint[];
    inscriptionFees: TimeSeriesPoint[];
    reactivationFees: TimeSeriesPoint[];
  }>;
}

class AccountingModel implements IAccountingModel {
  private fillDateGaps(
    data: RawTimeSeriesPoint[],
    minDate: Date,
    maxDate: Date,
  ): TimeSeriesPoint[] {
    if (data.length === 0 && minDate > maxDate) return [];

    const dataMap = new Map(
      data.map((d) => [
        d.date,
        { totalAmount: d.totalAmount, transactionCount: d.transactionCount },
      ]),
    );
    const filledData: TimeSeriesPoint[] = [];
    const currentDate = new Date(minDate);

    while (currentDate <= maxDate) {
      const dateString = currentDate.toISOString().split("T")[0];
      const values = dataMap.get(dateString) || {
        totalAmount: 0,
        transactionCount: 0,
      };
      filledData.push({
        date: dateString,
        totalAmount: values.totalAmount,
        transactionCount: values.transactionCount,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return filledData;
  }

  private async getAggregatedData(
    type: string | string[],
    fiscalYear: number,
    startDate: Date,
  ): Promise<RawTimeSeriesPoint[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        type: typeof type === "string" ? type : { in: type },
        fiscalYear: fiscalYear,
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const aggregated = transactions.reduce(
      (acc: Record<string, RawTimeSeriesPoint>, t: any) => {
        const date = t.createdAt.toISOString().split("T")[0];
        if (!acc[date]) {
          acc[date] = { date, totalAmount: 0, transactionCount: 0 };
        }
        acc[date].totalAmount += t.amount;
        acc[date].transactionCount += 1;
        return acc;
      },
      {} as Record<string, RawTimeSeriesPoint>,
    );

    return Object.values(aggregated);
  }

  public async getAccountingData(currentFiscalYear: number) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const [
        depositsData,
        payoutsData,
        inscriptionFeesData,
        reactivationFeesData,
      ] = await Promise.all([
        this.getAggregatedData("Depot", currentFiscalYear, thirtyDaysAgo),
        this.getAggregatedData("Retrait", currentFiscalYear, thirtyDaysAgo),
        this.getAggregatedData(
          "FraisInscription",
          currentFiscalYear,
          thirtyDaysAgo,
        ),
        this.getAggregatedData(
          "FraisReactivation",
          currentFiscalYear,
          thirtyDaysAgo,
        ),
      ]);

      const maxDate = new Date();
      maxDate.setHours(23, 59, 59, 999);
      const minDate = thirtyDaysAgo;

      return {
        deposits: this.fillDateGaps(depositsData, minDate, maxDate),
        payouts: this.fillDateGaps(payoutsData, minDate, maxDate),
        inscriptionFees: this.fillDateGaps(
          inscriptionFeesData,
          minDate,
          maxDate,
        ),
        reactivationFees: this.fillDateGaps(
          reactivationFeesData,
          minDate,
          maxDate,
        ),
      };
    } catch (error) {
      logger.error("Error fetching accounting data with Prisma:", { error });
      throw error;
    }
  }
}

export default new AccountingModel();
