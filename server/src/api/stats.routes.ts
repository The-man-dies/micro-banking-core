import { Router } from 'express';
import { getDashboardStats, getTimeSeriesStats } from '../controllers/stats.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All stats routes are protected
router.use(protect);

router.get('/dashboard', getDashboardStats);
router.get('/timeseries', getTimeSeriesStats);

export default router;
