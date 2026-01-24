import { Router } from 'express';
import { getAllTransactions } from '../controllers/transaction.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route   GET /api/v1/transactions
 * @desc    Get all transactions
 * @access  Private
 */
router.get('/', protect, getAllTransactions);

export default router;
