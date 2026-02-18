import { z } from "zod";

export const eventStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

export const createEventSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    venue: z.string().optional(),
    status: eventStatusSchema.default("DRAFT"),
    capacity: z.number().int().positive().optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

export const updateEventSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    startAt: z.coerce.date().optional(),
    endAt: z.coerce.date().optional(),
    venue: z.string().optional().nullable(),
    status: eventStatusSchema.optional(),
    capacity: z.number().int().positive().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startAt != null && data.endAt != null) {
        return data.endAt > data.startAt;
      }
      return true;
    },
    { message: "endAt must be after startAt", path: ["endAt"] }
  );

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
