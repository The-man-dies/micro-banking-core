import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ArrowRightLeft, Wallet, LogOut, ShieldCheck, User } from "lucide-react";
import api from "../../../../services/api-client";

export default function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
            try {
                await api("/admin/logout", {
                    method: "POST",
                    data: { token: refreshToken },
                });
            } catch (error) {
                console.error("Error during server-side logout:", error);
                // Continue with client-side logout even if server-side fails
            }
        }

        // Clear all session-related data
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login");
    };

    return (
        <div>
            <div
                className={`flex flex-col overflow-hidden h-screen bg-slate-900 border-r border-slate-800 w-64 p-4 z-50 transition-transform duration-300`}>
                <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                    <div className="w-10 h-10 bg-linear-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">MicroBanq</h1>
                        <p className="text-xs text-slate-500">Admin Panel</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-3">
                    <NavLink
                        to={"/dashboard"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <LayoutDashboard />
                        <span className="font-medium">Dashbord</span>
                    </NavLink>
                    <NavLink
                        to={"/client"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <Users size={20} />
                        <span className="font-medium">Clients</span>
                    </NavLink>
                    <NavLink
                        to={"/agent"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <Users size={20} />
                        <span className="font-medium">Agents</span>
                    </NavLink>
                    <NavLink
                        to={"/transactions"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <ArrowRightLeft size={20} />
                        <span className="font-medium">Transactions</span>
                    </NavLink>
                    <NavLink
                        to={"/comptabilite"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <Wallet size={20} />
                        <span className="font-medium">Comtabilités</span>
                    </NavLink>
                    <NavLink
                        to={"/profile"}
                        className={({ isActive }) =>
                            `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`
                        }>
                        <User size={20} />
                        <span className="font-medium">Profil</span>
                    </NavLink>
                </nav>
                {/** sidebar */}
                <div className=" mt-auto ">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                                A
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">Admin</p>
                                <p className="text-xs text-slate-400">Superviseur</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors text-sm font-medium">
                            <LogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
