import KPICard from "../components/dashboard/KPICard";
import {
    TransactionTimeSeriesChart,
    CategoryStatsChart,
    AgentDistributionChart,
    WeeklyAmountChart,
} from "../components/dashboard/graph.chartjs";

const DashboardPage = () => {
    const totalAgents = 10;
    const activeAgents = 8;
    const totalTransactions = 2011;
    const totalAmount = "32.4M FCFA";

    return (
        <div className="p-6 bg-gray-900 min-h-screen ">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div className="mb-4 md:mb-0">
                    <h1 className="text-2xl font-bold text-white">Tableau de Bord</h1>
                    <p className="text-gray-400">Bienvenue sur votre espace d'administration</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <KPICard
                    title="Total Agents"
                    value={totalAgents}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    }
                    trend="up"
                    trendValue="+12%"
                />

                <KPICard
                    title="Agents Actifs"
                    value={activeAgents}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                    trend="up"
                    trendValue="+8%"
                />

                <KPICard
                    title="Transactions Totales"
                    value={totalTransactions.toLocaleString()}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                        </svg>
                    }
                    trend="up"
                    trendValue="+75%"
                />

                <KPICard
                    title="Montant Géré"
                    value={totalAmount}
                    icon={
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    }
                    trend="up"
                    trendValue="+22%"
                />
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Graphique série temporelle des transactions */}
                <TransactionTimeSeriesChart />

                {/* Graphique statistiques par catégorie */}
                <CategoryStatsChart />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique répartition des agents */}
                <AgentDistributionChart />

                {/* Graphique montants par jour */}
                <WeeklyAmountChart />
            </div>
        </div>
    );
};

export default DashboardPage;
