import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/features/layout/main/MainLayout";
import AgentPage from "@/features/agents/routes/AgentPage";
import ClientPage from "@/features/clients/routes/ClientPage";
import AdminProfilePage from "@/features/admin/routes/AdminProfilePage";
import TransactionsPage from "@/features/transactions/routes/TransactionsPage";
import ComptabilitePage from "@/features/comptabilite/routes/ComptabilitePage";
import LoginPage from "@/features/auth/routes/LoginPage";
import AuthLayout from "@/features/auth/AuthLayout";
import DashboardPage from "@/features/dashboard/routes/DashboardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const RootRedirect = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const AuthRoutes = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthLayout />;
};

function AppRoute() {
    return (
        <Routes>
            {/* Routes for unauthenticated users */}
            <Route element={<AuthRoutes />}>
                <Route path="/login" element={<LoginPage />} />
                {/* Add other auth routes like /forgot-password here */}
            </Route>

            {/* Protected routes for authenticated users */}
            <Route
                element={
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                }>
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
