// stores/agentStore.ts
import { create } from "zustand";
import type { AgentType } from "../types/agentsType";

type AgentStoreType = {
  agents: AgentType[];
  addAgent: (agent: AgentType) => void;
  deleteAgent: (code: number) => void;
  updateAgent: (agent: AgentType) => void;
};

export const useAgentsStore = create<AgentStoreType>((set) => ({
  agents: [
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
  ],

  addAgent: (agent) =>
    set((state) => ({
      agents: [...state.agents, agent],
    })),

  deleteAgent: (code) =>
    set((state) => ({
      agents: state.agents.filter((a) => a.code_agents !== code),
    })),

  updateAgent: (updatedAgent) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.code_agents === updatedAgent.code_agents ? updatedAgent : a
      ),
    })),
}));