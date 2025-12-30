// types.ts
export type TransactionType = 'depot' | 'retrait';
export type TransactionStatus = 'Reçu' | 'Complet' | 'En cours';
export type PaymentMethod = 'Espèces' | 'Mobile Money' | 'Carte';
export type DateRange = 'today' | 'week' | 'month' | 'all';
export type SortDirection = 'asc' | 'desc';

export interface Transaction {
  id: number;
  type: TransactionType;
  user: string;
  userId: string;
  agent: string;
  agentId: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  commission: number;
  location: string;
  method: PaymentMethod;
}

export interface SortConfig {
  key: 'date' | 'amount';
  direction: SortDirection;
}

export interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: React.ElementType;
  bgColor: string;
}

export interface AgentInfo {
  name: string;
  id: string;
}