import React, { useState } from "react";
import { Edit, LocationEdit, Phone, Trash2Icon } from "lucide-react";
import { Agent } from "../types"; // Import the Agent type

type Props = {
    agents: Agent[];
    onEdit: (agent: Agent) => void;
    onDelete: (id: number) => void;
};

export default function AgentTable({ agents, onEdit, onDelete }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDeleteId, setAgentToDeleteId] = useState<number | null>(null);

    const handleDeleteClick = (id: number) => {
        setAgentToDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (agentToDeleteId) {
            await onDelete(agentToDeleteId);
        }
        setShowDeleteModal(false);
        setAgentToDeleteId(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAgentToDeleteId(null);
    };

    const nameProfile = (name: string) => {
        const nameParts = name.trim().split(" ");
        if (nameParts.length === 0) return "??";

        const firstInitial = nameParts[0][0]?.toUpperCase() || "";
        const secondInitial = nameParts[1]?.[0]?.toUpperCase() || "";

        return firstInitial + secondInitial;
    };

    return (
        <div>
            <div className="rounded-box border border-base-content/5 bg-base-200 mx-auto ">
                <table className="table table-zebra">
                    <thead className="bg-slate-900 text-slate-100">
                        <tr>
                            <th className="text-center">ID</th>
                            <th>Nom Prénom</th>
                            <th>Téléphone</th>
                            <th>Adresse</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {agents.map(agent => (
                            <tr key={agent.id} className="hover:bg-slate-700/10">
                                <th className="text-center">{agent.id}</th>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-bold">
                                                    {nameProfile(agent.name)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="font-medium">{agent.name}</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <Phone size={18} className="text-slate-500" />
                                        <span>{agent.phone}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2">
                                        <LocationEdit size={18} className="text-slate-500" />
                                        <span>{agent.address}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            className="btn btn-ghost btn-sm text-info hover:text-info/80"
                                            onClick={() => onEdit(agent)}
                                            title="Modifier">
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm text-error hover:text-error/80"
                                            onClick={() => handleDeleteClick(agent.id)}
                                            title="Supprimer">
                                            <Trash2Icon size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {agents.length === 0 && <div className="text-center py-10 text-slate-500">Aucun agent trouvé</div>}
            </div>

            {showDeleteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmer la suppression</h3>
                        <p className="py-4">
                            Êtes-vous sûr de vouloir supprimer l'agent avec l'ID {agentToDeleteId} ? Cette action est
                            irréversible.
                        </p>
                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={cancelDelete}>
                                Annuler
                            </button>
                            <button className="btn btn-error" onClick={confirmDelete}>
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
