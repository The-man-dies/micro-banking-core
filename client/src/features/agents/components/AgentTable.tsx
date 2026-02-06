import { Edit, Mail, Trash2Icon, User, MapPin, Eye, X, ShieldCheck, AlertCircle } from "lucide-react";
import type { Agent } from "../types";
import { useState } from "react";

type Props = {
    agents: Agent[];
    onEdit: (agent: Agent) => void;
    onDelete: (id: number) => void;
};

export default function AgentTable({ agents, onEdit, onDelete }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDeleteId, setAgentToDeleteId] = useState<number | null>(null);
    const [viewingAgent, setViewingAgent] = useState<Agent | null>(null);

    const handleDeleteClick = (id: number) => {
        setAgentToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (agentToDeleteId !== null) {
            await onDelete(agentToDeleteId);
        }
        setShowDeleteModal(false);
        setAgentToDeleteId(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAgentToDeleteId(null);
    };

    if (!agents || agents.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-xl border-2 border-dashed border-base-300">
                <div className="bg-base-200 p-4 rounded-full mb-4">
                    <User size={40} className="text-base-content/50" />
                </div>
                <p className="text-base-content/70 font-medium">Aucun agent dans la base de données.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto bg-base-100 rounded-xl shadow-sm border border-base-300">
                <table className="table table-zebra w-full">
                    <thead>
                        <tr className="bg-base-200/50 text-base-content/70">
                            <th>Agent</th>
                            <th>Contact</th>
                            <th>Localisation</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map((agent) => (
                            <tr key={agent.id} className="hover">
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar placeholder">
                                            <div className="bg-neutral text-neutral-content rounded-xl w-10 flex items-center justify-center">
                                                <span className="text-xs font-bold">
                                                    {(agent.firstname.trim()[0] || "").toUpperCase()}
                                                    {(agent.lastname.trim()[0] || "").toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="font-bold">{agent.firstname} {agent.lastname}</div>
                                            <div className="text-xs text-base-content/50 opacity-50">ID: #{agent.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex flex-col gap-1">
                                        {agent.email ? (
                                            <div className="flex items-center gap-1 text-sm opacity-80">
                                                <Mail size={12} /> {agent.email}
                                            </div>
                                        ) : <span className="text-xs opacity-50">No email</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-1 text-sm opacity-80">
                                        <MapPin size={14} />
                                        {agent.location || "N/A"}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => setViewingAgent(agent)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Détails"
                                        >
                                            <Eye size={16} className="text-base-content/70" />
                                        </button>
                                        <button
                                            onClick={() => onEdit(agent)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Modifier"
                                        >
                                            <Edit size={16} className="text-info" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(agent.id)}
                                            className="btn btn-ghost btn-xs btn-square tooltip"
                                            data-tip="Supprimer"
                                        >
                                            <Trash2Icon size={16} className="text-error" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* VIEW AGENT MODAL */}
            {viewingAgent && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setViewingAgent(null)}>
                    <div
                        className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-6 border-b border-base-300">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ShieldCheck className="text-primary" />
                                Profil Agent
                            </h2>
                            <button
                                className="btn btn-circle btn-ghost btn-sm hover:bg-base-200"
                                onClick={() => setViewingAgent(null)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="avatar placeholder">
                                    <div className="bg-neutral text-neutral-content rounded-2xl w-20 flex items-center justify-center">
                                        <span className="text-2xl font-bold">
                                            {(viewingAgent.firstname.trim()[0] || "").toUpperCase()}
                                            {(viewingAgent.lastname.trim()[0] || "").toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold">{viewingAgent.firstname} {viewingAgent.lastname}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="badge badge-neutral badge-sm">Agent</span>
                                        <span className="text-sm text-base-content/60">ID #{viewingAgent.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 bg-base-200/30 p-4 rounded-xl border border-base-200">
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-base-content/70" />
                                    <div>
                                        <div className="text-xs font-bold uppercase opacity-50">Email</div>
                                        <div className="font-medium">{viewingAgent.email || "Non renseigné"}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-base-content/70" />
                                    <div>
                                        <div className="text-xs font-bold uppercase opacity-50">Localisation</div>
                                        <div className="font-medium">{viewingAgent.location || "Non renseigné"}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-base-300 bg-base-200/30 rounded-b-2xl flex gap-3">
                            <button
                                onClick={() => { onEdit(viewingAgent); setViewingAgent(null); }}
                                className="btn btn-outline btn-sm flex-1"
                            >
                                <Edit size={16} /> Modifier
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={cancelDelete}>
                    <div className="bg-base-100 w-full max-w-sm rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Confirmer la suppression</h3>
                            <p className="text-base-content/60 text-sm">
                                Êtes-vous sûr de vouloir supprimer cet agent ? Cette action est irréversible.
                            </p>
                        </div>
                        <div className="p-6 border-t border-base-300 flex gap-3 bg-base-200/30 rounded-b-2xl">
                            <button className="btn btn-ghost flex-1" onClick={cancelDelete}>Annuler</button>
                            <button className="btn btn-error flex-1" onClick={confirmDelete}>Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
