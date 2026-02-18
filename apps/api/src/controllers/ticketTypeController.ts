import { Request, Response } from "express";
import { createTicketTypeSchema, updateTicketTypeSchema } from "../schemas/ticketType";
import * as eventService from "../services/eventService";
import * as ticketTypeService from "../services/ticketTypeService";
import { EventStatus } from "@prisma/client";

export async function createTicketType(req: Request, res: Response) {
  const parsed = createTicketTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const eventId = req.params.eventId as string;
  const ticketType = await ticketTypeService.create(eventId, parsed.data);
  res.status(201).json(ticketType);
}

export async function listTicketTypes(req: Request, res: Response) {
  const eventId = req.params.eventId as string;
  const ticketTypes = await ticketTypeService.listByEvent(eventId);
  res.status(200).json({ ticketTypes });
}

export async function getTicketType(req: Request, res: Response) {
  const { eventId, ticketTypeId } = req.params;
  const ticketType = await ticketTypeService.getById(ticketTypeId, eventId);
  if (!ticketType) {
    res.status(404).json({ error: "Ticket type not found" });
    return;
  }
  res.status(200).json(ticketType);
}

export async function updateTicketType(req: Request, res: Response) {
  const parsed = updateTicketTypeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { eventId, ticketTypeId } = req.params;
  try {
    const ticketType = await ticketTypeService.update(
      ticketTypeId,
      eventId,
      parsed.data
    );
    if (!ticketType) {
      res.status(404).json({ error: "Ticket type not found" });
      return;
    }
    res.status(200).json(ticketType);
  } catch (err) {
    if (err instanceof Error && err.message.includes("quantity already sold")) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function deleteTicketType(req: Request, res: Response) {
  const { eventId, ticketTypeId } = req.params;
  try {
    const deleted = await ticketTypeService.deleteTicketType(
      ticketTypeId,
      eventId
    );
    if (!deleted) {
      res.status(404).json({ error: "Ticket type not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    if (err instanceof Error && err.message.includes("existing orders")) {
      res.status(400).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function listPublicTicketTypes(req: Request, res: Response) {
  const eventId = req.params.eventId as string;
  const event = await eventService.getById(eventId);
  if (!event || event.status !== EventStatus.PUBLISHED) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const ticketTypes = await ticketTypeService.listByEvent(eventId);
  res.status(200).json({ ticketTypes });
}
