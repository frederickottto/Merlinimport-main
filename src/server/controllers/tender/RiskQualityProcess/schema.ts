import { z } from "zod";

export const riskQualityProcessSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Typ ist erforderlich"),
  status: z.string().min(1, "Status ist erforderlich"),
  note: z.string().optional(),
  callToTenderID: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  organisationID: z.string().nullable().optional(),
  organisation: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type RiskQualityProcess = z.infer<typeof riskQualityProcessSchema>; 