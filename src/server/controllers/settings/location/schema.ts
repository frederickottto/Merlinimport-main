import { z } from "zod";

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  street: z.string(),
  houseNumber: z.string(),
  postalCode: z.string(),
  city: z.string(),
  country: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Location = z.infer<typeof locationSchema>; 