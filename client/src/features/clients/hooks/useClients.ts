import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api-client";
import type { Client } from "../types";

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api<Client[]>("/clients");
            setClients(response.data); // Assuming response.data contains { data: Client[] }
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching clients.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const createClient = useCallback(async (newClientData: Omit<Client, 'id' | 'accountBalance' | 'accountStatus' | 'createdAt' | 'updatedAt'>) => {
        try {
            await api("/clients", { method: "POST", data: newClientData });
            fetchClients(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to create client.");
        }
    }, [fetchClients]);

    const updateClient = useCallback(async (id: number, updatedClientData: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            await api(`/clients/${id}`, { method: "PUT", data: updatedClientData });
            fetchClients(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to update client.");
        }
    }, [fetchClients]);

    const deleteClient = useCallback(async (id: number) => {
        try {
            await api(`/clients/${id}`, { method: "DELETE" });
            fetchClients(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to delete client.");
        }
    }, [fetchClients]);

    const deposit = useCallback(async (clientId: number, amount: number) => {
        try {
            await api(`/clients/${clientId}/deposit`, { method: "POST", data: { amount } });
            fetchClients(); // Refresh the list to reflect new balance
        } catch (err: any) {
            throw new Error(err.message || "Failed to process deposit.");
        }
    }, [fetchClients]);

    const payout = useCallback(async (clientId: number, amount: number) => {
        try {
            await api(`/clients/${clientId}/payout`, { method: "POST", data: { amount } });
            fetchClients(); // Refresh the list to reflect new balance
        } catch (err: any) {
            throw new Error(err.message || "Failed to process payout.");
        }
    }, [fetchClients]);

    const renewAccount = useCallback(async (clientId: number) => {
        try {
            await api(`/clients/${clientId}/renew`, { method: "POST" });
            fetchClients(); // Refresh the list to reflect new status/renewal date
        } catch (err: any) {
            throw new Error(err.message || "Failed to renew account.");
        }
    }, [fetchClients]);

    return {
        clients,
        isLoading,
        error,
        refetchClients: fetchClients,
        createClient,
        updateClient,
        deleteClient,
        deposit,
        payout,
        renewAccount
    };
};
