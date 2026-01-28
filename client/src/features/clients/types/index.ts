export type Client = {
  id: number;
  firstname: string;
  lastname: string;
  email?: string;
  phone: string;
  location: string;
  agentId: number;
  montantEngagement: number;
  accountBalance: number;
  accountExpiresAt: string; // ISO 8601 format
  status: 'active' | 'expired';
};
