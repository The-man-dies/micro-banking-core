import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';
import { Search } from 'lucide-react';

const TransactionsTable = ({ transactions }: { transactions: Transaction[] }) => {
    if (!transactions || transactions.length === 0) {
        return <p className="text-center py-10 text-gray-500">Aucune transaction trouvée.</p>;
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800/50">
            <table className="table table-zebra w-full text-white">
                <thead className="bg-slate-900 text-slate-100">
                    <tr>
                        <th className="text-center">ID</th>
                        <th>Type</th>
                        <th className="text-right">Montant</th>
                        <th className="text-center">Client ID</th>
                        <th className="text-center">Agent ID</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-700/10">
                            <td className="text-center">{tx.id}</td>
                            <td>
                                <span className={`badge ${
                                    tx.type === 'deposit' ? 'badge-success' :
                                    tx.type === 'payout' ? 'badge-warning' :
                                    'badge-info'
                                } text-white`}>
                                    {tx.type}
                                </span>
                            </td>
                            <td className="text-right font-bold">{tx.amount.toLocaleString()} FCFA</td>
                            <td className="text-center">{tx.clientId}</td>
                            <td className="text-center">{tx.agentId}</td>
                            <td>{new Date(tx.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TransactionsPage = () => {
    const { transactions, isLoading, error } = useTransactions();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTransactions = transactions.filter(tx =>
        tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.clientId.toString().includes(searchTerm) ||
        tx.agentId.toString().includes(searchTerm)
    );

    if (isLoading) {
        return <div className="text-center py-10 text-white">Chargement des transactions...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-500">Erreur: {error}</div>;
    }

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Historique des Transactions</h1>
                    <p className="text-sm md:text-base text-gray-400">Liste de toutes les transactions enregistrées</p>
                </div>

                {/* Filters Placeholder */}
                <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher par type, ID client/agent..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>

                {/* Transactions Table */}
                <TransactionsTable transactions={filteredTransactions} />
            </div>
        </div>
    );
};

export default TransactionsPage;
