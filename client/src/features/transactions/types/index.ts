export type Transaction = {
    id: number;
    type: 'deposit' | 'payout' | 'renewal';
    amount: number;
    clientId: number;
    agentId: number;
    createdAt: string;
    updatedAt: string;
};
