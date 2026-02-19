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
      const response = await api<{ data: Transaction[] }>("/transactions");
      setTransactions(response.data.data); // Assuming response.data.data is the array
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching transactions.");
      // Since the endpoint likely doesn't exist, we'll mock some data on error
      console.error("Failed to fetch transactions, using mock data.", err);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    refetchTransactions: fetchTransactions,
  };
};
