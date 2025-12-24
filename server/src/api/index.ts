import { Router } from 'express';
import adminRoutes from './admin.routes';

const router = Router();

// This is where you will import and use your future route modules
router.use('/admin', adminRoutes);

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Micro Banking API v1' });
});

export default router;
