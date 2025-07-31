import { z } from "zod";

export const skillSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Skill = z.infer<typeof skillSchema>; 