import { Router } from 'express';
import { createTicket, getTicketById, updateTicket, deleteTicket, getAllTickets } from '../controllers/ticket.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all ticket routes
router.use(protect);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create a new ticket
 * @access  Private (Admin only)
 */
router.post('/', createTicket);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets
 * @access  Private (Admin only)
 */
router.get('/', getAllTickets);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private (Admin only)
 */
router.get('/:id', getTicketById);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update a ticket by ID
 * @access  Private (Admin only)
 */
router.put('/:id', updateTicket);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Delete a ticket by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteTicket);

export default router;
