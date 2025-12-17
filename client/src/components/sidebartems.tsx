import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, ArrowRightLeft, Wallet, LogOut, ShieldCheck } from "lucide-react";

export function SidebarItem() {
    const [active, setActive] = useState<string>("");

    return (
        <div>
            {/** En tête */}

            <div
                className={`flex flex-col overflow-hidden h-screen bg-slate-900 border-r border-slate-800 w-64 p-4 z-50 transition-transform duration-300`}>
                <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                    <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <ShieldCheck className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">MicroBanq</h1>
                        <p className="text-xs text-slate-500">Admin Panel</p>
                    </div>
                </div>

                {/** En tête */}

                {/** sidebar */}
                <nav>
                    <NavLink to={"/"}>
                        <button
                            onClick={() => setActive("dashborad")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                active === "dashborad"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}>
                            <LayoutDashboard />
                            <span className="font-medium">Dashbord</span>
                        </button>
                    </NavLink>
                    <NavLink to={"/client"}>
                        <button
                            onClick={() => setActive("client")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                active === "client"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}>
                            <Users size={20} />
                            <span className="font-medium">Clients</span>
                        </button>
                    </NavLink>
                    <NavLink to={"/agent"}>
                        <button
                            onClick={() => setActive("agent")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                active === "agent"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}>
                            <Users size={20} />
                            <span className="font-medium">Agents</span>
                        </button>
                    </NavLink>
                    <NavLink to={"/transactions"}>
                        <button
                            onClick={() => setActive("transactions")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                active === "transactions"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}>
                            <ArrowRightLeft size={20} />
                            <span className="font-medium">Transactions</span>
                        </button>
                    </NavLink>
                    <NavLink to={"/comptabilité"}>
                        <button
                            onClick={() => setActive("comptabilité")}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                active === "comptabilité"
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                            }`}>
                            <Wallet size={20} />
                            <span className="font-medium">Comtabilités</span>
                        </button>
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
                        <button className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition-colors text-sm font-medium">
                            <LogOut size={16} /> Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
