import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../services/api-client";
import useAuthStore from "../features/auth/useAuthStore";
import type { ApiEnvelope } from "../types/api";

const CHECK_INTERVAL_MS = 1500;
const MAX_WAIT_MS = 2 * 60 * 1000;

const BootstrapGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [statusText, setStatusText] = useState(
    "Initialisation de l'application...",
  );
  const [errorText, setErrorText] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const runningRef = useRef(false);

  const checkBackendReadiness = useCallback(async () => {
    if (runningRef.current || ready) return;
    runningRef.current = true;
    setAttempt((prev) => prev + 1);
    setStatusText("Démarrage du backend...");

    try {
      const response = await api<ApiEnvelope<{ isInitialized: boolean }>>(
        "/admin/setup-status",
        { method: "GET", trackActivity: false },
      );
      if (response.success && response.data) {
        useAuthStore.setState({ isInitialized: response.data.isInitialized });
      }
      setStatusText("Backend prêt.");
      setErrorText(null);
      setReady(true);
    } catch {
      setStatusText("Préparation du backend en cours...");
      setErrorText(null);
    } finally {
      runningRef.current = false;
      setElapsedMs(Date.now() - startRef.current);
    }
  }, [ready]);

  useEffect(() => {
    startRef.current = Date.now();
    void checkBackendReadiness();
    intervalRef.current = window.setInterval(() => {
      void checkBackendReadiness();
    }, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkBackendReadiness]);

  useEffect(() => {
    if (ready && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    if (!ready && elapsedMs > MAX_WAIT_MS) {
      setErrorText(
        "Le backend met plus de temps que prévu. Vérifiez les logs, puis relancez l'application.",
      );
    }
  }, [elapsedMs, ready]);

  const progress = useMemo(() => {
    if (ready) return 100;
    const phaseProgress = Math.min(85, 15 + attempt * 6);
    const elapsedProgress = Math.min(10, Math.floor(elapsedMs / 3000));
    return Math.min(95, phaseProgress + elapsedProgress);
  }, [attempt, elapsedMs, ready]);

  if (ready) return <>{children}</>;

  return (
    <div className="min-h-screen w-full bg-base-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-base-200 border border-base-300 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold">Chargement initial</h1>
        <p className="mt-2 text-base-content/70">{statusText}</p>

        <progress
          className="progress progress-primary w-full mt-6"
          value={progress}
          max={100}
        />

        <div className="mt-3 text-sm text-base-content/70 flex items-center justify-between">
          <span>{progress}%</span>
          <span>Tentative {attempt}</span>
        </div>

        {errorText ? (
          <div className="mt-4 text-sm text-error">{errorText}</div>
        ) : (
          <div className="mt-4 flex items-center gap-2 text-sm text-base-content/70">
            <span className="loading loading-spinner loading-sm" />
            <span>Préparation des services...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BootstrapGate;
