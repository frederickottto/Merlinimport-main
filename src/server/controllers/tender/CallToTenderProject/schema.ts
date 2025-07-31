import { z } from "zod";

export const callToTenderProjectSchema = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  relevance: z.string().optional(),
  projectId: z.string(),
  callToTenderId: z.string(),
  project: z.object({
    id: z.string(),
    title: z.string(),
    type: z.string().optional(),
    description: z.string().optional(),
  }),
});

export const createCallToTenderProjectSchema = z.object({
  projectId: z.string(),
  callToTenderId: z.string(),
  role: z.string().optional(),
  description: z.string().optional(),
  relevance: z.string().optional(),
  autoSelected: z.boolean().optional(),
});

export type CallToTenderProject = z.infer<typeof callToTenderProjectSchema>;
export type CreateCallToTenderProject = z.infer<typeof createCallToTenderProjectSchema>; 