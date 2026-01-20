export type Client = {
    id: number;
    name: string;
    phone: string;
    address: string;
    accountBalance: number;
    accountStatus: 'active' | 'inactive' | 'suspended'; // Assuming these statuses
    agentId: number; // Foreign key to agent
    createdAt?: string;
    updatedAt?: string;
};
