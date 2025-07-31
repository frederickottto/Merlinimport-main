import { z } from "zod";

export const callToTenderDeliverablesSchema = z.object({
  id: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  callToTenderIDs: z.string(),
  deliverablesIDs: z.string(),
  autoSelected: z.boolean().nullable(),
  callToTender: z.object({
    id: z.string(),
    title: z.string().nullable(),
  }).optional(),
  deliverables: z.object({
    id: z.string(),
    title: z.string(),
  }).optional(),
});

export const createCallToTenderDeliverablesSchema = z.object({
  deliverablesIDs: z.string(),
  callToTenderIDs: z.string(),
  autoSelected: z.boolean().optional(),
});

export type CallToTenderDeliverables = z.infer<typeof callToTenderDeliverablesSchema>;
