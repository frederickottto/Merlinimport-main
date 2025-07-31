import { z } from "zod";

export const employeeProjectActivitiesSchema = z.object({
  employeeIDs: z.string(),
  projectIDs: z.string(),
  employeeRoleID: z.string(),
  description: z.string(),
  operationalPeriodStart: z.date(),
  operationalPeriodEnd: z.date(),
  operationalDays: z.number().int().optional().default(0),
}); 