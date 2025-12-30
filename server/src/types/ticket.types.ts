// server/src/types/ticket.types.ts

export type TicketType = {
  id: string;
  description?: string;
  status: 'active' | 'closed' | 'pending';
  clientId: string;
};

export type TicketDto = Omit<TicketType, 'id'>;
