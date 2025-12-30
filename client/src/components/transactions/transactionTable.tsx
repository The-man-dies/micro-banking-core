// components/transactions/TransactionTable.tsx
import React from 'react';
import { Eye, ChevronDown, ChevronUp } from 'lucide-react';
import type { Transaction, SortConfig } from './type';
import StatusBadge from './transactionStatusBadge';

interface TransactionTableProps {
  transactions: Transaction[];
  sortConfig: SortConfig;
  onSort: (key: 'date' | 'amount') => void;
  onViewDetails: (transaction: Transaction) => void;
  onLoadMore?: () => void;
  limit?: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  sortConfig,
  onSort,
  onViewDetails,
  onLoadMore,
  limit
}) => {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white">Transactions récentes</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/30">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">ID</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Type</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Client</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Montant</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm cursor-pointer" onClick={() => onSort('date')}>
                <div className="flex items-center gap-1">
                  Date
                  {sortConfig.key === 'date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  )}
                </div>
              </th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Statut</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayTransactions.map((transaction) => (
              <tr key={transaction.id} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                <td className="p-4 text-white font-mono">#{transaction.id}</td>
                <td className="p-4">
                  <StatusBadge type={transaction.type} label={transaction.type === 'depot' ? 'Dépôt' : 'Retrait'} />
                </td>
                <td className="p-4">
                  <div>
                    <p className="text-white font-medium">{transaction.user}</p>
                    <p className="text-xs text-slate-400">{transaction.userId}</p>
                  </div>
                </td>
                <td className="p-4 text-white font-medium">
                  {transaction.amount.toLocaleString()} FCFA
                </td>
                <td className="p-4 text-slate-400 text-sm">
                  {formatDate(transaction.date)}
                </td>
                <td className="p-4">
                  <StatusBadge status={transaction.status} label={transaction.status} />
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => onViewDetails(transaction)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
                  >
                    <Eye size={14} />
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {onLoadMore && (
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={onLoadMore}
            className="w-full text-center text-indigo-400 hover:text-indigo-300 text-sm font-medium py-2"
          >
            Voir toutes les transactions →
          </button>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;