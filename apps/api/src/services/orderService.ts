import { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import * as idempotencyService from "./idempotencyService";
import type { CreateOrderItemInput } from "../schemas/order";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createOrder(
  userId: string,
  eventId: string,
  items: CreateOrderItemInput[],
  endpoint: string,
  idempotencyKey?: string
) {
  if (idempotencyKey) {
    const cachedOrderId = await idempotencyService.getCachedResponse(
      idempotencyKey,
      userId,
      endpoint
    );
    if (cachedOrderId) {
      const order = await prisma.order.findUnique({
        where: { id: cachedOrderId, userId },
        include: { items: { include: { ticketType: true } } },
      });
      if (order) return { order, cached: true };
    }
  }

  const ticketTypeIds = items.map((i) => i.ticketTypeId);
  const itemMap = new Map(items.map((i) => [i.ticketTypeId, i.qty]));

  const orderResult = await prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<
      { id: string; quantity_sold: number; quantity_total: number; price_cents: number }[]
    >(
      Prisma.sql`
        SELECT id, quantity_sold, quantity_total, price_cents
        FROM ticket_types
        WHERE event_id = ${eventId}
        AND id IN (${Prisma.join(ticketTypeIds)})
        FOR UPDATE
      `
    );

    if (locked.length !== ticketTypeIds.length) {
      throw new Error("One or more ticket types not found for this event");
    }

    for (const row of locked) {
      const qty = itemMap.get(row.id) ?? 0;
      if (row.quantity_sold + qty > row.quantity_total) {
        throw new Error(`Insufficient inventory for ticket type ${row.id}`);
      }
    }

    for (const row of locked) {
      const qty = itemMap.get(row.id) ?? 0;
      await tx.ticketType.update({
        where: { id: row.id },
        data: { quantitySold: { increment: qty } },
      });
    }

    let totalCents = 0;
    const lockedMap = new Map(locked.map((r) => [r.id, r]));
    for (const item of items) {
      const tt = lockedMap.get(item.ticketTypeId);
      if (tt) totalCents += tt.price_cents * item.qty;
    }

    const order = await tx.order.create({
      data: {
        userId,
        eventId,
        status: OrderStatus.CREATED,
        totalCents,
        items: {
          create: items.map((item) => {
            const tt = lockedMap.get(item.ticketTypeId)!;
            return {
              ticketTypeId: item.ticketTypeId,
              qty: item.qty,
              unitPriceCents: tt.price_cents,
            };
          }),
        },
      },
      include: { items: { include: { ticketType: true } } },
    });

    if (idempotencyKey) {
      const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);
      await tx.idempotencyKey.upsert({
        where: {
          userId_endpoint_key: { userId, endpoint, key: idempotencyKey },
        },
        create: {
          key: idempotencyKey,
          userId,
          endpoint,
          responseRef: order.id,
          expiresAt,
        },
        update: { responseRef: order.id, expiresAt },
      });
    }

    return order;
  });

  return { order: orderResult, cached: false };
}

export async function listOrdersByUser(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    include: { items: { include: { ticketType: true } }, event: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string, userId: string) {
  return await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: { include: { ticketType: true } }, event: true },
  });
}
