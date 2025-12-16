import { createContext } from "react";
type agentType = {
    code_agents: number;
    nom_prenom: string;
    telephone: number;
    adresse: string;
};
type AgentsContextType = {
    agents: agentType[];
    setAgents: React.Dispatch<React.SetStateAction<agentType[]>>;
};

export const AgentsContext = createContext<AgentsContextType | null>(null);
