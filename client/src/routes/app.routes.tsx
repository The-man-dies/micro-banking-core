import { Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";
import AgentPage from "../pages/agentPage";
import Clients from "../pages/clients";
import Transcations from "../pages/transcations";
import Comptabilite from "../pages/comptabilite";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";

function AppRoute() {
    return (
        <Routes>
            <Route path="/" Component={Layout}>
                <Route path="/dashboard" Component={DashboardPage} />
                <Route path="/client" Component={Clients} />
                <Route path="/agent" Component={AgentPage} />
                <Route path="/transactions" Component={Transcations} />
                <Route path="/comptabilité" Component={Comptabilite} />
                <Route path="/login" Component={LoginPage} />
            </Route>
        </Routes>
    );
}

export default AppRoute;
