import { Response } from "express";
import { ApiResponse } from "../utils/response.handler";
import logger from "../config/logger";
import { AuthRequest } from "../types/express.d";
import Ticket from "../models/Ticket";
import { TicketDto } from "../types/ticket.types";
import prisma from "../services/prisma";

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const ticketData: TicketDto = req.body;
    const newTicket = await Ticket.create(ticketData);
    logger.info("Ticket created successfully:", { ticketId: newTicket.id });
    return ApiResponse.success(
      res,
      "Ticket created successfully",
      newTicket,
      201,
    );
  } catch (error) {
    logger.error("Error creating ticket:", { error });
    return ApiResponse.error(res, "Failed to create ticket", null, 500);
  }
};

export const getTicketById = async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return ApiResponse.error(res, "Ticket not found", null, 404);
    }
    logger.info("Ticket retrieved successfully:", { ticketId: ticket.id });
    return ApiResponse.success(res, "Ticket retrieved successfully", ticket);
  } catch (error) {
    logger.error("Error retrieving ticket:", { error });
    return ApiResponse.error(res, "Failed to retrieve ticket", null, 500);
  }
};

export const updateTicket = async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const ticketData: Partial<TicketDto> = req.body;
    const updatedTicket = await Ticket.update(ticketId, ticketData);
    if (!updatedTicket) {
      return ApiResponse.error(res, "Ticket not found", null, 404);
    }
    logger.info("Ticket updated successfully:", { ticketId: updatedTicket.id });
    return ApiResponse.success(
      res,
      "Ticket updated successfully",
      updatedTicket,
    );
  } catch (error) {
    logger.error("Error updating ticket:", { error });
    return ApiResponse.error(res, "Failed to update ticket", null, 500);
  }
};

export const deleteTicket = async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id, 10);
    const deleted = await Ticket.delete(ticketId);
    if (!deleted) {
      return ApiResponse.error(res, "Ticket not found", null, 404);
    }
    logger.info("Ticket deleted successfully:", { ticketId: ticketId });
    return ApiResponse.success(res, "Ticket deleted successfully", null, 204);
  } catch (error) {
    logger.error("Error deleting ticket:", { error });
    return ApiResponse.error(res, "Failed to delete ticket", null, 500);
  }
};

// You might also want a getAllTickets function
export const getAllTickets = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany();
    logger.info("All tickets retrieved successfully.");
    return ApiResponse.success(res, "Tickets retrieved successfully", tickets);
  } catch (error) {
    logger.error("Error retrieving all tickets:", { error });
    return ApiResponse.error(res, "Failed to retrieve tickets", null, 500);
  }
};
