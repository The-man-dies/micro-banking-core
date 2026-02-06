import { Response } from 'express';
import { ApiResponse } from '../utils/response.handler';
import logger from '../config/logger';
import { AuthRequest } from '../types/express.d'; // Assuming AuthRequest is extended for general use
import Agent from '../models/Agent';
import { AgentDto } from '../types/agent.types';
import { databaseService } from '../services/database';

export const createAgent = async (req: AuthRequest, res: Response) => {
    try {
        const agentData: AgentDto = req.body;
        const newAgent = await Agent.create(agentData);
        logger.info('Agent created successfully:', { agentId: newAgent.id });
        return ApiResponse.success(res, 'Agent created successfully', newAgent, 201);
    } catch (error) {
        logger.error('Error creating agent:', { error });
        return ApiResponse.error(res, 'Failed to create agent', null, 500);
    }
};

export const getAgentById = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const agent = await Agent.findById(id);
        if (!agent) {
            return ApiResponse.error(res, 'Agent not found', null, 404);
        }
        logger.info('Agent retrieved successfully:', { agentId: agent.id });
        return ApiResponse.success(res, 'Agent retrieved successfully', agent);
    } catch (error) {
        logger.error('Error retrieving agent:', { error });
        return ApiResponse.error(res, 'Failed to retrieve agent', null, 500);
    }
};

export const updateAgent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const agentData: Partial<AgentDto> = req.body;
        const updatedAgent = await Agent.update(id, agentData);
        if (!updatedAgent) {
            return ApiResponse.error(res, 'Agent not found', null, 404);
        }
        logger.info('Agent updated successfully:', { agentId: updatedAgent.id });
        return ApiResponse.success(res, 'Agent updated successfully', updatedAgent);
    } catch (error) {
        logger.error('Error updating agent:', { error });
        return ApiResponse.error(res, 'Failed to update agent', null, 500);
    }
};

export const deleteAgent = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const deleted = await Agent.delete(id);
        if (!deleted) {
            return ApiResponse.error(res, 'Agent not found', null, 404);
        }
        logger.info('Agent deleted successfully:', { agentId: id });
        return ApiResponse.success(res, 'Agent deleted successfully', null, 204);
    } catch (error) {
        logger.error('Error deleting agent:', { error });
        return ApiResponse.error(res, 'Failed to delete agent', null, 500);
    }
};


// You might also want a getAllAgents function
export const getAllAgents = async (req: AuthRequest, res: Response) => {
    try {
        const db = await databaseService.getDbConnection();
        const qRaw = (req.query.q as string | undefined) ?? '';
        const q = qRaw.trim();

        const agents = q
            ? await db.all(
                `SELECT id, firstname, lastname, email, location
                 FROM Agent
                 WHERE CAST(id AS TEXT) LIKE ?
                    OR LOWER(firstname) LIKE LOWER(?)
                    OR LOWER(lastname) LIKE LOWER(?)
                    OR LOWER(IFNULL(email, '')) LIKE LOWER(?)
                    OR LOWER(IFNULL(location, '')) LIKE LOWER(?)
                 ORDER BY id DESC`,
                `%${q}%`,
                `%${q}%`,
                `%${q}%`,
                `%${q}%`,
                `%${q}%`
            )
            : await db.all('SELECT id, firstname, lastname, email, location FROM Agent ORDER BY id DESC');
        logger.info('All agents retrieved successfully.');
        return ApiResponse.success(res, 'Agents retrieved successfully', agents);
    } catch (error) {
        logger.error('Error retrieving all agents:', { error });
        return ApiResponse.error(res, 'Failed to retrieve agents', null, 500);
    }
};
