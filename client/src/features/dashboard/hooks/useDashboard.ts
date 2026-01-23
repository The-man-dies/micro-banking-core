import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api-client";

export const useDashboard = () => {
    const [stats, setStats] = useState<any>(null);
    const [timeSeries, setTimeSeries] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
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
            setError(err.message || "Erreur lors de la récupération des données du tableau de bord.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return { stats, timeSeries, isLoading, error };
};
