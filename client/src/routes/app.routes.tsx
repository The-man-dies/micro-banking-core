import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../pages/Layout";
import AgentPage from "../pages/agentPage";
import Clients from "../pages/clients";
import Transcations from "../pages/transcations";
import Comptabilite from "../pages/comptabilite";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import { ProtectedRoute } from "../components/ProtectedRoute";

const RootRedirect = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};

const LoginRoute = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }
    return <LoginPage />;
};

function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<LoginRoute />} />

            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/client" element={<Clients />} />
                <Route path="/agent" element={<AgentPage />} />
                <Route path="/transactions" element={<Transcations />} />
                <Route path="/comptabilité" element={<Comptabilite />} />
            </Route>
        </Routes>
    );
}

export default AppRoute;
