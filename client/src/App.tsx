import { BrowserRouter } from "react-router-dom";
import AppRoute from "@/routes/AppRoute";
import "./styles/index.css";
import AuthManager from "./features/auth/AuthManager"; // Import AuthManager
import BootstrapGate from "./components/BootstrapGate";

function App() {
  return (
    <>
      <BrowserRouter>
        <BootstrapGate>
          <AuthManager>
            {" "}
            {/* Wrap AppRoute with AuthManager */}
            <AppRoute />
          </AuthManager>
        </BootstrapGate>
      </BrowserRouter>
    </>
  );
}

export default App;
