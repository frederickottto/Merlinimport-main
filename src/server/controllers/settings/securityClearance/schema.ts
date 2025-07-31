import { z } from "zod";

export const securityClearanceSchema = z.object({
  id: z.string(),
  employeeIDs: z.string(),
  approved: z.boolean().optional(),
  securityClearanceType: z.string().optional(),
  securityClearanceLevel: z.string().optional(),
  applicationDate: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SecurityClearance = z.infer<typeof securityClearanceSchema>; 