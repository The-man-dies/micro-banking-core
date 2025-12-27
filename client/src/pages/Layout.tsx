import { Outlet } from "react-router-dom";
import { SidebarItem } from "../components/sidebartems";

export default function Layout() {
    return (
        <div className="w-full">
            <div className="flex flex-row">
                <SidebarItem />
                <div className="overflow-y-hidden w-screen h-screen bg-slate-900 ">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}