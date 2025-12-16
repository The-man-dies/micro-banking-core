import { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    ArrowRightLeft,
    Wallet,
    Bell,
    Search,
    Menu,
    ArrowUpRight,
    ArrowDownLeft,
    MoreVertical,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- MOCK DATA (Pour faire vrai) ---
const chartData = [
    { name: 'Lun', value: 4000 },
    { name: 'Mar', value: 3000 },
    { name: 'Mer', value: 2000 },
    { name: 'Jeu', value: 2780 },
    { name: 'Ven', value: 1890 },
    { name: 'Sam', value: 2390 },
    { name: 'Dim', value: 3490 },
];

const transactions = [
    { id: 1, type: 'depot', user: 'Moussa Diop', agent: 'Agent K', amount: 15000, date: '10:42 AM', status: 'Reçu' },
    { id: 2, type: 'retrait', user: 'Fatou Sow', agent: 'Agent K', amount: 5000, date: '09:15 AM', status: 'Complet' },
    { id: 3, type: 'depot', user: 'Jean Kouame', agent: 'Agent Z', amount: 50000, date: 'Hier', status: 'En cours' },
    { id: 4, type: 'retrait', user: 'Aminata Diallo', agent: 'Agent X', amount: 2500, date: 'Hier', status: 'Complet' },
];

// --- COMPOSANTS UI ---

const StatCard = ({ title, value, change, isPositive, icon: Icon }: any) => (
    <div className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 shadow-lg group">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition-colors">{value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Icon size={20} />
            </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {change}
            </span>
            <span className="text-slate-500 text-xs">vs mois dernier</span>
        </div>
    </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${active
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
);

// --- MAIN APP ---

function Layout() {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-indigo-500/30">

            {/* SIDEBAR */}
            <aside className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 w-64 p-4 z-50 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">MicroBanq</h1>
                        <p className="text-xs text-slate-500">Admin Panel</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} />
                    <SidebarItem icon={Users} label="Clients" active={activeTab === 'Clients'} onClick={() => setActiveTab('Clients')} />
                    <SidebarItem icon={Users} label="Agents" active={activeTab === 'Agents'} onClick={() => setActiveTab('Agents')} />
                    <SidebarItem icon={ArrowRightLeft} label="Transactions" active={activeTab === 'Transactions'} onClick={() => setActiveTab('Transactions')} />
                    <SidebarItem icon={Wallet} label="Comptabilité" active={activeTab === 'Comptabilité'} onClick={() => setActiveTab('Comptabilité')} />
                </nav>

                <div className="absolute bottom-8 left-4 right-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">A</div>
                            <div>
                                <p className="text-sm font-bold text-white">Admin</p>
                                <p className="text-xs text-slate-400">Superviseur</p>
                            </div>
                        </div>
                        <button className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors text-sm font-medium">
                            <LogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : ''} min-h-screen`}>

                {/* TOPBAR */}
                <header className="sticky top-0 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 p-4 z-40">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
                            <Menu />
                        </button>

                        <div className="hidden md:flex items-center gap-4 flex-1 max-w-md ml-4">
                            <div className="relative w-full group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Rechercher un agent, une transaction..."
                                    className="w-full bg-slate-800 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all text-white placeholder-slate-500"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
                            </button>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                                + Nouveau Dépôt
                            </button>
                        </div>
                    </div>
                </header>

                {/* DASHBOARD CONTENT */}
                <div className="p-6 max-w-7xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Vue d'ensemble</h2>
                        <p className="text-slate-400">Bienvenue sur le dashboard de gestion MicroBanq.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="Solde Total" value="12,500,000 F" change="+12.5%" isPositive={true} icon={Wallet} />
                        <StatCard title="Agents Actifs" value="24" change="+2" isPositive={true} icon={Users} />
                        <StatCard title="Volume Transac." value="450" change="-1.2%" isPositive={false} icon={ArrowRightLeft} />
                        <StatCard title="Nouveaux Clients" value="18" change="+8%" isPositive={true} icon={Users} />
                    </div>

                    {/* Main Chart Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-lg">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-white">Flux Financier</h3>
                                <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg p-2 outline-none">
                                    <option>Cette Semaine</option>
                                    <option>Ce Mois</option>
                                </select>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                                        <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#818cf8' }}
                                        />
                                        <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Quick Transfer / Action */}
                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold mb-2">Action Rapide</h3>
                                <p className="text-indigo-100 text-sm mb-6">Valider un transfert agent instantanément.</p>

                                <div className="space-y-4">
                                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                        <label className="text-xs text-indigo-200 block mb-1">ID Agent</label>
                                        <div className="font-mono text-lg font-bold">AGT-8821</div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                                        <label className="text-xs text-indigo-200 block mb-1">Montant</label>
                                        <input type="number" placeholder="0 FCFA" className="bg-transparent text-lg font-bold w-full outline-none placeholder-indigo-300/50" />
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-xl mt-6 hover:bg-indigo-50 transition-colors">
                                Valider le Dépôt
                            </button>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Transactions Récentes</h3>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Voir tout</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-medium">Type</th>
                                        <th className="p-4 font-medium">Client</th>
                                        <th className="p-4 font-medium">Agent</th>
                                        <th className="p-4 font-medium">Montant</th>
                                        <th className="p-4 font-medium">Statut</th>
                                        <th className="p-4 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700 text-sm">
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className={`flex items-center gap-2 font-medium ${tx.type === 'depot' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                    {tx.type === 'depot' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                                    {tx.type === 'depot' ? 'Dépôt' : 'Retrait'}
                                                </div>
                                            </td>
                                            <td className="p-4 text-white font-medium">{tx.user}</td>
                                            <td className="p-4 text-slate-400">{tx.agent}</td>
                                            <td className="p-4 text-white font-mono">{tx.amount.toLocaleString()} F</td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${tx.status === 'Complet' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                    tx.status === 'En cours' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Layout;