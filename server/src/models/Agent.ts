import type { Database } from "sqlite";
import logger from "../config/logger";
import { getDbConnection } from "../services/database";
import { AgentType, AgentDto } from '../types/agent.types';

export interface AgentModel {
    create(agent: AgentDto): Promise<AgentType>;
    findById(id: string): Promise<AgentType | null>;
    update(id: string, agent: Partial<AgentType>): Promise<AgentType | null>;
    delete(id: string): Promise<boolean>;
}

class Agent implements AgentModel {
    public async create(agent: AgentDto): Promise<AgentType> {
        let dbConnection: Database | null = await getDbConnection();
        try {
            const result = await dbConnection.run(
            `INSERT INTO Agent (firstname, lastname, email, location) VALUES (?, ?, ?, ?)`,
            agent.firstname,
            agent.lastname,
            agent.email || null,
            agent.location || null
        );
        return {
            id: result.lastID?.toString() || '',
            ...agent
        };
        } catch (error) {
            logger.error('Error creating agent:', { error });
            throw error;
        } finally {

        }
    }

    public async findById(id: string): Promise<AgentType | null> {
        let dbConnection = await getDbConnection();

        try {
            const row = await dbConnection.get(
                `SELECT * FROM Agent WHERE id = ?`,
                id
            );
            if (!row) return null;
            return {
                id: row.id.toString(),
                firstname: row.firstname,
                lastname: row.lastname,
                email: row.email || null,
                location: row.location || null
            };
        } catch (error) {
            logger.error('Error finding agent:', { error });
            throw error;
        } finally {

        }
    }

    public async update(id: string, agent: Partial<AgentType>): Promise<AgentType | null> {
        let dbConnection = await getDbConnection();
        try {
            const existingAgent = await this.findById(id);
            if (!existingAgent) return null;
            const updatedAgent = {
                ...existingAgent,
                ...agent
            };
            await dbConnection.run(
                `UPDATE Agent SET firstname = ?, lastname = ?, email = ?, location = ? WHERE id = ?`,
                updatedAgent.firstname,
                updatedAgent.lastname,
                updatedAgent.email || null,
                updatedAgent.location || null,
                id
            );
            return updatedAgent;
        } catch (error) {
            logger.error('Error updating agent:', { error });
            throw error;
        } finally {

        }
    }
    public async delete(id: string): Promise<boolean> {
        let dbConnection = await getDbConnection();
        try {
            const result = await dbConnection.run(
                `DELETE FROM Agent WHERE id = ?`,
                id
            );
            return result.changes !== undefined && result.changes > 0;
        } catch (error) {
            logger.error('Error deleting agent:', { error });
            throw error;
        } finally {

        }
    }
}

export default new Agent();