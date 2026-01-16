import { Router } from 'express';
import { createClient, getClientById, getAllClients, updateClient, deleteClient, renewAccount, depositToAccount, payoutClientAccount } from '../controllers/client.controller';
import { protect } from '../middleware/auth.middleware';
import { checkAccountStatus } from '../middleware/checkAccountStatus';
import { validate } from '../middleware/validate';
import { createClientSchema, depositSchema, renewSchema, payoutSchema, updateClientSchema, clientIdSchema } from '../schemas/client.schema';

const router = Router();

// Protect all client routes
router.use(protect);

router.post('/', validate(createClientSchema), createClient);
router.get('/', getAllClients);

// Routes with account status check and validation
router.post('/:id/renew', validate(renewSchema), checkAccountStatus, renewAccount);
router.post('/:id/deposit', validate(depositSchema), checkAccountStatus, depositToAccount);
router.post('/:id/payout', validate(payoutSchema), checkAccountStatus, payoutClientAccount);

router.get('/:id', validate(clientIdSchema), getClientById);
router.put('/:id', validate(updateClientSchema), updateClient);
router.delete('/:id', validate(clientIdSchema), deleteClient);

export default router;
