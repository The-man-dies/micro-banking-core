import { Routes, Route } from "react-router-dom";
import Layout from "../pages/Layout";

function AppRoute() {
    return (
        <Routes>
            <Route path="/" Component={Layout} />
        </Routes>
    )
}

export default AppRoute;