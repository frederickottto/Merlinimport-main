import { z } from "zod";

export const workpackageSchema = z.object({
  id: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().nullable(),
  volumePT: z.number().nullable(),
  lotID: z.string(),
});

export const createWorkpackageSchema = z.object({
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().nullable(),
  volumePT: z.number().nullable(),
  lotID: z.string(),
});

export const updateWorkpackageSchema = z.object({
  id: z.string(),
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().nullable(),
  volumePT: z.number().nullable(),
  lotID: z.string(),
});

export type Workpackage = z.infer<typeof workpackageSchema>;
export type CreateWorkpackage = z.infer<typeof createWorkpackageSchema>;
export type UpdateWorkpackage = z.infer<typeof updateWorkpackageSchema>; 