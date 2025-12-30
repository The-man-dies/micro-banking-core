// components/transactions/TransactionStats.tsx
import React from 'react';
import type { AgentInfo, Transaction } from './type';

interface TransactionStatsProps {
  deposits: Transaction[];
  withdrawals: Transaction[];
  completedTransactions: number;
  pendingTransactions: number;
  agents: AgentInfo[];
  transactions: Transaction[];
}

const TransactionStats: React.FC<TransactionStatsProps> = ({
  deposits,
  withdrawals,
  completedTransactions,
  pendingTransactions,
  agents,
  transactions
}) => {
  return (
    <div className="space-y-6">
      {/* Statistiques détaillées */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Aperçu des transactions</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Dépôts</span>
            <span className="text-white font-medium">{deposits.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Retraits</span>
            <span className="text-white font-medium">{withdrawals.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Transactions complètes</span>
            <span className="text-green-400 font-medium">{completedTransactions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">En attente</span>
            <span className="text-yellow-400 font-medium">{pendingTransactions}</span>
          </div>
        </div>
      </div>

      {/* Agents actifs */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Agents actifs ({agents.length})</h3>
        
        <div className="space-y-3">
          {agents.slice(0, 4).map((agent, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="text-indigo-300 text-sm font-bold">{agent.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{agent.name}</p>
                  <p className="text-xs text-slate-400">{agent.id}</p>
                </div>
              </div>
              <span className="text-slate-400 text-sm">
                {transactions.filter(t => t.agentId === agent.id).length} trans.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionStats;