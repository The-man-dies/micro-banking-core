import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

const LoginPage = () => {
    const [username, setUsername] = useState("admin");
    const [password, setPassword] = useState("password");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await api("/admin/login", {
                method: "POST",
                body: { username, password },
            });

            if (response.data && response.data.accessToken && response.data.refreshToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                localStorage.setItem("isAuthenticated", "true"); // For compatibility with existing components
                navigate("/dashboard");
            } else {
                setError("Réponse de connexion invalide.");
            }
        } catch (err: any) {
            setError(err.message || "Échec de la connexion. Veuillez réessayer.");
            console.error("Login error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">MicroBanq</h1>
                <p className="text-gray-400">Connexion à l'administration</p>
            </div>

            <div className="bg-gray-800 rounded-xl shadow-xl p-8">
                {error && (
                    <div className="bg-red-900 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                            Nom d'utilisateur
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="admin"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Mot de passe
                            </label>
                            <a href="#" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                                Mot de passe oublié ?
                            </a>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded bg-gray-700"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                                Se souvenir de moi
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                                }`}>
                            {isLoading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Connexion en cours...
                                </>
                            ) : (
                                "Se connecter"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-400">{new Date().getFullYear()} MicroBanq. Tous droits réservés.</p>
            </div>
        </div>
    );
};

export default LoginPage;

