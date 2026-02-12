import React from "react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TimeSeriesPoint {
    date: string;
    totalAmount: number;
    transactionCount: number;
}

interface AccountingData {
    deposits: TimeSeriesPoint[];
    payouts: TimeSeriesPoint[];
    inscriptionFees: TimeSeriesPoint[];
    reactivationFees: TimeSeriesPoint[];
}

interface DashboardCombinedTransactionsChartProps {
    accountingData: AccountingData;
}

const ChartWrapper = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
        <h3 className="text-white text-lg font-bold mb-4">{title}</h3>
        <div className="h-80">{children}</div>
    </div>
);

const NoData = () => <p className="text-gray-400 text-center mt-10">Données non disponibles.</p>;

export const DashboardCombinedTransactionsChart: React.FC<DashboardCombinedTransactionsChartProps> = ({ accountingData }) => {
    if (!accountingData || Object.keys(accountingData).every(key => accountingData[key as keyof AccountingData].length === 0)) {
        return <ChartWrapper title="Vue d'ensemble des Transactions par Type"><NoData /></ChartWrapper>;
    }

    // Extract all unique dates and sort them
    const allDates = Array.from(new Set(
        [
            ...accountingData.deposits.map(d => d.date),
            ...accountingData.payouts.map(d => d.date),
            ...accountingData.inscriptionFees.map(d => d.date),
            ...accountingData.reactivationFees.map(d => d.date),
        ]
    )).sort();

    const getDataset = (
        data: TimeSeriesPoint[],
        label: string,
        borderColor: string,
        backgroundColor: string,
    ) => {
        const dataMap = new Map(data.map(d => [d.date, d]));
        return {
            label,
            data: allDates.map(date => {
                const item = dataMap.get(date);
                return item ? item.totalAmount : 0;
            }),
            borderColor,
            backgroundColor,
            fill: true,
            tension: 0.4,
        };
    };

    const chartData = {
        labels: allDates.map(date => new Date(date).toLocaleDateString()),
        datasets: [
            getDataset(accountingData.deposits, "Dépôts", "rgb(34, 197, 94)", "rgba(34, 197, 94, 0.1)"),
            getDataset(accountingData.payouts, "Retraits", "rgb(239, 68, 68)", "rgba(239, 68, 68, 0.1)"),
            getDataset(accountingData.inscriptionFees, "Frais d'Inscription", "rgb(59, 130, 246)", "rgba(59, 130, 246, 0.1)"),
            getDataset(accountingData.reactivationFees, "Frais de Réactivation", "rgb(251, 191, 36)", "rgba(251, 191, 36, 0.1)"),
        ],
    };

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
                callbacks: {
                    label: function (context: any) {
                        const datasetLabel = context.dataset.label || '';
                        const date = allDates[context.dataIndex];
                        let totalAmount = 0;
                        let transactionCount = 0;
                        let relevantData: TimeSeriesPoint[] = [];

                        switch (datasetLabel) {
                            case "Dépôts":
                                relevantData = accountingData.deposits;
                                break;
                            case "Retraits":
                                relevantData = accountingData.payouts;
                                break;
                            case "Frais d'Inscription":
                                relevantData = accountingData.inscriptionFees;
                                break;
                            case "Frais de Réactivation":
                                relevantData = accountingData.reactivationFees;
                                break;
                        }
                        
                        const item = relevantData.find(item => item.date === date);
                        if (item) {
                            totalAmount = item.totalAmount;
                            transactionCount = item.transactionCount;
                        }
                        
                        return [
                            `${datasetLabel} (Montant): ${totalAmount ?? 0} FCFA`,
                            `${datasetLabel} (Transactions): ${transactionCount ?? 0}`,
                        ];
                    }
                }
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

    return (
        <ChartWrapper title="Vue d'ensemble des Transactions par Type">
            <Line data={chartData} options={defaultOptions} />
        </ChartWrapper>
    );
};
