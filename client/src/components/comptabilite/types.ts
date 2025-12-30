// types/comptabilite.ts
export type ComptabiliteEntry = {
  id: number;
  date: string;
  description: string;
  categorie: 'depot' | 'retrait' | 'frais' | 'commission';
  debit: number;
  credit: number;
  solde: number;
};

export type MonthlySummary = {
  mois: string;
  totalDepots: number;
  totalRetraits: number;
  commission: number;
  solde: number;
};

export type ReportType = 'mensuel' | 'quotidien' | 'annuel' | 'personnalise';
export type ReportFormat = 'pdf' | 'excel' | 'csv';

export interface ReportConfig {
  type: ReportType;
  format: ReportFormat;
  dateDebut: string;
  dateFin: string;
  includeCharts: boolean;
  includeDetails: boolean;
}
type ChartDataInput = {
  [key in 'name' | 'value' | 'color' | 'percentage']?: any;
} & {
  name: string;
  value: number;
  color: string;
  percentage: number;
};