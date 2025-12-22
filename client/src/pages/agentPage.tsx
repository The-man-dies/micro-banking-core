import { Filter, Plus, X } from "lucide-react";
import TableauAgent from "../components/agentUI/tableauAgent";
import React, { useState } from "react";
import Addagents from "../components/agentUI/addagents";
type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};

export default function AgentPage() {
    const [agents, setAgents] = useState<agentType[]>([
        { code_agents: 1, nom_prenom: "Ibrahima Sidibé", telephone: 91680878, adresse: "Sébéni Koro" },
        { code_agents: 2, nom_prenom: "Aminata Traoré", telephone: 70234567, adresse: "Hamdallaye ACI" },
        { code_agents: 3, nom_prenom: "Moussa Diallo", telephone: 65432198, adresse: "Badalabougou" },
        { code_agents: 4, nom_prenom: "Fatoumata Coulibaly", telephone: 78901234, adresse: "Magnambougou" },
        { code_agents: 5, nom_prenom: "Oumar Konaté", telephone: 61234567, adresse: "Sotuba" },
        { code_agents: 6, nom_prenom: "Mariame Sangaré", telephone: 73456789, adresse: "Kalaban Coura" },
        { code_agents: 7, nom_prenom: "Boubacar Keïta", telephone: 69874512, adresse: "Faladié" },
        { code_agents: 8, nom_prenom: "Aïssata Touré", telephone: 74561238, adresse: "Djélibougou" },
        { code_agents: 9, nom_prenom: "Issa Camara", telephone: 77654321, adresse: "Niamakoro" },
        { code_agents: 10, nom_prenom: "Salimata Dembélé", telephone: 70123456, adresse: "Baco Djicoroni" },
        { code_agents: 11, nom_prenom: "Abdoulaye Coulibaly", telephone: 66543210, adresse: "Sabalibougou" },
        { code_agents: 12, nom_prenom: "Kadidia Diarra", telephone: 78890123, adresse: "Lafiabougou" },
        { code_agents: 13, nom_prenom: "Mamadou Sanogo", telephone: 61239874, adresse: "Sirakoro Méguétana" },
        { code_agents: 14, nom_prenom: "Nafissatou Koné", telephone: 73451289, adresse: "Daoudabougou" },
        { code_agents: 15, nom_prenom: "Youssouf Maïga", telephone: 69871234, adresse: "Banankabougou" },
        { code_agents: 16, nom_prenom: "Rokia Touré", telephone: 74569812, adresse: "Missabougou" },
        { code_agents: 17, nom_prenom: "Seydou Traoré", telephone: 77659841, adresse: "Hippodrome" },
        { code_agents: 18, nom_prenom: "Adama Doumbia", telephone: 70129876, adresse: "Djelibougou Doumanzana" },
        { code_agents: 19, nom_prenom: "Awa Cissé", telephone: 66548912, adresse: "Yirimadio" },
        { code_agents: 20, nom_prenom: "Cheick Oumar Diakité", telephone: 73459876, adresse: "Korofina Nord" },
    ]);
    const [update, setUpdate] = useState<string | null>(null);

    const openUpdatePage = () => {
        setUpdate("add");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        if (
            formData.get("name") === "" ||
            formData.get("code") === "" ||
            formData.get("tel") === "" ||
            formData.get("adresse") === ""
        ) {
            alert("remplie les champs");
            return;
        }
        const code = Number(formData.get("code"));
        const name = formData.get("name")?.toString();
        const tel = Number(formData.get("tel"));
        const adresse = formData.get("adresse")?.toString();
        console.log({ code, name, tel, adresse });
        const newAgents = {
            code_agents: code,
            nom_prenom: `${name}`,
            telephone: tel,
            adresse: `${adresse}`,
        };
        setAgents(prev => [...prev, newAgents]);
        console.log(agents);
        e.currentTarget.reset();
        setUpdate(null);
    };

    return (
        <div>
            {update === "add" ? (
                <Addagents handleSubmit={handleSubmit} update={update} setUpdate={setUpdate} />
            ) : (
                <div>
                    <div className="p-5 flex flex-col gap-3 ">
                        <button
                            className="btn bg-indigo-600 rounded-lg w-40 text-sm h-9 ml-auto"
                            onClick={openUpdatePage}>
                            <Plus size={15} /> nouveaux agent
                        </button>
                        <div className="flex items-center gap-2  bg-slate-800   backdrop:blur-xl p-2 rounded-lg py-4">
                            <input
                                type="text"
                                placeholder="Rechercher par nom, code, téléphone..."
                                className="p-3 bg-slate-900 rounded-2xl focus:outline-none flex-1"
                            />

                            <button className="flex flex-row">
                                <div className="text-zinc-100/50">
                                    <Filter size={20} />
                                </div>
                                filtrer
                            </button>

                            <button className="flex flex-row">
                                <div className="text-zinc-100/50">
                                    <X size={20} />
                                </div>
                                renitialiser
                            </button>
                        </div>
                    </div>
                    <div className="h-screen overflow-y-hidden p-5 -mt-6">
                        <TableauAgent agents={agents} setAgents={setAgents} />
                    </div>
                </div>
            )}
        </div>
    );
}
