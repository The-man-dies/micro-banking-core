import React from 'react';
import { useComptabilite } from '../hooks/useComptabilite';
import {
    TransactionTimeSeriesChart,
    WeeklyAmountChart,
} from '../../dashboard/components/Charts'; // Re-using charts from dashboard

const StatCard = ({ title, value, description }: { title: string, value: string | number, description?: string }) => (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
        {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
);


const ComptabilitePage = () => {
    const { stats, timeSeries, isLoading, error } = useComptabilite();

    const formatToMillions = (value?: number) => `${((value ?? 0) / 1000000).toFixed(2)} M`;

    if (isLoading) {
        return <div className="text-center py-10 text-white">Chargement des données comptables...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Rapport de Comptabilité</h1>
                    <p className="text-sm md:text-base text-gray-400">Aperçu financier de l'activité</p>
                </div>
                
                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard 
                        title="Solde Total Actif" 
                        value={formatToMillions(stats?.totalCurrentBalance)}
                        description="Solde de tous les comptes clients"
                    />
                    <StatCard 
                        title="Total Dépôts (30j)" 
                        value={formatToMillions(stats?.totalDepositsLast30Days)}
                        description="Montant total déposé"
                    />
                    <StatCard 
                        title="Total Retraits (30j)" 
                        value={formatToMillions(stats?.totalPayoutsLast30Days)}
                        description="Montant total retiré"
                    />
                     <StatCard 
                        title="Transactions (30j)" 
                        value={stats?.totalTransactionsLast30Days ?? 0}
                        description="Nombre total de transactions"
                    />
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TransactionTimeSeriesChart data={timeSeries?.transactionHistory} />
                    <WeeklyAmountChart data={timeSeries?.weeklyAmounts} />
                </div>
            </div>
        </div>
    );
};

export default ComptabilitePage;
