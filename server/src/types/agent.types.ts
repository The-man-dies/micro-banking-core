// server/src/types/agent.types.ts

export type AgentType = {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  location?: string;
};

export type AgentDto = Omit<AgentType, 'id'>;
