import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import MainLayout from "@/features/layout/main/MainLayout";
import AgentPage from "@/features/agents/routes/AgentPage";
import ClientPage from "@/features/clients/routes/ClientPage";
import AdminProfilePage from "@/features/admin/routes/AdminProfilePage";
import TransactionsPage from "@/features/transactions/routes/TransactionsPage";
import ComptabilitePage from "@/features/comptabilite/routes/ComptabilitePage";
import LoginPage from "@/features/auth/routes/LoginPage";
import SetupPage from "@/features/auth/routes/SetupPage";
import AuthLayout from "@/features/auth/AuthLayout";
import DashboardPage from "@/features/dashboard/routes/DashboardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import useAuthStore from "@/features/auth/useAuthStore";

const RootRedirect = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (isInitialized === false) return <Navigate to="/setup" replace />;
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const AuthRoutes = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (isInitialized === false && location.pathname !== "/setup") {
    return <Navigate to="/setup" replace />;
  }

  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <AuthLayout />
  );
};

function AppRoute() {
  const { checkSetupStatus } = useAuthStore();

  useEffect(() => {
    checkSetupStatus();
  }, [checkSetupStatus]);

  return (
    <Routes>
      {/* Routes for unauthenticated users */}
      <Route element={<AuthRoutes />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
        {/* Add other auth routes like /forgot-password here */}
      </Route>

      {/* Protected routes for authenticated users */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/client" element={<ClientPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/comptabilite" element={<ComptabilitePage />} />
        <Route path="/profile" element={<AdminProfilePage />} />
      </Route>
    </Routes>
  );
}

export default AppRoute;
