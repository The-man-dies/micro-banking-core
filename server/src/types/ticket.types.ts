export type TicketType = {
  id: number;
  description?: string;
  status: 'active' | 'closed' | 'pending';
  clientId: number;
};

export type TicketDto = Omit<TicketType, 'id'>;
