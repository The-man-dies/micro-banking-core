import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function MainLayout() {
    return (
        <div className="flex h-screen w-full bg-gray-900 text-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Main content area */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}