import { prisma } from "../lib/prisma";
import type {
  CreateTicketTypeInput,
  UpdateTicketTypeInput,
} from "../schemas/ticketType";

export async function create(eventId: string, data: CreateTicketTypeInput) {
  return await prisma.ticketType.create({
    data: { eventId, ...data },
  });
}

export async function update(
  ticketTypeId: string,
  eventId: string,
  data: UpdateTicketTypeInput
) {
  const existing = await prisma.ticketType.findFirst({
    where: { id: ticketTypeId, eventId },
  });
  if (!existing) return null;
  if (
    data.quantityTotal != null &&
    data.quantityTotal < existing.quantitySold
  ) {
    throw new Error("quantityTotal cannot be less than quantity already sold");
  }
  const updateData: { name?: string; priceCents?: number; currency?: string; quantityTotal?: number } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.priceCents !== undefined) updateData.priceCents = data.priceCents;
  if (data.currency !== undefined) updateData.currency = data.currency;
  if (data.quantityTotal !== undefined) updateData.quantityTotal = data.quantityTotal;
  return await prisma.ticketType.update({
    where: { id: ticketTypeId },
    data: updateData,
  });
}

export async function getById(ticketTypeId: string, eventId?: string) {
  if (eventId) {
    return await prisma.ticketType.findFirst({
      where: { id: ticketTypeId, eventId },
    });
  }
  return await prisma.ticketType.findUnique({
    where: { id: ticketTypeId },
  });
}

export async function listByEvent(eventId: string) {
  return await prisma.ticketType.findMany({
    where: { eventId },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteTicketType(ticketTypeId: string, eventId: string) {
  const existing = await prisma.ticketType.findFirst({
    where: { id: ticketTypeId, eventId },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!existing) return false;
  if (existing._count.orderItems > 0) {
    throw new Error("Cannot delete ticket type with existing orders");
  }
  await prisma.ticketType.delete({
    where: { id: ticketTypeId },
  });
  return true;
}
