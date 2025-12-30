import { Users, User, DollarSign, AlertCircle } from "lucide-react";
import type { StatCard } from "./types";

// ... reste du code inchangé... reste du code inchangé
// ... reste du code inchangé
interface HeaderStatsProps {
  stats: StatCard[];
}

const HeaderStats = ({ stats }: HeaderStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`${stat.iconColor}`} size={20} />
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              stat.change.startsWith("+") 
                ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
            }`}>
              {stat.change}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{stat.value}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default HeaderStats;