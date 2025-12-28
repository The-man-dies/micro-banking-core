import { Outlet } from "react-router-dom";
import { SidebarItem } from "../components/sidebartems";

export default function Layout() {
    return (
        <div className="flex h-screen w-full bg-gray-900 text-gray-100">
            {/* Sidebar */}
            <SidebarItem />

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
