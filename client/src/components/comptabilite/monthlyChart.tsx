// components/comptabilite/MonthlyChart.tsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Filter, TrendingUp, TrendingDown, Download } from 'lucide-react';
import type { MonthlySummary } from './types';

interface MonthlyChartProps {
  data: MonthlySummary[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function MonthlyChart({ data, selectedMonth, onMonthChange }: MonthlyChartProps) {
  const [viewMode, setViewMode] = useState<'bars' | 'area'>('bars');
  const [showCommissions, setShowCommissions] = useState(true);

  // Filtrer les données si un mois est sélectionné
  const filteredData = selectedMonth === 'all' 
    ? data 
    : data.filter(item => item.mois.toLowerCase() === selectedMonth.toLowerCase());

  // Calculer les statistiques
  const totalDepots = filteredData.reduce((sum, item) => sum + item.totalDepots, 0);
  const totalRetraits = filteredData.reduce((sum, item) => sum + item.totalRetraits, 0);
  const totalCommission = filteredData.reduce((sum, item) => sum + item.commission, 0);
  const soldeMoyen = filteredData.reduce((sum, item) => sum + item.solde, 0) / (filteredData.length || 1);
  
  // Tendance (comparaison avec le mois précédent)
  const getTrend = () => {
    if (filteredData.length < 2) return { direction: 'stable', percentage: 0 };
    
    const current = filteredData[filteredData.length - 1];
    const previous = filteredData[filteredData.length - 2];
    const trend = ((current.solde - previous.solde) / previous.solde) * 100;
    
    return {
      direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      percentage: Math.abs(trend).toFixed(1)
    };
  };

  const trend = getTrend();

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
          <p className="font-bold text-white mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Dépôts</span>
              <span className="text-emerald-400 font-medium">
                {payload[0]?.value?.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400">Retraits</span>
              <span className="text-rose-400 font-medium">
                {payload[1]?.value?.toLocaleString()} FCFA
              </span>
            </div>
            {showCommissions && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">Commissions</span>
                <span className="text-amber-400 font-medium">
                  {payload[2]?.value?.toLocaleString()} FCFA
                </span>
              </div>
            )}
            <div className="pt-2 mt-2 border-t border-slate-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-300">Solde</span>
                <span className={`font-bold ${
                  payload[0]?.value - payload[1]?.value >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {(payload[0]?.value - payload[1]?.value).toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Exporter les données du graphique
  const exportChartData = () => {
    const csvContent = [
      ['Mois', 'Dépôts (FCFA)', 'Retraits (FCFA)', 'Commissions (FCFA)', 'Solde (FCFA)'],
      ...filteredData.map(item => [
        item.mois,
        item.totalDepots,
        item.totalRetraits,
        item.commission,
        item.solde
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flux_financier_${selectedMonth}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Flux Financier Mensuel</h3>
          <p className="text-sm text-slate-400">
            Évolution des dépôts et retraits
            {selectedMonth !== 'all' && ` pour ${selectedMonth}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode d'affichage */}
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setViewMode('bars')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'bars'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Barres
            </button>
            <button
              onClick={() => setViewMode('area')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'area'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Surface
            </button>
          </div>

          {/* Toggle commissions */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCommissions}
              onChange={(e) => setShowCommissions(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-10 h-5 rounded-full transition-colors ${
              showCommissions ? 'bg-amber-500' : 'bg-slate-700'
            }`}>
              <div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${
                showCommissions ? 'translate-x-6' : 'translate-x-1'
              } mt-1`} />
            </div>
            <span className="text-sm text-slate-300">Commissions</span>
          </label>

          {/* Bouton d'export */}
          <button
            onClick={exportChartData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            title="Exporter les données"
          >
            <Download size={14} />
          </button>

          {/* Filtre par mois */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white"
            >
              <option value="all">Tous les mois</option>
              {data.map((item) => (
                <option key={item.mois} value={item.mois.toLowerCase()}>
                  {item.mois}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">Total Dépôts</p>
          <p className="text-lg font-bold text-emerald-400">{totalDepots.toLocaleString()} F</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">Total Retraits</p>
          <p className="text-lg font-bold text-rose-400">{totalRetraits.toLocaleString()} F</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-400">Commissions</p>
          <p className="text-lg font-bold text-amber-400">{totalCommission.toLocaleString()} F</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Solde Moyen</p>
              <p className="text-lg font-bold text-white">{soldeMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} F</p>
            </div>
            {trend.direction !== 'stable' && (
              <div className={`flex items-center gap-1 ${trend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {trend.direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="text-xs">{trend.percentage}%</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bars' ? (
            <BarChart data={filteredData}>
              <defs>
                <linearGradient id="colorDepots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRetraits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorCommissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="mois" 
                stroke="#64748b" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#64748b" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-slate-300 text-sm">{value}</span>
                )}
              />
              <Bar 
                dataKey="totalDepots" 
                name="Dépôts" 
                fill="url(#colorDepots)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar 
                dataKey="totalRetraits" 
                name="Retraits" 
                fill="url(#colorRetraits)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              {showCommissions && (
                <Bar 
                  dataKey="commission" 
                  name="Commissions" 
                  fill="url(#colorCommissions)" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              )}
            </BarChart>
          ) : (
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="areaDepots" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaRetraits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="mois" stroke="#64748b" axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="totalDepots"
                name="Dépôts"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#areaDepots)"
              />
              <Area
                type="monotone"
                dataKey="totalRetraits"
                name="Retraits"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#areaRetraits)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Légende détaillée */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span className="text-sm text-slate-300">Dépôts</span>
            <span className="text-xs text-slate-500">
              ({((totalDepots / (totalDepots + totalRetraits)) * 100).toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span className="text-sm text-slate-300">Retraits</span>
            <span className="text-xs text-slate-500">
              ({((totalRetraits / (totalDepots + totalRetraits)) * 100).toFixed(1)}%)
            </span>
          </div>
          {showCommissions && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-sm text-slate-300">Commissions</span>
              <span className="text-xs text-slate-500">
                ({((totalCommission / totalDepots) * 100).toFixed(2)}% des dépôts)
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}