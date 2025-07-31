import { z } from "zod";

export const professionalBackgroundSchema = z.object({
  employeeIDs: z.string(),
  industrySectorIDs: z.string().optional(),
  position: z.string().optional(),
  executivePosition: z.boolean().optional().default(false),
  employer: z.string().optional(),
  description: z.string().optional(),
  professionStart: z.date().optional(),
  professionEnd: z.date().optional(),
  experienceIt: z.number().int().optional().default(0),
  experienceIs: z.number().int().optional().default(0),
  experienceItGs: z.number().int().optional().default(0),
  experienceGps: z.number().int().optional().default(0),
  experienceOther: z.number().int().optional().default(0),
  experienceAll: z.number().int().optional().default(0),
}); 