import { Navigate } from "react-router-dom";
import useAuthStore from "../features/auth/useAuthStore"; // Import useAuthStore

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated } = useAuthStore(); // Get isAuthenticated from the store

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
