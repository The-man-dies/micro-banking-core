import { useState } from 'react';
import { Download } from 'lucide-react';
import FinancialSummary from '../components/comptabilite/fInanciaSummary';
import MonthlyChart from '../components/comptabilite/monthlyChart';
import CategoryPieChart from '../components/comptabilite/categoryPieChart';
import JournalEntries from '../components/comptabilite/journalEntries';
import ReportGenerator from '../components/comptabilite/reportGenerator';
import type { MonthlySummary, ComptabiliteEntry } from '../components/comptabilite/types';

// Données d'exemple
const monthlyData: MonthlySummary[] = [
  { mois: 'Jan', totalDepots: 12500000, totalRetraits: 8500000, commission: 125000, solde: 4000000 },
  { mois: 'Fév', totalDepots: 11800000, totalRetraits: 9200000, commission: 118000, solde: 2600000 },
  { mois: 'Mar', totalDepots: 14500000, totalRetraits: 7800000, commission: 145000, solde: 6700000 },
  { mois: 'Avr', totalDepots: 13200000, totalRetraits: 9500000, commission: 132000, solde: 3700000 },
  { mois: 'Mai', totalDepots: 15600000, totalRetraits: 8200000, commission: 156000, solde: 7400000 },
  { mois: 'Juin', totalDepots: 14200000, totalRetraits: 8800000, commission: 142000, solde: 5400000 },
];

const journalEntries: ComptabiliteEntry[] = [
  { id: 1, date: '2024-06-15', description: 'Dépôt client Moussa Diop', categorie: 'depot', debit: 15000, credit: 0, solde: 15000 },
  { id: 2, date: '2024-06-15', description: 'Retrait client Fatou Sow', categorie: 'retrait', debit: 0, credit: 5000, solde: 10000 },
  { id: 3, date: '2024-06-14', description: 'Commission transaction', categorie: 'commission', debit: 150, credit: 0, solde: 9850 },
  { id: 4, date: '2024-06-14', description: 'Frais de service', categorie: 'frais', debit: 500, credit: 0, solde: 9350 },
  { id: 5, date: '2024-06-13', description: 'Dépôt entreprise XYZ', categorie: 'depot', debit: 50000, credit: 0, solde: 59350 },
];

export default function ComptabilitePage() {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [reportUrl, setReportUrl] = useState<string>('');

  const handleReportGenerated = (url: string) => {
    setReportUrl(url);
    // Optionnel: Afficher une notification de succès
    alert(`Rapport généré avec succès: ${url}`);
  };

  const handleExportData = () => {
    // Export simple de toutes les données
    const dataStr = JSON.stringify({ monthlyData, journalEntries }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comptabilite_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Comptabilité</h1>
          <p className="text-slate-400">Gestion financière et rapports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Exporter données
          </button>
          <ReportGenerator
            onReportGenerated={handleReportGenerated}
            monthlyData={monthlyData}
            entries={journalEntries}
          />
        </div>
      </div>

      {/* Cartes de synthèse */}
      <FinancialSummary monthlyData={monthlyData} />

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyChart
          data={monthlyData}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
        <CategoryPieChart data={monthlyData} />
      </div>

      {/* Journal des écritures */}
      <JournalEntries entries={journalEntries} />

      {/* Rapport généré */}
      {reportUrl && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Download className="text-emerald-400" size={20} />
              <div>
                <p className="text-emerald-400 font-medium">Rapport généré avec succès</p>
                <p className="text-sm text-emerald-300/80">{reportUrl}</p>
              </div>
            </div>
            <a
              href={`/${reportUrl}`}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm"
              download
            >
              Télécharger
            </a>
          </div>
        </div>
      )}
    </div>
  );
}