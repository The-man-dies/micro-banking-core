import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Chart.js components registration
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Default options for charts
const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            labels: {
                color: "#9CA3AF",
                font: {
                    size: 12,
                },
            },
        },
        tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "#4B5563",
            borderWidth: 1,
        },
    },
    scales: {
        x: {
            ticks: {
                color: "#9CA3AF",
            },
            grid: {
                color: "#374151",
            },
        },
        y: {
            ticks: {
                color: "#9CA3AF",
            },
            grid: {
                color: "#374151",
            },
        },
    },
};

const ChartWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white text-lg font-bold mb-4">{title}</h3>
        <div className="h-80">{children}</div>
    </div>
);

const NoData = () => <p className="text-gray-400 text-center mt-10">Données non disponibles.</p>;

// Transaction Time Series Line Chart
export const TransactionTimeSeriesChart: React.FC<{ data: any[] | undefined }> = ({ data }) => {
    if (!data || data.length === 0) {
        return <ChartWrapper title="Évolution des Transactions"><NoData /></ChartWrapper>;
    }

    const chartData = {
        labels: data.map(d => new Date(d.date).toLocaleDateString()),
        datasets: [
            {
                label: "Nombre de transactions",
                data: data.map(d => d.count),
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    return (
        <ChartWrapper title="Évolution des Transactions">
            <Line data={chartData} options={defaultOptions} />
        </ChartWrapper>
    );
};

// Account Status Doughnut Chart
export const CategoryStatsChart: React.FC<{ data: any | undefined }> = ({ data }) => {
    if (!data) {
         return <ChartWrapper title="Répartition par Statut de Compte"><NoData /></ChartWrapper>;
    }
    
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: "Nombre de comptes",
                data: Object.values(data),
                backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(251, 191, 36, 0.8)"],
                borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)", "rgb(251, 191, 36)"],
                borderWidth: 2,
            },
        ],
    };

    return (
        <ChartWrapper title="Répartition par Statut de Compte">
            <Doughnut data={chartData} options={{ ...defaultOptions, plugins: { ...defaultOptions.plugins, legend: { position: 'top' }}}} />
        </ChartWrapper>
    );
};

// Top Agents Bar Chart
export const AgentDistributionChart: React.FC<{ data: any[] | undefined }> = ({ data }) => {
     if (!data || data.length === 0) {
        return <ChartWrapper title="Top 5 des Agents par Transactions"><NoData /></ChartWrapper>;
    }

    const chartData = {
        labels: data.map(agent => agent.agentName),
        datasets: [
            {
                label: "Transactions effectuées",
                data: data.map(agent => agent.transactionCount),
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderColor: "rgb(99, 102, 241)",
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    return (
        <ChartWrapper title="Top 5 des Agents par Transactions">
            <Bar data={chartData} options={defaultOptions} />
        </ChartWrapper>
    );
};


// Weekly Amount Bar Chart
export const WeeklyAmountChart: React.FC<{ data: any | undefined }> = ({ data }) => {
    if (!data) {
        return <ChartWrapper title="Montants Gérés par Jour"><NoData /></ChartWrapper>;
    }
    
    const chartData = {
        labels: Object.keys(data),
        datasets: [
            {
                label: "Montant géré (FCFA)",
                data: Object.values(data),
                backgroundColor: "rgba(34, 197, 94, 0.8)",
                borderColor: "rgb(34, 197, 94)",
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    return (
        <ChartWrapper title="Montants Gérés par Jour">
            <Bar data={chartData} options={defaultOptions} />
        </ChartWrapper>
    );
};
