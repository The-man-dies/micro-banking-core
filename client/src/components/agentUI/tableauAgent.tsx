import { DockIcon, Trash2Icon } from "lucide-react";
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
    const [code, setCode] = useState<number | undefined>(undefined);
    const [modify, setModify] = useState<string | null>(null);
    const [agentToModify, setAgentToModify] = useState<agentType | undefined>(undefined); // Nouvel état

    const handleDelete = (code: number) => {
        setAgentToDelete(code);
        setShowDeleteModal(true);
    };

    const handleModify = (code: number) => {
        setCode(code);
        // Trouver l'agent et le stocker dans l'état
        const agent = agents.find(a => a.code_agents === code);
        setAgentToModify(agent);
        setModify("modify");
    };

    const confirmDelete = () => {
        if (agentToDelete && setAgents) {
            const filter = agents.filter(flt => flt.code_agents !== agentToDelete);
            setAgents(filter);
        }
        setShowDeleteModal(false);
        setAgentToDelete(null);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setAgentToDelete(null);
    };

    return (
        <div>
            {modify === "modify" && agentToModify ? (
                <UpdateAgents
                    setModify={setModify}
                    agent={agentToModify} // Passer l'agent directement
                    agents={agents}
                    setAgents={setAgents}
                />
            ) : (
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200 mx-auto h-168">
                    <table className="table">
                        <thead className="bg-indigo-600/40">
                            <tr>
                                <th>Code agents</th>
                                <th>Nom Prénom</th>
                                <th>Télephone</th>
                                <th>Adresse</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(data => (
                                <tr key={data.code_agents}>
                                    <th>{data.code_agents}</th>
                                    <td>{data.nom_prenom}</td>
                                    <td>{data.telephone}</td>
                                    <td>{data.adresse} </td>
                                    <td className="flex flex-row gap-5">
                                        <button className="text-primary" onClick={() => handleModify(data.code_agents)}>
                                            <DockIcon />
                                        </button>
                                        <button className="text-error" onClick={() => handleDelete(data.code_agents)}>
                                            <Trash2Icon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {showDeleteModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Confirmer la suppression</h3>
                        <p className="py-4">Êtes-vous sûr de vouloir supprimer cet agent ?</p>
                        <div className="modal-action">
                            <button className="btn" onClick={cancelDelete}>
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
