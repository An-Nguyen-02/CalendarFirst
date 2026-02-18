import { z } from "zod";

export const createTicketTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3, "Currency must be 3 characters (e.g. USD)"),
  quantityTotal: z.number().int().positive("Quantity must be at least 1"),
});

export const updateTicketTypeSchema = z.object({
  name: z.string().min(1).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  quantityTotal: z.number().int().positive().optional(),
});

export type CreateTicketTypeInput = z.infer<typeof createTicketTypeSchema>;
export type UpdateTicketTypeInput = z.infer<typeof updateTicketTypeSchema>;
