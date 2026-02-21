import logger from "../config/logger";
import prisma from "../services/prisma";
import { databaseService } from "../services/database";
import { AgentType, AgentDto } from "../types/agent.types";

export interface AgentModel {
  create(agent: AgentDto): Promise<AgentType>;
  findById(id: string): Promise<AgentType | null>;
  update(id: string, agent: Partial<AgentType>): Promise<AgentType | null>;
  delete(id: string): Promise<boolean>;
}

class Agent implements AgentModel {
  public async create(agent: AgentDto): Promise<AgentType> {
    try {
      const currentFiscalYear = await databaseService.getCurrentFiscalYear();
      const result = await prisma.agent.create({
        data: {
          firstname: agent.firstname,
          lastname: agent.lastname,
          email: agent.email || null,
          location: agent.location || null,
          createdFiscalYear: currentFiscalYear,
        },
      });
      return {
        ...result,
        id: result.id.toString(),
        email: result.email ?? undefined,
        location: result.location ?? undefined,
      };
    } catch (error) {
      logger.error("Error creating agent:", { error });
      throw error;
    }
  }

  public async findById(id: string): Promise<AgentType | null> {
    try {
      const agentId = parseInt(id, 10);
      if (isNaN(agentId)) return null;

      const row = await prisma.agent.findUnique({
        where: { id: agentId },
      });

      if (!row) return null;
      return {
        ...row,
        id: row.id.toString(),
        email: row.email ?? undefined,
        location: row.location ?? undefined,
      };
    } catch (error) {
      logger.error("Error finding agent:", { error });
      throw error;
    }
  }

  public async update(
    id: string,
    agent: Partial<AgentType>,
  ): Promise<AgentType | null> {
    try {
      const agentId = parseInt(id, 10);
      if (isNaN(agentId)) return null;

      const result = await prisma.agent.update({
        where: { id: agentId },
        data: {
          firstname: agent.firstname,
          lastname: agent.lastname,
          email: agent.email,
          location: agent.location,
        },
      });

      return {
        ...result,
        id: result.id.toString(),
        email: result.email ?? undefined,
        location: result.location ?? undefined,
      };
    } catch (error) {
      logger.error("Error updating agent:", { error });
      throw error;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      const agentId = parseInt(id, 10);
      if (isNaN(agentId)) return false;

      await prisma.agent.delete({
        where: { id: agentId },
      });
      return true;
    } catch (error) {
      logger.error("Error deleting agent:", { error });
      return false;
    }
  }
}

export default new Agent();
