import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
