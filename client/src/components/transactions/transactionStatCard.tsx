// components/ui/StatCard.tsx
import { type ElementType } from 'react'; // Importez ElementType

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: ElementType; // Changez le type ici
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon: Icon, bgColor }) => {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className="text-white" size={20} /> {/* Icône rendue correctement */}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-500/20 text-green-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
};

export default StatCard;