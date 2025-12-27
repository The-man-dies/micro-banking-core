import { Router } from 'express';
import { createClient, getClientById, getAllClients, updateClient, deleteClient, renewAccount, depositToAccount } from '../controllers/client.controller';
import { protect } from '../middleware/auth.middleware';
import { checkAccountStatus } from '../middleware/checkAccountStatus';

const router = Router();

// Protect all client routes
router.use(protect);

router.post('/', createClient);
router.get('/', getAllClients);

// Routes with account status check
router.post('/:id/renew', checkAccountStatus, renewAccount);
router.post('/:id/deposit', checkAccountStatus, depositToAccount);

router.get('/:id', getClientById);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
