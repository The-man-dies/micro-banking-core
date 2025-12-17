import { Dock, Trash } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { data } from "react-router-dom";

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
    return (
        <div>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mx-auto ">
                <table className="table">
                    {/* head */}
                    <thead className="bg-indigo-600">
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
                                <td>
                                    {" "}
                                    <button className="btn btn-primary btn-xs ml-2">
                                        <Dock />
                                    </button>{" "}
                                    <button
                                        key={data.code_agents}
                                        className="btn btn-error btn-xs ml-2"
                                        onClick={() => handleDelete(data.code_agents)}>
                                        <Trash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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
