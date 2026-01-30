import { useState } from "react";
import { Plus, X, Search } from "lucide-react"; // Removed unused 'Filter'
import AgentTable from "../components/AgentTable";
import AgentForm from "../components/AgentForm";
import { useAgents } from "../hooks/useAgents";
import type { Agent } from "../types";

export default function AgentPage() {
    const { agents, isLoading, error, createAgent, deleteAgent, updateAgent } = useAgents();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const handleEdit = (agent: Agent) => {
        setEditingAgent(agent);
        setIsFormOpen(true);
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingAgent(null);
    };

    // Wrapper function to satisfy TypeScript and handle form submission
    const handleSubmit = async (agentData: any, id?: number) => {
        if (id) {
            // It's an update
            await updateAgent(id, agentData);
        } else {
            // It's a creation
            await createAgent(agentData);
        }
    };

    const filteredAgents = agents.filter(agent => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;

        const haystack = [
            agent.firstname,
            agent.lastname,
            agent.email ?? "",
            agent.location ?? "",
            agent.id.toString(),
        ]
            .join(" ")
            .toLowerCase();

        return haystack.includes(term);
    });

    const mainContent = (
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Gestion des agents</h1>
                    <p className="text-sm md:text-base text-gray-400">Liste de tous les agents enregistrés</p>
                </div>
                <button
                    onClick={() => { setEditingAgent(null); setIsFormOpen(true); }}
                    className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
                    <Plus size={18} />
                    <span>Nouvel agent</span>
                </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Total Agents</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{agents.length}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Villes couvertes</p>
                    <p className="mt-1 text-2xl font-semibold text-white">
                        {new Set(agents.map(a => a.location).filter(Boolean)).size}
                    </p>
                </div>
                {/* Placeholders to match 4-column layout if needed, or just 2 */}
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 opacity-50">
                    <p className="text-xs text-gray-400">Actifs (Simulé)</p>
                    <p className="mt-1 text-2xl font-semibold text-white">{agents.length}</p>
                </div>
                <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-4 opacity-50">
                    <p className="text-xs text-gray-400">Performance</p>
                    <p className="mt-1 text-2xl font-semibold text-white">-</p>
                </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un agent..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSearchTerm("")}
                            className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg border border-gray-600 transition-colors flex items-center gap-2">
                            <X size={16} />
                            <span className="hidden sm:inline">Réinitialiser</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Agent Table */}
            <AgentTable agents={filteredAgents} onEdit={handleEdit} onDelete={deleteAgent} />
        </div>
    );

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen">
            {isLoading && <p className="text-white text-center py-10">Chargement des agents...</p>}
            {error && <p className="text-red-500 text-center py-10">Erreur: {error}</p>}

            {!isLoading && !error && mainContent}

            {isFormOpen && (
                <AgentForm
                    onClose={handleCloseForm}
                    onSubmit={handleSubmit}
                    initialData={editingAgent}
                />
            )}
        </div>
    );
}
