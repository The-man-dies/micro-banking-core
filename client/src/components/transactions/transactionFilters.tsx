// components/transactions/TransactionFilters.tsx
import React from 'react';
import { Filter, Search } from 'lucide-react';
import type { TransactionType, TransactionStatus } from './type';

interface TransactionFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: TransactionType | 'all';
  setFilterType: (type: TransactionType | 'all') => void;
  filterStatus: TransactionStatus | 'all';
  setFilterStatus: (status: TransactionStatus | 'all') => void;
  dateRange: 'today' | 'week' | 'month' | 'all';
  setDateRange: (range: 'today' | 'week' | 'month' | 'all') => void;
  onReset: () => void;
  filteredCount: number;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  dateRange,
  setDateRange,
  onReset,
  filteredCount
}) => {
  return (
    <div className="space-y-6">
      {/* Barre de recherche */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par client, agent, ID, montant..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white placeholder-slate-500"
            />
          </div>
          <button 
            onClick={onReset}
            className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Réinitialiser
          </button>
        </div>
        
        {searchQuery && (
          <div className="mt-4 text-sm text-slate-400">
            {filteredCount} transaction(s) trouvée(s) pour "{searchQuery}"
          </div>
        )}
      </div>

      {/* Filtres */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Filtrer les transactions</h3>
        
        <div className="space-y-4">
          {/* Type de transaction */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Type de transaction</label>
            <div className="flex gap-2">
              {(['all', 'depot', 'retrait'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {type === 'all' ? 'Tous' : type === 'depot' ? 'Dépôts' : 'Retraits'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Statut */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Statut</label>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Complet', 'Reçu', 'En cours'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? status === 'Complet' 
                        ? 'bg-green-600 text-white'
                        : status === 'En cours'
                        ? 'bg-yellow-600 text-white'
                        : status === 'Reçu'
                        ? 'bg-blue-600 text-white'
                        : 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {status === 'all' ? 'Tous' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Plage de dates */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Période</label>
            <div className="flex items-center gap-2">
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white flex-1"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="all">Tout</option>
              </select>
              <Filter size={16} className="text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;