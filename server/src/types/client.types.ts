export type ClientType = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  phone: string;
  location: string;
  agentId: number;
  accountBalance: number;
  montantEngagement: number;
  accountExpiresAt: string; // ISO 8601 format
  status: "active" | "withdraw_only" | "expired";
  createdFiscalYear: string;
};

export type ClientDto = Omit<ClientType, "id">;
