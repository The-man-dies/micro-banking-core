import { Router } from 'express';
import { createAgent, getAgentById, updateAgent, deleteAgent, getAllAgents } from '../controllers/agent.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protect all agent routes
router.use(protect);

/**
 * @route   POST /api/v1/agents
 * @desc    Create a new agent
 * @access  Private (Admin only)
 */
router.post('/', createAgent);

/**
 * @route   GET /api/v1/agents
 * @desc    Get all agents
 * @access  Private (Admin only)
 */
router.get('/', getAllAgents);

/**
 * @route   GET /api/v1/agents/:id
 * @desc    Get agent by ID
 * @access  Private (Admin only)
 */
router.get('/:id', getAgentById);

/**
 * @route   PUT /api/v1/agents/:id
 * @desc    Update an agent by ID
 * @access  Private (Admin only)
 */
router.put('/:id', updateAgent);

/**
 * @route   DELETE /api/v1/agents/:id
 * @desc    Delete an agent by ID
 * @access  Private (Admin only)
 */
router.delete('/:id', deleteAgent);

export default router;
