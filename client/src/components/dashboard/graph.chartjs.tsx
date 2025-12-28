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

// Enregistrement des composants Chart.js
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

// Configuration par défaut pour les graphiques
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

// Graphique en ligne pour série temporelle des transactions
export const TransactionTimeSeriesChart: React.FC = () => {
    // Fausses données - série temporelle (7 derniers jours)
    const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const transactionData = [450, 520, 480, 610, 580, 650, 720];
    const montantData = [8.5, 9.2, 8.8, 11.2, 10.5, 12.1, 13.5];

    const data = {
        labels,
        datasets: [
            {
                label: "Nombre de transactions",
                data: transactionData,
                borderColor: "rgb(99, 102, 241)",
                backgroundColor: "rgba(99, 102, 241, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(99, 102, 241)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
            },
            {
                label: "Montant (M FCFA)",
                data: montantData,
                borderColor: "rgb(34, 197, 94)",
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "rgb(34, 197, 94)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: "y1",
            },
        ],
    };

    const options = {
        ...defaultOptions,
        plugins: {
            ...defaultOptions.plugins,
            title: {
                display: true,
                text: "Évolution des Transactions (7 derniers jours)",
                color: "#fff",
                font: {
                    size: 16,
                    weight: "bold" as const,
                },
            },
        },
        scales: {
            ...defaultOptions.scales,
            y: {
                ...defaultOptions.scales.y,
                position: "left" as const,
                title: {
                    display: true,
                    text: "Nombre de transactions",
                    color: "#9CA3AF",
                },
            },
            y1: {
                type: "linear" as const,
                display: true,
                position: "right" as const,
                title: {
                    display: true,
                    text: "Montant (M FCFA)",
                    color: "#9CA3AF",
                },
                ticks: {
                    color: "#9CA3AF",
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="h-80">
                <Line data={data} options={options} />
            </div>
        </div>
    );
};

// Graphique en barres pour statistiques par catégorie
export const CategoryStatsChart: React.FC = () => {
    // Fausses données - statistiques par type de transaction
    const labels = ["Dépôt", "Retrait", "Transfert", "Paiement", "Recharge"];
    const data = {
        labels,
        datasets: [
            {
                label: "Nombre de transactions",
                data: [1250, 980, 750, 620, 450],
                backgroundColor: [
                    "rgba(99, 102, 241, 0.8)",
                    "rgba(34, 197, 94, 0.8)",
                    "rgba(251, 191, 36, 0.8)",
                    "rgba(239, 68, 68, 0.8)",
                    "rgba(168, 85, 247, 0.8)",
                ],
                borderColor: [
                    "rgb(99, 102, 241)",
                    "rgb(34, 197, 94)",
                    "rgb(251, 191, 36)",
                    "rgb(239, 68, 68)",
                    "rgb(168, 85, 247)",
                ],
                borderWidth: 2,
                borderRadius: 8,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        plugins: {
            ...defaultOptions.plugins,
            title: {
                display: true,
                text: "Transactions par Catégorie",
                color: "#fff",
                font: {
                    size: 16,
                    weight: "bold" as const,
                },
            },
        },
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

// Graphique circulaire pour répartition des agents
export const AgentDistributionChart: React.FC = () => {
    // Fausses données - répartition des agents
    const data = {
        labels: ["Actifs", "Inactifs", "En attente"],
        datasets: [
            {
                label: "Agents",
                data: [8, 1, 1],
                backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(251, 191, 36, 0.8)"],
                borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)", "rgb(251, 191, 36)"],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        plugins: {
            ...defaultOptions.plugins,
            title: {
                display: true,
                text: "Répartition des Agents",
                color: "#fff",
                font: {
                    size: 16,
                    weight: "bold" as const,
                },
            },
        },
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="h-80">
                <Doughnut data={data} options={options} />
            </div>
        </div>
    );
};

// Graphique en barres pour montants par jour de la semaine
export const WeeklyAmountChart: React.FC = () => {
    const labels = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
    const data = {
        labels,
        datasets: [
            {
                label: "Montant géré (M FCFA)",
                data: [8.5, 9.2, 8.8, 11.2, 10.5, 12.1, 13.5],
                backgroundColor: "rgba(99, 102, 241, 0.8)",
                borderColor: "rgb(99, 102, 241)",
                borderWidth: 2,
                borderRadius: 6,
            },
        ],
    };

    const options = {
        ...defaultOptions,
        plugins: {
            ...defaultOptions.plugins,
            title: {
                display: true,
                text: "Montants Gérés par Jour",
                color: "#fff",
                font: {
                    size: 16,
                    weight: "bold" as const,
                },
            },
        },
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};
