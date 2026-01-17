export type TransactionType = {
    id: string;
    clientId: number;
    amount: number;
    type: 'FraisInscription' | 'FraisReactivation' | 'Depot' | 'Retrait';
    description?: string;
    createdAt: string;
};

export type TransactionDto = Omit<TransactionType, 'id' | 'createdAt'>;
