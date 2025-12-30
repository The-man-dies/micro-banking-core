import React from "react";

interface KPICardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: "up" | "down";
    trendValue: string;
    className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendValue, className = "" }) => {
    const trendColors = {
        up: "text-green-500",
        down: "text-red-500",
    };

    const trendIcons = {
        up: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        ),
        down: (
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        ),
    };

    return (
        <div
            className={` "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-al shadow-lg ${className}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    <div className={`flex items-center mt-2 text-sm ${trendColors[trend]}`}>
                        {trendIcons[trend]}
                        <span>{trendValue}</span>
                    </div>
                </div>
                <div className="p-3 rounded-lg bg-indigo-900 bg-opacity-30 text-indigo-400">{icon}</div>
            </div>
        </div>
    );
};

export default KPICard;
