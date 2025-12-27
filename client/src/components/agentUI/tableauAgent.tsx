import { Edit, LocationEdit, Phone, Trash2Icon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import UpdateAgents from "./updateAgent";

type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};

type Props = {
    agents: agentType[];
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>;
};

export default function TableauAgent({ agents, setAgents }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<number | null>(null);
    const [modify, setModify] = useState<string | null>(null);
    const [agentToModify, setAgentToModify] = useState<agentType | null>(null);

    const handleDelete = (code: number) => {
        setAgentToDelete(code);
        setShowDeleteModal(true);
    };

    const handleModify = (code: number) => {
        const agent = agents.find(a => a.code_agents === code);
        if (agent) {
            setAgentToModify(agent);
            setModify("modify");
        }
    };

    const confirmDelete = () => {
        if (agentToDelete && setAgents) {
            const filteredAgents = agents.filter(agent => agent.code_agents !== agentToDelete);
            setAgents(filteredAgents);
        }
        setShowDeleteModal(false);
        setAgentToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAgentToDelete(null);
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
            {modify === "modify" && agentToModify ? (
                <UpdateAgents setModify={setModify} agent={agentToModify} agents={agents} setAgents={setAgents} />
            ) : (
                <div className="rounded-box border border-base-content/5 bg-base-200 mx-auto h-[calc(100vh-180px)]">
                    <table className="table table-zebra">
                        <thead className="bg-slate-900 text-slate-100">
                            <tr>
                                <th className="text-center">Code agent</th>
                                <th>Nom Prénom</th>
                                <th>Téléphone</th>
                                <th>Adresse</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(agent => (
                                <tr key={agent.code_agents} className="hover:bg-slate-700/10">
                                    <th className="text-center">{agent.code_agents}</th>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold">
                                                        {nameProfile(agent.nom_prenom)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="font-medium">{agent.nom_prenom}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Phone size={18} className="text-slate-500" />
                                            <span>{agent.telephone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <LocationEdit size={18} className="text-slate-500" />
                                            <span>{agent.adresse}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                className="btn btn-ghost btn-sm text-info hover:text-info/80"
                                                onClick={() => handleModify(agent.code_agents)}
                                                title="Modifier">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm text-error hover:text-error/80"
                                                onClick={() => handleDelete(agent.code_agents)}
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
            )}

            {showDeleteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmer la suppression</h3>
                        <p className="py-4">
                            Êtes-vous sûr de vouloir supprimer l'agent avec le code {agentToDelete} ? Cette action est
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
