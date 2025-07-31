import { z } from "zod";

export const voccationalSchema = z.object({
  employeeIDs: z.string(),
  industrySectorIDs: z.string().optional(),
  voccationalTitleShort: z.string().optional(),
  voccationalTitleLong: z.string().optional(),
  voccationalMINT: z.boolean().optional(),
  company: z.string().optional(),
  voccationalStart: z.date().optional(),
  voccationalEnd: z.date().optional(),
}); 