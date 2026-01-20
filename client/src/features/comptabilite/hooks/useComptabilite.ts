import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api";

// Re-using the same logic as the dashboard for now.
// This can be expanded later if specific accounting endpoints are created.
export const useComptabilite = () => {
    const [stats, setStats] = useState<any>(null);
    const [timeSeries, setTimeSeries] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinancialData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsResponse, timeSeriesResponse] = await Promise.all([
                api("/stats/dashboard"),
                api("/stats/timeseries"),
            ]);
            setStats(statsResponse.data.data);
            setTimeSeries(timeSeriesResponse.data.data);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la récupération des données financières.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinancialData();
    }, [fetchFinancialData]);

    return { stats, timeSeries, isLoading, error };
};
