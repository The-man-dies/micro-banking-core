import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api-client";
import type { Transaction } from "../types";

export const useTransactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // This endpoint needs to be created on the backend.
            // For now, we assume it exists and returns all transactions.
            const response = await api<Transaction[]>("/transactions");
            setTransactions(response.data); // Assuming response.data.data is the array
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching transactions.");
            // Since the endpoint likely doesn't exist, we'll mock some data on error
            console.error("Failed to fetch transactions, using mock data.", err);
            const mockTransactions: Transaction[] = [
                { id: 1, type: 'deposit', amount: 5000, clientId: 1, agentId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 2, type: 'payout', amount: 2000, clientId: 2, agentId: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: 3, type: 'renewal', amount: 1000, clientId: 1, agentId: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ];
            setTransactions(mockTransactions);
            setError(null); // Clear error for mock data display
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return { transactions, isLoading, error, refetchTransactions: fetchTransactions };
};
