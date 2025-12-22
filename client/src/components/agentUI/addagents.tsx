import { X } from "lucide-react";
import type React from "react";
import { useState } from "react";

type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};

type Props = {
    agent: agentType;
    setModify: React.Dispatch<React.SetStateAction<string | null>>;
    agents: agentType[];
    setAgents?: React.Dispatch<React.SetStateAction<agentType[]>>;
};

export default function UpdateAgents({ agent, setModify, setAgents }: Props) {
    const [codeAgent, setCodeAgent] = useState<number>(agent.code_agents);
    const [name, setName] = useState<string>(agent.nom_prenom);
    const [tel, setTel] = useState<number>(agent.telephone);
    const [adress, setAdress] = useState<string>(agent.adresse);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!setAgents) return;

        setAgents(prev =>
            prev.map(a =>
                a.code_agents === agent.code_agents
                    ? {
                          code_agents: codeAgent,
                          nom_prenom: name,
                          telephone: tel,
                          adresse: adress,
                      }
                    : a
            )
        );

        setModify(null);
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-base-100 w-full max-w-md p-6 rounded-2xl shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Modifier un Agent</h2>
                    <button className="btn btn-circle btn-ghost btn-sm" onClick={() => setModify(null)}>
                        <X size={20} />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <input
                        type="number"
                        value={codeAgent}
                        onChange={e => setCodeAgent(Number(e.target.value))}
                        className="input input-bordered input-primary w-full"
                        required
                    />

                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="input input-bordered input-primary w-full"
                        required
                    />

                    <input
                        type="number"
                        value={tel}
                        onChange={e => setTel(Number(e.target.value))}
                        className="input input-bordered input-primary w-full"
                        required
                    />

                    <input
                        type="text"
                        value={adress}
                        onChange={e => setAdress(e.target.value)}
                        className="input input-bordered input-primary w-full"
                        required
                    />

                    <button type="submit" className="btn btn-primary w-full">
                        Enregistrer les modifications
                    </button>
                </form>
            </div>
        </div>
    );
}
