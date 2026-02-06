import { z } from 'zod';

const params = {
  params: z.object({
    id: z.string().refine((val) => !isNaN(parseInt(val, 10)), { message: 'ID must be a number' }),
  }),
};

export const createClientSchema = z.object({
  body: z.object({
    firstname: z.string().min(1, { message: 'First name is required' }),
    lastname: z.string().min(1, { message: 'Last name is required' }),
    email: z.string().email('Not a valid email').optional(),
    phone: z.string().min(1, { message: 'Phone is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    agentId: z.number(),
    montantEngagement: z.number().positive('Engagement amount must be positive'),
  }),
});

export const depositSchema = z.object({
  ...params,
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
  }),
});

export const renewSchema = z.object({
  ...params,
  body: z.object({
    fraisReactivation: z.number().positive('Reactivation fee must be positive'),
  }),
});

export const payoutSchema = z.object({
  ...params,
});

export const updateClientSchema = z.object({
  ...params,
  body: z.object({
    firstname: z.string().min(2).optional(),
    lastname: z.string().min(2).optional(),
    email: z.string().email('Not a valid email').optional(),
    phone: z.string().min(1).optional(),
    location: z.string().min(1).optional(),
    agentId: z.number().optional(),
  }).partial(),
});

export const clientIdSchema = z.object({
  ...params,
});
