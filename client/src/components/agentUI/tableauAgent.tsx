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
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>; // optionnel si tu veux modifier
};

export default function TableauAgent({ agents, setAgents }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [agentToDelete, setAgentToDelete] = useState<number | null>(null);
    const [modify, setModify] = useState<string | null>(null);

    const handleDelete = (code: number) => {
        setAgentToDelete(code);
        setShowDeleteModal(true);
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
    const getAgant = (data: number) => {
        setModify("modify");
        const modifyAgent = agents.filter(flt => flt.code_agents === data);
        return modifyAgent;
    };

    return (
        <div>
            {modify === "modify" ? (
                <UpdateAgents setModify={setModify} getAgant={getAgant} />
            ) : (
                <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-200 mx-auto h-168">
                    <table className="table">
                        {/* head */}
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
                            {/* row 1 */}
                            {agents.map(data => (
                                <tr key={data.code_agents}>
                                    <th>{data.code_agents}</th>
                                    <td>{data.nom_prenom}</td>
                                    <td>{data.telephone}</td>
                                    <td>{data.adresse} </td>
                                    <td className="flex flex-row gap-5">
                                        {" "}
                                        <button className="text-primary" onClick={() => getAgant(data.code_agents)}>
                                            <DockIcon />
                                        </button>{" "}
                                        <button
                                            key={data.code_agents}
                                            className="text-error"
                                            onClick={() => handleDelete(data.code_agents)}>
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
