import { z } from "zod";

export const salutationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Salutation = z.infer<typeof salutationSchema>;

export const createSalutationSchema = z.object({
  salutationShort: z.string().min(1, "Kurzform ist erforderlich"),
  salutationLong: z.string().optional(),
});

export type CreateSalutationInput = z.infer<typeof createSalutationSchema>; 