import { Router } from 'express';
import adminRoutes from './admin.routes';
import agentRoutes from './agent.routes';
import ticketRoutes from './ticket.routes';
import clientRoutes from './client.routes';
import statsRoutes from './stats.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// This is where you will import and use your future route modules
router.use('/admin', adminRoutes);
router.use('/agents', agentRoutes);
router.use('/tickets', ticketRoutes);
router.use('/clients', clientRoutes);
router.use('/stats', statsRoutes);
router.use('/transactions', transactionRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Micro Banking API v1' });
});

export default router;
