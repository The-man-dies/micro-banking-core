import { useState } from 'react';
import { Download, TrendingUp, DollarSign, UserCheck } from 'lucide-react';
import type { Transaction, SortConfig, StatCard } from '../components/transactions/type';
import StatCardComponent from '../components/transactions/transactionStatCard';
import TransactionFilters from '../components/transactions/transactionFilters';
import TransactionTable from '../components/transactions/transactionTable';
import TransactionDetails from '../components/transactions/transactionDetails';
import TransactionStats from '../components/transactions/transactionStats';
import AddTransactionModal from '../components/transactions/addTransactionModal';

const TransactionsPage: React.FC = () => {
  // États
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: 'depot', user: 'Moussa Diop', userId: 'CL001', agent: 'Agent K', agentId: 'AG001', amount: 15000, date: '2024-01-15 10:42', status: 'Reçu', commission: 150, location: 'Dakar', method: 'Espèces' },
    { id: 2, type: 'retrait', user: 'Fatou Sow', userId: 'CL002', agent: 'Agent K', agentId: 'AG001', amount: 5000, date: '2024-01-15 09:15', status: 'Complet', commission: 50, location: 'Thiès', method: 'Mobile Money' },
    { id: 3, type: 'depot', user: 'Jean Kouame', userId: 'CL003', agent: 'Agent Z', agentId: 'AG002', amount: 50000, date: '2024-01-14 14:30', status: 'En cours', commission: 500, location: 'Abidjan', method: 'Carte' },
    { id: 4, type: 'retrait', user: 'Aminata Diallo', userId: 'CL004', agent: 'Agent X', agentId: 'AG003', amount: 2500, date: '2024-01-14 11:20', status: 'Complet', commission: 25, location: 'Bamako', method: 'Espèces' },
    { id: 5, type: 'depot', user: 'Oumar Diallo', userId: 'CL005', agent: 'Agent Y', agentId: 'AG004', amount: 30000, date: '2024-01-13 16:45', status: 'Reçu', commission: 300, location: 'Ouagadougou', method: 'Mobile Money' },
    { id: 6, type: 'retrait', user: 'Adama Traoré', userId: 'CL006', agent: 'Agent K', agentId: 'AG001', amount: 10000, date: '2024-01-13 13:10', status: 'Complet', commission: 100, location: 'Dakar', method: 'Carte' },
    { id: 7, type: 'depot', user: 'Mariam Sy', userId: 'CL007', agent: 'Agent X', agentId: 'AG003', amount: 7500, date: '2024-01-12 08:30', status: 'Reçu', commission: 75, location: 'Thiès', method: 'Espèces' },
    { id: 8, type: 'retrait', user: 'Ibrahim Ba', userId: 'CL008', agent: 'Agent Z', agentId: 'AG002', amount: 12000, date: '2024-01-12 15:20', status: 'Complet', commission: 120, location: 'Abidjan', method: 'Mobile Money' },
  ]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'depot' | 'retrait'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Reçu' | 'Complet' | 'En cours'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Calcul des statistiques
  const totalTransactions = transactions.length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const uniqueAgents = [...new Set(transactions.map(t => t.agentId))].length;
  const totalCommission = transactions.reduce((sum, t) => sum + t.commission, 0);
  
  // Transactions par type
  const deposits = transactions.filter(t => t.type === 'depot');
  const withdrawals = transactions.filter(t => t.type === 'retrait');
  
  // Statistiques par statut
  const completedTransactions = transactions.filter(t => t.status === 'Complet').length;
  const receivedTransactions = transactions.filter(t => t.status === 'Reçu').length;
  const pendingTransactions = transactions.filter(t => t.status === 'En cours').length;

  // Agents info
  const getAgentInfo = () => {
    const agentMap = new Map<string, { name: string; id: string }>();
    transactions.forEach(t => {
      if (!agentMap.has(t.agentId)) {
        agentMap.set(t.agentId, { name: t.agent, id: t.agentId });
      }
    });
    return Array.from(agentMap.values());
  };

  // Filtrage des transactions
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = 
      searchQuery === '' ||
      transaction.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toString().includes(searchQuery) ||
      transaction.amount.toString().includes(searchQuery);
    
    const matchesType = filterType === 'all' || transaction.type === filterType;
    const matchesStatus = filterStatus === 'all' || transaction.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Tri des transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortConfig.key === 'date') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortConfig.key === 'amount') {
      return sortConfig.direction === 'asc' 
        ? a.amount - b.amount
        : b.amount - a.amount;
    }
    return 0;
  });

  // Handlers
  const handleSort = (key: 'date' | 'amount'): void => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const nextId = Math.max(...transactions.map(t => t.id)) + 1;
    const transactionToAdd: Transaction = {
      ...newTransaction,
      id: nextId,
      date: new Date().toISOString()
    };
    
    setTransactions(prev => [transactionToAdd, ...prev]);
  };

  const exportToCSV = (): void => {
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      return date.toLocaleString('fr-FR');
    };

    const csvContent = [
      ['ID', 'Type', 'Client', 'Agent', 'Montant', 'Date', 'Statut', 'Commission', 'Méthode', 'Localisation'],
      ...sortedTransactions.map(t => [
        t.id,
        t.type === 'depot' ? 'Dépôt' : 'Retrait',
        t.user,
        t.agent,
        `${t.amount} FCFA`,
        formatDate(t.date),
        t.status,
        `${t.commission} FCFA`,
        t.method,
        t.location
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Configuration des cartes de statistiques
  const statCards: StatCard[] = [
    { 
      label: 'Total Transactions', 
      value: totalTransactions.toString(), 
      change: '+12%', 
      icon: TrendingUp,
      bgColor: 'bg-blue-500/10'
    },
    { 
      label: 'Montant Total', 
      value: `${totalAmount.toLocaleString()} FCFA`, 
      change: '+8%', 
      icon: DollarSign,
      bgColor: 'bg-green-500/10'
    },
    { 
      label: 'Agents Actifs', 
      value: uniqueAgents.toString(), 
      change: '+5%', 
      icon: UserCheck,
      bgColor: 'bg-indigo-500/10'
    },
    { 
      label: 'Commission Totale', 
      value: `${totalCommission.toLocaleString()} FCFA`, 
      change: '+15%', 
      icon: DollarSign,
      bgColor: 'bg-amber-500/10'
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400">Gérez toutes les transactions du système</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Download size={16} />
            Exporter CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Nouvelle transaction
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCardComponent key={index} {...stat} />
        ))}
      </div>

      {/* Tableau principal et sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions récentes */}
        <div className="lg:col-span-2">
          <TransactionTable
            transactions={sortedTransactions}
            sortConfig={sortConfig}
            onSort={handleSort}
            onViewDetails={setSelectedTransaction}
            onLoadMore={showAllTransactions ? undefined : () => setShowAllTransactions(true)}
            limit={showAllTransactions ? undefined : 5}
          />
        </div>

        {/* Sidebar */}
        <div>
          <TransactionFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterType={filterType}
            setFilterType={setFilterType}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            dateRange={dateRange}
            setDateRange={setDateRange}
            onReset={() => {
              setSearchQuery('');
              setFilterType('all');
              setFilterStatus('all');
              setDateRange('today');
            }}
            filteredCount={filteredTransactions.length}
          />
          
          <TransactionStats
            deposits={deposits}
            withdrawals={withdrawals}
            completedTransactions={completedTransactions}
            pendingTransactions={pendingTransactions}
            agents={getAgentInfo()}
            transactions={transactions}
          />
        </div>
      </div>

      {/* Modals */}
      <TransactionDetails
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};

export default TransactionsPage;