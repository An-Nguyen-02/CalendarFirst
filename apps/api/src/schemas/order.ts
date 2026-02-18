import { z } from "zod";

export const createOrderItemSchema = z.object({
  ticketTypeId: z.string().uuid(),
  qty: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
  idempotencyKey: z.string().min(1).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
