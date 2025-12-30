import { Filter, Plus, X, Search } from "lucide-react";
import TableauAgent from "../components/agentUI/tableauAgent";
import { useState } from "react";
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
    const [searchTerm, setSearchTerm] = useState("");

    const getNextAvailableCode = () => {
        if (agents.length === 0) return 1;
        const maxCode = Math.max(...agents.map(agent => agent.code_agents));
        for (let i = 1; i <= maxCode + 1; i++) {
            if (!agents.some(agent => agent.code_agents === i)) {
                return i;
            }
        }
        return maxCode + 1;
    };

    const openUpdatePage = () => setUpdate("add");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const code = Number(formData.get("code"));
        const name = formData.get("name")?.toString().trim();
        const tel = Number(formData.get("tel"));
        const adresse = formData.get("adresse")?.toString().trim();

        if (!code || !name || !tel || !adresse) {
            alert("Veuillez remplir tous les champs");
            return;
        }

        if (code <= 0) {
            alert("Le code agent doit être un nombre positif");
            return;
        }

        const codeExists = agents.some(agent => agent.code_agents === code);
        if (codeExists) {
            alert(`Le code agent ${code} existe déjà ! Veuillez utiliser un code unique.`);
            return;
        }

        const phoneExists = agents.some(agent => agent.telephone === tel);
        if (phoneExists) {
            alert("Ce numéro de téléphone est déjà utilisé !");
            return;
        }

        const newAgent = {
            code_agents: code,
            nom_prenom: name,
            telephone: tel,
            adresse: adresse,
        };

        setAgents(prev => {
            const updatedAgents = [...prev, newAgent];
            updatedAgents.sort((a, b) => a.code_agents - b.code_agents);
            return updatedAgents;
        });

        e.currentTarget.reset();
        setUpdate(null);
    };

    const filteredAgents = agents.filter(
        agent =>
            agent.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.telephone.toString().includes(searchTerm) ||
            agent.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.code_agents.toString().includes(searchTerm)
    );

    return (
        <div className="p-4 md:p-6 bg-gray-900 min-h-screen overflow-x-hidden">
            {update === "add" ? (
                <Addagents
                    handleSubmit={handleSubmit}
                    update={update}
                    setUpdate={setUpdate}
                    nextCode={getNextAvailableCode()}
                />
            ) : (
                <div className="space-y-4 md:space-y-6">
                    {/* En-tête */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">Gestion des agents</h1>
                            <p className="text-sm md:text-base text-gray-400">Liste de tous les agents enregistrés</p>
                        </div>
                        <button
                            onClick={openUpdatePage}
                            className="flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors w-full md:w-auto">
                            <Plus size={18} />
                            <span>Nouvel agent</span>
                        </button>
                    </div>

                    {/* Barre de recherche et filtres */}
                    <div className="bg-gray-800/50 rounded-xl p-3 md:p-4 border border-gray-700">
                        <div className="flex flex-col md:flex-row gap-3">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Rechercher un agent..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2">
                                    <Filter className="h-4 w-4 text-gray-400" />
                                    <select
                                        className="bg-transparent text-white text-sm focus:outline-none focus:ring-0 border-0 p-0"
                                        aria-label="Filtrer par statut">
                                        <option>Tous les statuts</option>
                                        <option>Actif</option>
                                        <option>Inactif</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg border border-gray-600 transition-colors flex items-center gap-2">
                                    <X size={16} />
                                    <span className="hidden sm:inline">Réinitialiser</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tableau des agents */}
                    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
                        <TableauAgent agents={filteredAgents} setAgents={setAgents} />
                    </div>
                </div>
            )}
        </div>
    );
}
