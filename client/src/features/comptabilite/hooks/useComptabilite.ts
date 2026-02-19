import { useState, useEffect, useCallback } from "react";
import api from "../../../services/api-client";

export const useComptabilite = () => {
  const [accountingData, setAccountingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get("/accountings");
      setAccountingData(response.data.data);
    } catch (err: any) {
      setError(
        err.message ||
          "Erreur lors de la récupération des données comptables.",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountingData();
  }, [fetchAccountingData]);

  return { accountingData, isLoading, error };
};
