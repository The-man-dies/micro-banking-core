import { databaseService } from "../services/database";
import logger from "../config/logger";

type TimeSeriesPoint = { date: string; totalAmount: number; transactionCount: number };
type RawTimeSeriesPoint = { date: string; totalAmount: number; transactionCount: number };

interface IAccountingModel {
    getAccountingData(currentFiscalYear: number): Promise<{
        deposits: TimeSeriesPoint[];
        payouts: TimeSeriesPoint[];
        inscriptionFees: TimeSeriesPoint[];
        reactivationFees: TimeSeriesPoint[];
    }>;
}

class AccountingModel implements IAccountingModel {
    private fillDateGaps(data: RawTimeSeriesPoint[], minDate: Date, maxDate: Date): TimeSeriesPoint[] {
        if (data.length === 0 && minDate > maxDate) return [];
        
        const dataMap = new Map(data.map(d => [d.date, { totalAmount: d.totalAmount, transactionCount: d.transactionCount }]));
        const filledData: TimeSeriesPoint[] = [];
        const currentDate = new Date(minDate);

        while (currentDate <= maxDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const values = dataMap.get(dateString) || { totalAmount: 0, transactionCount: 0 };
            filledData.push({
                date: dateString,
                totalAmount: values.totalAmount,
                transactionCount: values.transactionCount,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return filledData;
    }

    public async getAccountingData(currentFiscalYear: number) {
        const db = await databaseService.getDbConnection();
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split('T')[0];

            const depositsData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as totalAmount, COUNT(*) as transactionCount
                 FROM Transactions 
                 WHERE type = 'Depot' AND fiscalYear = ? AND date(createdAt) >= ? 
                 GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear, thirtyDaysAgoString]
            );

            const payoutsData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as totalAmount, COUNT(*) as transactionCount
                 FROM Transactions 
                 WHERE type = 'Retrait' AND fiscalYear = ? AND date(createdAt) >= ? 
                 GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear, thirtyDaysAgoString]
            );

            const inscriptionFeesData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as totalAmount, COUNT(*) as transactionCount
                 FROM Transactions 
                 WHERE type = 'FraisInscription' AND fiscalYear = ? AND date(createdAt) >= ? 
                 GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear, thirtyDaysAgoString]
            );

            const reactivationFeesData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as totalAmount, COUNT(*) as transactionCount
                 FROM Transactions 
                 WHERE type = 'FraisReactivation' AND fiscalYear = ? AND date(createdAt) >= ? 
                 GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear, thirtyDaysAgoString]
            );

            const maxDate = new Date();
            const minDate = thirtyDaysAgo;

            return {
                deposits: this.fillDateGaps(depositsData, minDate, maxDate),
                payouts: this.fillDateGaps(payoutsData, minDate, maxDate),
                inscriptionFees: this.fillDateGaps(inscriptionFeesData, minDate, maxDate),
                reactivationFees: this.fillDateGaps(reactivationFeesData, minDate, maxDate),
            };

        } catch (error) {
            logger.error('Error fetching accounting data:', { error });
            throw error;
        }
    }
}

export default new AccountingModel();
