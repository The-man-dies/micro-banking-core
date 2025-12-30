import { TrendingUp, BarChart3, Calculator, FileText } from 'lucide-react';
import type { MonthlySummary } from './types';

interface FinancialSummaryProps {
  monthlyData: MonthlySummary[];
}

export default function FinancialSummary({ monthlyData }: FinancialSummaryProps) {
  const totalDepots = monthlyData.reduce((sum, m) => sum + m.totalDepots, 0);
  const totalRetraits = monthlyData.reduce((sum, m) => sum + m.totalRetraits, 0);
  const totalCommission = monthlyData.reduce((sum, m) => sum + m.commission, 0);
  const soldeActuel = totalDepots - totalRetraits;

  const statCards = [
    {
      title: 'Solde Actuel',
      value: `${soldeActuel.toLocaleString()} FCFA`,
      icon: TrendingUp,
      color: 'emerald',
      trend: '+12.5%',
    },
    {
      title: 'Total Dépôts',
      value: `${totalDepots.toLocaleString()} FCFA`,
      icon: BarChart3,
      color: 'blue',
      trend: '+8.2%',
    },
    {
      title: 'Total Retraits',
      value: `${totalRetraits.toLocaleString()} FCFA`,
      icon: Calculator,
      color: 'rose',
      trend: '-3.1%',
    },
    {
      title: 'Commissions',
      value: `${totalCommission.toLocaleString()} FCFA`,
      icon: FileText,
      color: 'amber',
      trend: '+15%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        const colorClasses = {
          emerald: 'bg-emerald-500/10 text-emerald-400',
          blue: 'bg-blue-500/10 text-blue-400',
          rose: 'bg-rose-500/10 text-rose-400',
          amber: 'bg-amber-500/10 text-amber-400',
        };

        return (
          <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-slate-400 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
            <div className={`text-sm ${stat.trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stat.trend} vs mois dernier
            </div>
          </div>
        );
      })}
    </div>
  );
}