import { X } from "lucide-react";
import type React from "react";
import { useState, useEffect } from "react";

type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};

type Props = {
    setModify: React.Dispatch<React.SetStateAction<string | null>>;
    agent: agentType; // Recevoir l'agent directement
    agents: agentType[];
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>;
};

export default function UpdateAgents({ setModify, agent, agents, setAgents }: Props) {
    // Initialiser les états avec les valeurs de l'agent
    const [name, setName] = useState<string>("");
    const [adress, setAdress] = useState<string>("");
    const [tel, setTel] = useState<number>(0);
    const [codeAgent, setCodeAgent] = useState<number>(0);

    // Mettre à jour les états quand l'agent change
    useEffect(() => {
        if (agent) {
            setName(agent.nom_prenom.trim()); // Supprimer les espaces
            setAdress(agent.adresse.trim());
            setTel(agent.telephone);
            setCodeAgent(agent.code_agents);
        }
    }, [agent]);

    const ModifyAgents = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const updatedAgent = {
            code_agents: codeAgent,
            nom_prenom: name,
            telephone: tel,
            adresse: adress,
        };

        if (setAgents) {
            const updatedAgents = agents.map(a => (a.code_agents === agent.code_agents ? updatedAgent : a));
            setAgents(updatedAgents);
        }

        setModify(null);
    };

    return (
        <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-base-100 w-full max-w-md mx-4 p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Modifier un Agent</h2>
                    <button className="btn btn-circle btn-ghost btn-sm" onClick={() => setModify(null)}>
                        <X size={20} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={ModifyAgents}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Code Agent</span>
                        </label>
                        <input
                            type="number"
                            value={codeAgent}
                            placeholder="Entrez le code"
                            className="input input-bordered input-primary w-full"
                            required
                            onChange={e => {
                                setCodeAgent(Number(e.target.value));
                            }}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Nom et Prénom</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            placeholder="Entrez le nom et prénom"
                            className="input input-bordered input-primary w-full"
                            required
                            onChange={e => {
                                setName(e.target.value);
                            }}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Numéro de Téléphone</span>
                        </label>
                        <input
                            type="number"
                            value={tel}
                            placeholder="Entrez le numéro"
                            className="input input-bordered input-primary w-full"
                            required
                            onChange={e => {
                                setTel(Number(e.target.value));
                            }}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Adresse</span>
                        </label>
                        <input
                            type="text"
                            value={adress}
                            placeholder="Entrez l'adresse"
                            className="input input-bordered input-primary w-full"
                            required
                            onChange={e => {
                                setAdress(e.target.value);
                            }}
                        />
                    </div>

                    <div className="form-control mt-6">
                        <button type="submit" className="btn btn-primary w-full">
                            Modifier l'Agent
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
