import { databaseService } from "../services/database";
import logger from "../config/logger";

type TimeSeriesPoint = { date: string; value: number };
type RawTimeSeriesPoint = { date: string; value: number };

interface IStatsModel {
    getGeneralKPIs(currentFiscalYear: number): Promise<{
        totalClients: number;
        activeClients: number;
        totalAgents: number;
        totalTransactions: number;
        accountStatusDistribution: { [key: string]: number };
        topAgentsByTransactionCount: { agentName: string; transactionCount: number }[];
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

type CountResult = { 'COUNT(*)': number } | undefined;
type SumResult = { 'SUM(amount)': number | null } | undefined;
type SumBalanceResult = { 'SUM(accountBalance)': number | null } | undefined;

class StatsModel implements IStatsModel {
    public async getGeneralKPIs(currentFiscalYear: number) {
        const db = await databaseService.getDbConnection();
        try {
            const totalClients = (await db.get<CountResult>('SELECT COUNT(*) FROM Client'))?.['COUNT(*)'] || 0;
            const activeClients = (await db.get<CountResult>("SELECT COUNT(*) FROM Client WHERE status = 'active'"))?.['COUNT(*)'] || 0;
            const totalAgents = (await db.get<CountResult>('SELECT COUNT(*) FROM Agent'))?.['COUNT(*)'] || 0;

            const totalTransactions = (await db.get<CountResult>(
                `SELECT COUNT(*) FROM Transactions WHERE fiscalYear = ?`,
                [currentFiscalYear]
            ))?.['COUNT(*)'] || 0;

            // New: accountStatusDistribution
            const accountStatusDistributionResult: { status: string; count: number }[] = await db.all(
                `SELECT status, COUNT(*) as count FROM Client GROUP BY status`
            );
            const accountStatusDistribution: { [key: string]: number } = accountStatusDistributionResult.reduce((acc: { [key: string]: number }, curr: { status: string; count: number }) => {
                acc[curr.status] = curr.count;
                return acc;
            }, {});

            // New: topAgentsByTransactionCount (top 5)
            const topAgentsByTransactionCount: { agentName: string; transactionCount: number }[] = await db.all(
                `SELECT
                    (A.firstname || ' ' || A.lastname) AS agentName,
                    COUNT(T.id) AS transactionCount
                FROM Transactions T
                JOIN Client C ON T.clientId = C.id
                JOIN Agent A ON C.agentId = A.id
                WHERE T.fiscalYear = ?
                GROUP BY A.id, A.firstname, A.lastname
                ORDER BY transactionCount DESC
                LIMIT 5`,
                [currentFiscalYear]
            );


            return { totalClients, activeClients, totalAgents, totalTransactions, accountStatusDistribution, topAgentsByTransactionCount };
        } catch (error) {
            logger.error('Error fetching general KPIs:', { error });
            throw error;
        }
    }

    public async getFinancialStats(currentFiscalYear: number) {
        const db = await databaseService.getDbConnection();
        try {
            const totalBalance = (await db.get<SumBalanceResult>('SELECT SUM(accountBalance) FROM Client'))?.['SUM(accountBalance)'] || 0;
            
            const totalRevenue = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type IN ('FraisInscription', 'FraisReactivation') AND fiscalYear = ?`,
                [currentFiscalYear]
            ))?.['SUM(amount)'] || 0;

            const totalDeposits = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type = 'Depot' AND fiscalYear = ?`,
                [currentFiscalYear]
            ))?.['SUM(amount)'] || 0;

            const totalPayouts = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type = 'Retrait' AND fiscalYear = ?`,
                [currentFiscalYear]
            ))?.['SUM(amount)'] || 0;


            return { totalBalance, totalRevenue, totalDeposits, totalPayouts };
        } catch (error) {
            logger.error('Error fetching financial stats:', { error });
            throw error;
        }
    }

    private fillDateGaps(data: RawTimeSeriesPoint[], minDate: Date, maxDate: Date): TimeSeriesPoint[] {
        if (data.length === 0 && minDate > maxDate) return [];
        
        const dataMap = new Map(data.map(d => [d.date, d.value]));
        const filledData: TimeSeriesPoint[] = [];
        const currentDate = new Date(minDate);

        while (currentDate <= maxDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            filledData.push({
                date: dateString,
                value: dataMap.get(dateString) || 0,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return filledData;
    }

    public async getTimeSeriesData(currentFiscalYear: number) {
        const db = await databaseService.getDbConnection();
        try {
            const revenueData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as value FROM Transactions WHERE type IN ('FraisInscription', 'FraisReactivation') AND fiscalYear = ? GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear]
            );

            const depositsData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as value FROM Transactions WHERE type = 'Depot' AND fiscalYear = ? GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear]
            );
            
            const newClientsData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(clientId) as value FROM Transactions WHERE type = 'FraisInscription' AND fiscalYear = ? GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear]
            );

            // New: transactionHistory (count of all transactions by date)
            const transactionHistoryData: RawTimeSeriesPoint[] = await db.all(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as value FROM Transactions WHERE fiscalYear = ? GROUP BY date ORDER BY date ASC`,
                [currentFiscalYear]
            );

            // The frontend expects an object mapping date to amount.
            const weeklyAmountsData = revenueData.reduce((acc: { [key: string]: number }, item) => {
                acc[item.date] = item.value;
                return acc;
            }, {});
            
            const allDates = [...revenueData, ...depositsData, ...newClientsData, ...transactionHistoryData].map(d => new Date(d.date));
            let minDate: Date;
            if (allDates.length > 0) {
                minDate = new Date(Math.min.apply(null, allDates.map(d => d.getTime())));
            } else {
                minDate = new Date(`${currentFiscalYear}-01-01`); // Default to start of fiscal year if no data
            }
            const maxDate = new Date(); // Today

            return {
                revenue: this.fillDateGaps(revenueData, minDate, maxDate),
                deposits: this.fillDateGaps(depositsData, minDate, maxDate),
                newClients: this.fillDateGaps(newClientsData, minDate, maxDate),
                transactionHistory: this.fillDateGaps(transactionHistoryData, minDate, maxDate),
                weeklyAmounts: weeklyAmountsData,
            };

        } catch (error) {
            logger.error('Error fetching time series data:', { error });
            throw error;
        }
    }
}

export default new StatsModel();
