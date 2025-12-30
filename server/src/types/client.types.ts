// server/src/types/client.types.ts

export type ClientType = {
  id: string;
  firstname: string;
  lastname: string;
  email?: string;
  agentId: string;
  accountBalance: number;
  accountExpiresAt: string; // ISO 8601 format
  initialDeposit: number;
  status: 'active' | 'expired';
};

export type ClientDto = Omit<ClientType, 'id' | 'accountExpiresAt' | 'accountBalance' | 'status'>;
