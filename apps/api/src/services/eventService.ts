import { EventStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { CreateEventInput, UpdateEventInput } from "../schemas/event";

export async function create(orgId: string, data: CreateEventInput) {
  return await prisma.event.create({
    data: {
      orgId,
      title: data.title,
      description: data.description ?? null,
      startAt: data.startAt,
      endAt: data.endAt,
      venue: data.venue ?? null,
      status: data.status,
      capacity: data.capacity ?? null,
    },
  });
}

export async function update(
  eventId: string,
  orgId: string,
  data: UpdateEventInput
) {
  const updateData: Prisma.EventUpdateManyMutationInput = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.startAt !== undefined) updateData.startAt = data.startAt;
  if (data.endAt !== undefined) updateData.endAt = data.endAt;
  if (data.venue !== undefined) updateData.venue = data.venue;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;

  const result = await prisma.event.updateMany({
    where: { id: eventId, orgId },
    data: updateData,
  });
  if (result.count === 0) return null;
  return await prisma.event.findUnique({
    where: { id: eventId },
  });
}

export async function getById(eventId: string, orgId?: string) {
  if (orgId) {
    return await prisma.event.findFirst({
      where: { id: eventId, orgId },
    });
  }
  return await prisma.event.findUnique({
    where: { id: eventId },
  });
}

export async function listByOrg(
  orgId: string,
  options?: { status?: EventStatus }
) {
  return await prisma.event.findMany({
    where: { orgId, ...(options?.status != null && { status: options.status }) },
    orderBy: { startAt: "asc" },
  });
}

export async function listPublic(options?: {
  from?: Date;
  to?: Date;
  limit?: number;
  offset?: number;
  search?: string;
}) {
  const where: Prisma.EventWhereInput = {
    status: EventStatus.PUBLISHED,
  };
  if (options?.from != null || options?.to != null) {
    where.startAt = {};
    if (options.from != null) (where.startAt as { gte?: Date }).gte = options.from;
    if (options.to != null) (where.startAt as { lte?: Date }).lte = options.to;
  }
  if (options?.search?.trim()) {
    const q = options.search.trim();
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : []),
      {
        OR: [
          { title: { contains: q, mode: "insensitive" as const } },
          { description: { contains: q, mode: "insensitive" as const } },
        ],
      },
    ];
  }
  return await prisma.event.findMany({
    where,
    orderBy: { startAt: "asc" },
    ...(options?.limit != null && { take: options.limit }),
    ...(options?.offset != null && { skip: options.offset }),
  });
}

export async function deleteEvent(eventId: string, orgId: string) {
  const event = await prisma.event.findFirst({
    where: { id: eventId, orgId },
    include: { _count: { select: { orders: true } } },
  });
  if (!event) return { deleted: false, reason: "not_found" as const };
  if (event._count.orders > 0) {
    return { deleted: false, reason: "has_orders" as const };
  }
  await prisma.event.deleteMany({
    where: { id: eventId, orgId },
  });
  return { deleted: true };
}
