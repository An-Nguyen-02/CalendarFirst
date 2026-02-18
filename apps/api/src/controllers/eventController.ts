import { Request, Response } from "express";
import { createEventSchema, updateEventSchema } from "../schemas/event";
import * as eventService from "../services/eventService";

export async function createEvent(req: Request, res: Response) {
  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const orgId = req.params.orgId as string;
  const event = await eventService.create(orgId, parsed.data);
  res.status(201).json(event);
}

export async function listOrgEvents(req: Request, res: Response) {
  const orgId = req.params.orgId as string;
  const status = req.query.status as "DRAFT" | "PUBLISHED" | undefined;
  const events = await eventService.listByOrg(orgId, status ? { status } : undefined);
  res.status(200).json({ events });
}

export async function getOrgEvent(req: Request, res: Response) {
  const { orgId, eventId } = req.params;
  const event = await eventService.getById(eventId, orgId);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(200).json(event);
}

export async function updateEvent(req: Request, res: Response) {
  const parsed = updateEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { orgId, eventId } = req.params;
  const event = await eventService.update(eventId, orgId, parsed.data);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(200).json(event);
}

export async function deleteEvent(req: Request, res: Response) {
  const { orgId, eventId } = req.params;
  const deleted = await eventService.deleteEvent(eventId, orgId);
  if (!deleted) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(204).send();
}

export async function listPublicEvents(req: Request, res: Response) {
  const from = req.query.from
    ? new Date(req.query.from as string)
    : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;
  const limit =
    req.query.limit != null ? Number(req.query.limit) : undefined;
  const events = await eventService.listPublic({ from, to, limit });
  res.status(200).json({ events });
}

export async function getPublicEvent(req: Request, res: Response) {
  const eventId = req.params.eventId;
  const event = await eventService.getById(eventId);
  if (!event || event.status !== "PUBLISHED") {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  res.status(200).json(event);
}
