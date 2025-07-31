import { z } from "zod";

export const organisationSchema = z.object({
  id: z.string(),
  organisationIDs: z.string().min(1, "Organisation ist erforderlich"),
  callToTenderIDs: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  organisationRole: z.string().min(1, "Rolle ist erforderlich"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  organisation: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type Organisation = z.infer<typeof organisationSchema>;
