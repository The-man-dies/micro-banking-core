import { useState } from 'react';
import { Download, FileText, Calendar, BarChart, Check } from 'lucide-react';
import Modal from './modal';
import type { ReportConfig, ReportType, ReportFormat } from './types';
import { generateMonthlyReport, generateDailyReport, exportReport } from './utils/reportGenerator';

interface ReportGeneratorProps {
  onReportGenerated: (reportUrl: string) => void;
  monthlyData: any[];
  entries: any[];
}

export default function ReportGenerator({ onReportGenerated, monthlyData, entries }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    type: 'mensuel',
    format: 'pdf',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0],
    includeCharts: true,
    includeDetails: true,
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      let reportData;
      
      switch (config.type) {
        case 'mensuel':
          reportData = await generateMonthlyReport(monthlyData, config);
          break;
        case 'quotidien':
          reportData = await generateDailyReport(entries, config);
          break;
        case 'annuel':
          // Implémentez selon vos besoins
          break;
      }
      
      const reportUrl = await exportReport(reportData, config.format);
      onReportGenerated(reportUrl);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        <FileText size={16} />
        Générer rapport
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Générer un rapport"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isGenerating ? 'Génération...' : (
                <>
                  <Download size={16} />
                  Générer le rapport
                </>
              )}
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="inline mr-2" size={16} />
              Type de rapport
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['mensuel', 'quotidien', 'annuel', 'personnalise'] as ReportType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setConfig({ ...config, type })}
                  className={`p-3 rounded-lg border transition-all ${
                    config.type === type
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {config.type === type && <Check size={16} />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Calendar className="inline mr-2" size={16} />
              Période
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date de début</label>
                <input
                  type="date"
                  value={config.dateDebut}
                  onChange={(e) => setConfig({ ...config, dateDebut: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date de fin</label>
                <input
                  type="date"
                  value={config.dateFin}
                  onChange={(e) => setConfig({ ...config, dateFin: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <Download className="inline mr-2" size={16} />
              Format d'export
            </label>
            <div className="flex gap-2">
              {(['pdf', 'excel', 'csv'] as ReportFormat[]).map((format) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => setConfig({ ...config, format })}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    config.format === format
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <BarChart className="inline mr-2" size={16} />
              Options du rapport
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300 text-sm">Inclure les graphiques</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.includeDetails}
                  onChange={(e) => setConfig({ ...config, includeDetails: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-300 text-sm">Inclure le détail des transactions</span>
              </label>
            </div>
          </div>

          {/* Aperçu */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-2">Aperçu du rapport</h4>
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Rapport {config.type}</p>
              <p>• Période: {new Date(config.dateDebut).toLocaleDateString()} au {new Date(config.dateFin).toLocaleDateString()}</p>
              <p>• Format: {config.format.toUpperCase()}</p>
              <p>• Graphiques: {config.includeCharts ? 'Inclus' : 'Non inclus'}</p>
              <p>• Détails: {config.includeDetails ? 'Inclus' : 'Non inclus'}</p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}