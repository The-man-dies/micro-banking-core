export const TransactionType = {
  FraisInscription: "FraisInscription",
  FraisReactivation: "FraisReactivation",
  Depot: "Depot",
  Retrait: "Retrait",
  Expiration: "Expiration",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export type TransactionData = {
  id: string;
  clientId: number;
  amount: number;
  type: TransactionType;
  description?: string;
  createdAt: string;
};

export type TransactionDto = Omit<TransactionData, "id" | "createdAt">;
