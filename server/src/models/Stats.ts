import { databaseService } from "../services/database";
import logger from "../config/logger";

type TimeSeriesPoint = { date: string; value: number };
type RawTimeSeriesPoint = { date: string; value: number };

interface IStatsModel {
    getGeneralKPIs(): Promise<{
        totalClients: number;
        activeClients: number;
        totalAgents: number;
    }>;
    getFinancialStats(): Promise<{
        totalBalance: number;
        totalRevenue: number;
        totalDeposits: number;
        totalPayouts: number;
    }>;
    getTimeSeriesData(): Promise<{
        revenue: TimeSeriesPoint[];
        deposits: TimeSeriesPoint[];
        newClients: TimeSeriesPoint[];
    }>;
}

type CountResult = { 'COUNT(*)': number } | undefined;
type SumResult = { 'SUM(amount)': number | null } | undefined;
type SumBalanceResult = { 'SUM(accountBalance)': number | null } | undefined;

class StatsModel implements IStatsModel {
    public async getGeneralKPIs() {
        const db = await databaseService.getDbConnection();
        try {
            const totalClients = (await db.get<CountResult>('SELECT COUNT(*) FROM Client'))?.['COUNT(*)'] || 0;
            const activeClients = (await db.get<CountResult>("SELECT COUNT(*) FROM Client WHERE status = 'active'"))?.['COUNT(*)'] || 0;
            const totalAgents = (await db.get<CountResult>('SELECT COUNT(*) FROM Agent'))?.['COUNT(*)'] || 0;

            return { totalClients, activeClients, totalAgents };
        } catch (error) {
            logger.error('Error fetching general KPIs:', { error });
            throw error;
        }
    }

    public async getFinancialStats() {
        const db = await databaseService.getDbConnection();
        try {
            const totalBalance = (await db.get<SumBalanceResult>('SELECT SUM(accountBalance) FROM Client'))?.['SUM(accountBalance)'] || 0;
            
            const totalRevenue = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type IN ('FraisInscription', 'FraisReactivation')`
            ))?.['SUM(amount)'] || 0;
            
            const totalDeposits = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type = 'Depot'`
            ))?.['SUM(amount)'] || 0;

            const totalPayouts = (await db.get<SumResult>(
                `SELECT SUM(amount) FROM Transactions WHERE type = 'Retrait'`
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

    public async getTimeSeriesData() {
        const db = await databaseService.getDbConnection();
        try {
            const revenueData = await db.all<RawTimeSeriesPoint[]>(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as value FROM Transactions WHERE type IN ('FraisInscription', 'FraisReactivation') GROUP BY date ORDER BY date ASC`
            );

            const depositsData = await db.all<RawTimeSeriesPoint[]>(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, SUM(amount) as value FROM Transactions WHERE type = 'Depot' GROUP BY date ORDER BY date ASC`
            );
            
            const newClientsData = await db.all<RawTimeSeriesPoint[]>(
                `SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(clientId) as value FROM Transactions WHERE type = 'FraisInscription' GROUP BY date ORDER BY date ASC`
            );
            
            const allDates = [...revenueData, ...depositsData, ...newClientsData].map(d => new Date(d.date));
            if (allDates.length === 0) {
                return { revenue: [], deposits: [], newClients: [] };
            }
            
            const minDate = new Date(Math.min.apply(null, allDates.map(d => d.getTime())));
            const maxDate = new Date(); // Today

            return {
                revenue: this.fillDateGaps(revenueData, minDate, maxDate),
                deposits: this.fillDateGaps(depositsData, minDate, maxDate),
                newClients: this.fillDateGaps(newClientsData, minDate, maxDate),
            };

        } catch (error) {
            logger.error('Error fetching time series data:', { error });
            throw error;
        }
    }
}

export default new StatsModel();
