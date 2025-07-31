import { z } from "zod";

export const conditionsOfParticipationTypeSchema = z.object({
  id: z.string().min(1),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  title: z.string(),
  description: z.string().nullable().optional(),
  parentTypeIDs: z.string().nullable().optional(),
  callToTenderIDs: z.string(),
});

export type ConditionsOfParticipationType = z.infer<typeof conditionsOfParticipationTypeSchema>;

export const createConditionsOfParticipationTypeSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  parentTypeIDs: z.string().nullable().optional(),
  callToTenderIDs: z.string(),
});

export const updateConditionsOfParticipationTypeSchema = createConditionsOfParticipationTypeSchema.partial(); 