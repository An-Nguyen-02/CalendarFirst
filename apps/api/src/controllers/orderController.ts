import { Request, Response } from "express";
import { createOrderSchema } from "../schemas/order";
import * as eventService from "../services/eventService";
import * as orderService from "../services/orderService";
import * as stripeService from "../services/stripeService";
import { EventStatus, OrderStatus } from "@prisma/client";

export async function createOrder(req: Request, res: Response) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const eventId = req.params.eventId as string;
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const event = await eventService.getById(eventId);
  if (!event || event.status !== EventStatus.PUBLISHED) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const idempotencyKey =
    (req.headers["idempotency-key"] as string | undefined) ??
    parsed.data.idempotencyKey;
  const endpoint = `POST:/events/${eventId}/orders`;
  try {
    const result = await orderService.createOrder(
      userId,
      eventId,
      parsed.data.items,
      endpoint,
      idempotencyKey
    );
    res.status(201).json({ order: result.order, cached: result.cached });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes("Insufficient inventory") ||
        err.message.includes("not found"))
    ) {
      res.status(409).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function listOrders(req: Request, res: Response) {
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const orders = await orderService.listOrdersByUser(userId);
  res.status(200).json({ orders });
}

export async function getOrder(req: Request, res: Response) {
  const orderId = req.params.orderId as string;
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const order = await orderService.getOrderById(orderId, userId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  res.status(200).json(order);
}

export async function checkout(req: Request, res: Response) {
  const orderId = req.params.orderId as string;
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const order = await orderService.getOrderById(orderId, userId);
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.status !== OrderStatus.CREATED) {
    res.status(400).json({
      error:
        "Order cannot be checked out. Only orders with status CREATED are allowed.",
    });
    return;
  }
  const baseUrl = process.env.BASE_URL ?? "http://localhost:4000";
  const successUrl = `${baseUrl}/orders/success?orderId=${orderId}`;
  const cancelUrl = `${baseUrl}/orders/cancel?orderId=${orderId}`;
  try {
    const url = await stripeService.createCheckoutSession(
      order,
      successUrl,
      cancelUrl
    );
    res.status(200).json({ url });
  } catch (err) {
    if (err instanceof Error && err.message.includes("Stripe")) {
      res.status(502).json({ error: err.message });
      return;
    }
    throw err;
  }
}

export async function listEventOrders(req: Request, res: Response) {
  const orgId = req.params.orgId as string;
  const eventId = req.params.eventId as string;
  if (!orgId || !eventId) {
    res.status(400).json({ error: "Missing orgId or eventId" });
    return;
  }
  const orders = await orderService.listOrdersByEvent(eventId, orgId);
  res.status(200).json({ orders });
}

export async function cancelOrder(req: Request, res: Response) {
  const orderId = req.params.orderId as string;
  const userId = req.user?.sub;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const order = await orderService.cancelOrder(orderId, userId);
  if (!order) {
    res.status(400).json({
      error: "Order not found or cannot be cancelled (only CREATED orders can be cancelled)",
    });
    return;
  }
  res.status(200).json(order);
}
