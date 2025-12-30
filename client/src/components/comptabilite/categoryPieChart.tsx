// components/comptabilite/CategoryPieChart.tsx - VERSION CORRIGÉE SANS ACTIVEINDEX
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon, Filter, TrendingUp, TrendingDown, Download } from 'lucide-react';
import type { MonthlySummary } from './types';

interface CategoryPieChartProps {
  data: MonthlySummary[];
}

// Type pour les données du graphique
type ChartDataInput = {
  name: string;
  value: number;
  color: string;
  percentage: number;
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [viewType, setViewType] = useState<'value' | 'percentage'>('value');

  // Calcul des données pour le camembert
  const pieData = useMemo((): ChartDataInput[] => {
    const filteredData = selectedMonth === 'all' 
      ? data 
      : data.filter(item => item.mois.toLowerCase() === selectedMonth.toLowerCase());

    if (filteredData.length === 0) {
      return [];
    }

    // Agrégation des données selon le mois sélectionné
    const totalDepots = filteredData.reduce((sum, item) => sum + item.totalDepots, 0);
    const totalRetraits = filteredData.reduce((sum, item) => sum + item.totalRetraits, 0);
    const totalCommission = filteredData.reduce((sum, item) => sum + item.commission, 0);
    const totalFrais = totalCommission * 0.3; // Exemple: frais = 30% des commissions

    const total = totalDepots + totalRetraits + totalCommission + totalFrais;

    const chartData: ChartDataInput[] = [
      { 
        name: 'Dépôts', 
        value: totalDepots, 
        color: '#10b981',
        percentage: total > 0 ? (totalDepots / total) * 100 : 0
      },
      { 
        name: 'Retraits', 
        value: totalRetraits, 
        color: '#ef4444',
        percentage: total > 0 ? (totalRetraits / total) * 100 : 0
      },
      { 
        name: 'Commissions', 
        value: totalCommission, 
        color: '#f59e0b',
        percentage: total > 0 ? (totalCommission / total) * 100 : 0
      },
      { 
        name: 'Frais', 
        value: totalFrais, 
        color: '#8b5cf6',
        percentage: total > 0 ? (totalFrais / total) * 100 : 0
      },
    ].filter(item => item.value > 0);

    return chartData;
  }, [data, selectedMonth]);

  // Données pour les statistiques
  const statistics = useMemo(() => {
    const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
    const largestCategory = pieData.length > 0 
      ? pieData.reduce((max, item) => item.value > max.value ? item : max, pieData[0])
      : null;
    
    // Calcul de l'évolution par rapport au mois précédent
    let trend = { direction: 'stable' as 'up' | 'down' | 'stable', value: 0 };
    if (selectedMonth !== 'all' && data.length > 1) {
      const monthIndex = data.findIndex(item => 
        item.mois.toLowerCase() === selectedMonth.toLowerCase()
      );
      if (monthIndex > 0) {
        const currentMonth = data[monthIndex];
        const previousMonth = data[monthIndex - 1];
        const currentTotal = currentMonth.totalDepots + currentMonth.totalRetraits;
        const previousTotal = previousMonth.totalDepots + previousMonth.totalRetraits;
        const change = ((currentTotal - previousTotal) / previousTotal) * 100;
        
        trend = {
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          value: Math.abs(change)
        };
      }
    }

    return { totalValue, largestCategory, trend };
  }, [pieData, selectedMonth, data]);

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: data.color }}
            />
            <p className="font-bold text-white">{data.name}</p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Montant:</span>
              <span className="text-white font-medium">
                {data.value.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pourcentage:</span>
              <span className="text-white font-medium">
                {data.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-700">
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${data.percentage}%`,
                    backgroundColor: data.color 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Exporter les données
  const exportPieData = () => {
    const csvContent = [
      ['Catégorie', 'Montant (FCFA)', 'Pourcentage'],
      ...pieData.map(item => [
        item.name,
        item.value,
        `${item.percentage.toFixed(2)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repartition_${selectedMonth}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Gérer le survol
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(-1);
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      {/* En-tête avec contrôles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Répartition par Catégorie</h3>
          <p className="text-sm text-slate-400">
            Distribution des flux financiers
            {selectedMonth !== 'all' && ` pour ${selectedMonth}`}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle valeur/pourcentage */}
          <div className="flex rounded-lg border border-slate-700 overflow-hidden">
            <button
              onClick={() => setViewType('value')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewType === 'value'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Valeur
            </button>
            <button
              onClick={() => setViewType('percentage')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewType === 'percentage'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Pourcentage
            </button>
          </div>

          {/* Bouton d'export */}
          <button
            onClick={exportPieData}
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
              onChange={(e) => setSelectedMonth(e.target.value)}
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

      {/* Statistiques */}
      {pieData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <PieChartIcon size={16} className="text-slate-400" />
              <span className="text-sm text-slate-400">Total</span>
            </div>
            <p className="text-xl font-bold text-white">
              {statistics.totalValue.toLocaleString()} FCFA
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ 
                  backgroundColor: statistics.largestCategory?.color || '#64748b' 
                }}
              />
              <span className="text-sm text-slate-400">Catégorie principale</span>
            </div>
            <p className="text-lg font-bold text-white">
              {statistics.largestCategory?.name || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">
              {statistics.largestCategory?.percentage.toFixed(1)}% du total
            </p>
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {statistics.trend.direction === 'up' ? (
                <TrendingUp size={16} className="text-emerald-400" />
              ) : statistics.trend.direction === 'down' ? (
                <TrendingDown size={16} className="text-rose-400" />
              ) : (
                <div className="w-4 h-0.5 bg-slate-400" />
              )}
              <span className="text-sm text-slate-400">Évolution</span>
            </div>
            <p className={`text-lg font-bold ${
              statistics.trend.direction === 'up' ? 'text-emerald-400' :
              statistics.trend.direction === 'down' ? 'text-rose-400' :
              'text-slate-300'
            }`}>
              {statistics.trend.direction === 'up' ? '+' : statistics.trend.direction === 'down' ? '-' : ''}
              {statistics.trend.direction !== 'stable' ? `${statistics.trend.value.toFixed(1)}%` : 'Stable'}
            </p>
            <p className="text-xs text-slate-500">
              vs mois précédent
            </p>
          </div>
        </div>
      )}

      {/* Graphique */}
      <div className="h-72">
        {pieData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <PieChartIcon size={48} className="text-slate-700 mb-4" />
            <p className="text-slate-400 mb-2">Aucune donnée disponible</p>
            <p className="text-sm text-slate-600">
              {selectedMonth === 'all' 
                ? "Les données pour tous les mois sont vides"
                : `Aucune donnée pour le mois de ${selectedMonth}`}
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey={viewType === 'value' ? 'value' : 'percentage'}
                nameKey="name"
                onMouseEnter={(_, index) => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="#1e293b"
                    strokeWidth={2}
                    opacity={hoveredIndex === index ? 1 : 0.85}
                    className="transition-opacity duration-200"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => {
                  const dataItem = pieData.find(item => item.name === value);
                  const displayValue = viewType === 'value' 
                    ? `${dataItem?.value.toLocaleString()} F`
                    : `${dataItem?.percentage.toFixed(1)}%`;
                  
                  return (
                    <span className="text-slate-300 text-sm flex items-center gap-2">
                      <span>{value}</span>
                      <span className="text-slate-500 text-xs">({displayValue})</span>
                    </span>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Légende détaillée */}
      {pieData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Détail par catégorie</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {pieData.map((item, index) => (
              <div 
                key={index}
                className={`bg-slate-900/30 rounded-lg p-3 border transition-all ${
                  hoveredIndex === index ? 'border-slate-600 bg-slate-800/40' : 'border-transparent'
                }`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-slate-300">{item.name}</span>
                  </div>
                  <span className="text-xs text-slate-500">{item.percentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-white">
                    {item.value.toLocaleString()} F
                  </span>
                  <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}