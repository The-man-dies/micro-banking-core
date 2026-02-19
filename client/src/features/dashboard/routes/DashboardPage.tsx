import { useDashboard } from "../hooks/useDashboard";
import KPICard from "../components/KPICard";
import { ErrorComponent } from "@/components/ui/Error";
import {
  CategoryStatsChart,
  AgentDistributionChart,
  WeeklyAmountChart,
} from "../components/Charts";
import { DashboardCombinedTransactionsChart } from "../components/DashboardCombinedTransactionsChart"; // Import the new chart

const DashboardPage = () => {
  const {
    stats,
    timeSeries,
    accountingData,
    isLoading,
    error: errorMsg,
  } = useDashboard(); // Get accountingData

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <svg
          className="animate-spin -ml-1 mr-3 h-10 w-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-xl">Chargement des données...</p>
      </div>
    );
  }

  if (errorMsg) {
    return <ErrorComponent message={errorMsg} />;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="flex md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white">Tableau de Bord</h1>
          <p className="text-gray-400">
            Bienvenue sur votre espace d'administration
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:flex flex-wrap place-items-end lg:grid-cols-6 gap-6 mb-8">
        <KPICard
          title="Total Clients"
          value={stats?.totalClients ?? 0}
          className="text-center"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <KPICard
          title="Total Agents"
          className="text-center"
          value={stats?.totalAgents ?? 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <KPICard
          title="Total Transactions"
          className="text-center"
          value={stats?.totalTransactions ?? 0}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <KPICard
          title="Total Revenu"
          className="text-center"
          value={`${stats?.totalRevenue ?? 0} FCFA`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <KPICard
          className="text-center"
          title="Total Dépôts"
          value={`${stats?.totalDeposits ?? 0} FCFA`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
        />
        <KPICard
          className="text-center"
          title="Total Retraits"
          value={`${stats?.totalPayouts ?? 0} FCFA`}
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 12H6"
              />
            </svg>
          }
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DashboardCombinedTransactionsChart accountingData={accountingData} />
        <CategoryStatsChart data={stats?.accountStatusDistribution} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentDistributionChart data={stats?.topAgentsByTransactionCount} />
        <WeeklyAmountChart data={timeSeries?.weeklyAmounts} />
      </div>
    </div>
  );
};

export default DashboardPage;
