import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api-client.ts";
import type { Agent } from "../types.ts"; // Explicit import

export const useAgents = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAgents = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api<Agent[]>("/agents");
            setAgents(response.data); // Assuming response.data contains { data: Agent[] }
        } catch (err: any) {
            setError(err.message || "An error occurred while fetching agents.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createAgent = useCallback(async (newAgentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => {
        try {
            await api("/agents", { method: "POST", data: newAgentData });
            fetchAgents(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to create agent.");
        }
    }, [fetchAgents]);

    const updateAgent = useCallback(async (id: number, updatedAgentData: Omit<Agent, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            await api(`/agents/${id}`, { method: "PUT", data: updatedAgentData });
            fetchAgents(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to update agent.");
        }
    }, [fetchAgents]);

    const deleteAgent = useCallback(async (id: number) => {
        try {
            await api(`/agents/${id}`, { method: "DELETE" });
            fetchAgents(); // Refresh the list
        } catch (err: any) {
            throw new Error(err.message || "Failed to delete agent.");
        }
    }, [fetchAgents]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);


    return { agents, isLoading, error, refetchAgents: fetchAgents, createAgent, updateAgent, deleteAgent };
};
