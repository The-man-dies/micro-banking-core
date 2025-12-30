// components/types.ts

// Types existants
export type Client = {
  id: number;
  nom: string;
  prenom: string;
  numero_carnet: string;
  somme_actuelle: number;
  seuil: number;
  status: "actif" | "inactif";
  nombre_transactions: number;
  email?: string;
  telephone?: string;
  adresse?: string;
  date_inscription?: string;
};

export type SortConfig = {
  key: keyof Client;
  direction: "asc" | "desc";
};

export type FilterStatus = "all" | "actif" | "inactif";

export type StatCard = {
  label: string;
  value: string;
  change: string;
  icon: any;
  bgColor: string;
  iconColor: string;
};

// NOUVEAUX TYPES pour les fonctionnalités avancées
export type ClientFormData = Omit<Client, "id" | "nombre_transactions" | "date_inscription"> & {
  nombre_transactions?: number;
  date_inscription?: string;
};
// src/types.ts
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