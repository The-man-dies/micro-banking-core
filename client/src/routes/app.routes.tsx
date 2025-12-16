import { Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";
import AgentPage from "../pages/agentPage";
import Clients from "../pages/clients";
import Transcations from "../pages/transcations";
import Comptabilite from "../pages/comptabilite";

function AppRoute() {
    return (
        <Routes>
            <Route path="/" Component={Layout}>
                <Route path="/client" Component={Clients} />
                <Route path="/agent" Component={AgentPage} />
                <Route path="/transactions" Component={Transcations} />
                <Route path="/comptabilité" Component={Comptabilite} />
            </Route>
        </Routes>
    );
}

export default AppRoute;
