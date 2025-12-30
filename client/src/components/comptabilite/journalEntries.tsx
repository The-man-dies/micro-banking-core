// components/comptabilite/JournalEntries.tsx
import { useState } from 'react';
import { Eye, Download, Filter } from 'lucide-react';
import type { ComptabiliteEntry } from './types';

interface JournalEntriesProps {
  entries: ComptabiliteEntry[];
}

export default function JournalEntries({ entries }: JournalEntriesProps) {
  const [filter, setFilter] = useState<'all' | 'depot' | 'retrait' | 'frais' | 'commission'>('all');
  const [selectedEntry, setSelectedEntry] = useState<ComptabiliteEntry | null>(null);

  // Filtrer les entrées selon la sélection
  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(entry => entry.categorie === filter);

  // Calculer les totaux
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const soldeFinal = filteredEntries[filteredEntries.length - 1]?.solde || 0;

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Obtenir la couleur selon la catégorie
  const getCategoryColor = (categorie: string) => {
    switch (categorie) {
      case 'depot': return 'bg-emerald-500/20 text-emerald-400';
      case 'retrait': return 'bg-rose-500/20 text-rose-400';
      case 'commission': return 'bg-amber-500/20 text-amber-400';
      case 'frais': return 'bg-violet-500/20 text-violet-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  // Télécharger les entrées au format CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Description', 'Catégorie', 'Débit (FCFA)', 'Crédit (FCFA)', 'Solde (FCFA)'],
      ...filteredEntries.map(entry => [
        formatDate(entry.date),
        entry.description,
        entry.categorie,
        entry.debit,
        entry.credit,
        entry.solde
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
      {/* En-tête avec filtres */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Journal des Écritures</h3>
          <p className="text-sm text-slate-400">
            {filteredEntries.length} entrée{filteredEntries.length !== 1 ? 's' : ''} • 
            Solde final: <span className="font-medium text-white">{soldeFinal.toLocaleString()} FCFA</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Filtres */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="all">Toutes les catégories</option>
              <option value="depot">Dépôts</option>
              <option value="retrait">Retraits</option>
              <option value="commission">Commissions</option>
              <option value="frais">Frais</option>
            </select>
          </div>

          {/* Bouton d'export */}
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Tableau des écritures */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-800/30">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Date</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Description</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Catégorie</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Débit</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Crédit</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Solde</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  Aucune écriture trouvée pour cette catégorie
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="p-4">
                    <div className="text-slate-400 text-sm">{formatDate(entry.date)}</div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-white font-medium">{entry.description}</div>
                    <div className="text-xs text-slate-500">ID: #{entry.id.toString().padStart(4, '0')}</div>
                  </td>
                  
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getCategoryColor(entry.categorie)}`}>
                      {entry.categorie === 'depot' ? 'Dépôt' :
                       entry.categorie === 'retrait' ? 'Retrait' :
                       entry.categorie === 'commission' ? 'Commission' : 'Frais'}
                    </span>
                  </td>
                  
                  <td className="p-4">
                    {entry.debit > 0 ? (
                      <div className="text-emerald-400 font-medium">
                        +{entry.debit.toLocaleString()} FCFA
                      </div>
                    ) : (
                      <div className="text-slate-500">-</div>
                    )}
                  </td>
                  
                  <td className="p-4">
                    {entry.credit > 0 ? (
                      <div className="text-rose-400 font-medium">
                        -{entry.credit.toLocaleString()} FCFA
                      </div>
                    ) : (
                      <div className="text-slate-500">-</div>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <div className={`font-medium ${
                      entry.solde >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {entry.solde.toLocaleString()} FCFA
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <button 
                      onClick={() => setSelectedEntry(entry)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-all"
                    >
                      <Eye size={14} />
                      Détails
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pied du tableau avec totaux */}
      {filteredEntries.length > 0 && (
        <div className="p-4 border-t border-slate-700 bg-slate-800/30">
          <div className="flex justify-between items-center">
            <div className="text-sm text-slate-400">
              Affichage de {filteredEntries.length} entrée{filteredEntries.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Débit</div>
                <div className="text-emerald-400 font-medium">+{totalDebit.toLocaleString()} FCFA</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Total Crédit</div>
                <div className="text-rose-400 font-medium">-{totalCredit.toLocaleString()} FCFA</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Solde Final</div>
                <div className="text-white font-bold">{soldeFinal.toLocaleString()} FCFA</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail (optionnel) */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Détail de l'écriture</h3>
                <button 
                  onClick={() => setSelectedEntry(null)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">ID</p>
                  <p className="text-white font-mono">#{selectedEntry.id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Date</p>
                  <p className="text-white">{new Date(selectedEntry.date).toLocaleString('fr-FR')}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="text-white">{selectedEntry.description}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Catégorie</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedEntry.categorie)}`}>
                    {selectedEntry.categorie}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Débit</p>
                  <p className="text-emerald-400 font-medium">
                    {selectedEntry.debit > 0 ? `+${selectedEntry.debit.toLocaleString()} FCFA` : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Crédit</p>
                  <p className="text-rose-400 font-medium">
                    {selectedEntry.credit > 0 ? `-${selectedEntry.credit.toLocaleString()} FCFA` : '-'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-400">Solde après opération</p>
                  <p className={`text-lg font-bold ${
                    selectedEntry.solde >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {selectedEntry.solde.toLocaleString()} FCFA
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700">
              <button 
                onClick={() => setSelectedEntry(null)}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}