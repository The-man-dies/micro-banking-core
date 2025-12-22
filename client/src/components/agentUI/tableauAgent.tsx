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
    const [code, setCode] = useState<number | undefined>(undefined);
    const [modify, setModify] = useState<string | null>(null);
    const [agentToModify, setAgentToModify] = useState<agentType | undefined>(undefined); // Nouvel état

    const handleDelete = (code: number) => {
        setAgentToDelete(code);
        setShowDeleteModal(true);
    };

    const handleModify = (code: number) => {
        setCode(code);

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

    const namePorfile = (name: string) => {
        const newName = name.trim().split(" ");
        console.log(newName);
        const firstPart = newName[0][0];
        const secondPart = newName[1] ? newName[1][0] : null;
        return firstPart + secondPart;
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
                        <thead className="bg-slate-950/20 backdrop:blur-xl">
                            <tr>
                                <th>Code agents</th>
                                <th>Nom Prénom</th>
                                <th>Télephone</th>
                                <th>Adresse</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agents.map(data => (
                                <tr key={data.code_agents}>
                                    <th>{data.code_agents}</th>
                                    <td className="flex flex-row gap-5">
                                        <div className="avatar avatar-placeholder">
                                            <div className="bg-indigo-600/15 text-neutral-content w-8 rounded-full">
                                                <span className="text-xs font-bold">
                                                    {" "}
                                                    {namePorfile(data.nom_prenom)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-1">{data.nom_prenom}</div>
                                    </td>
                                    <td>
                                        {" "}
                                        <div className="flex flex-row gap-2">
                                            <div className="text-zinc-100/50">
                                                <Phone size={20} />
                                            </div>{" "}
                                            {data.telephone}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-row gap-2">
                                            <div className="text-zinc-100/50">
                                                <LocationEdit size={20} />
                                            </div>
                                            {data.adresse}{" "}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-row gap-5 ">
                                            <button
                                                className="text-zinc-100/50"
                                                onClick={() => {
                                                    handleModify(data.code_agents);
                                                }}>
                                                {" "}
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                className="text-error"
                                                onClick={() => {
                                                    handleDelete(data.code_agents);
                                                }}>
                                                {" "}
                                                <Trash2Icon size={20} />
                                            </button>
                                        </div>
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
