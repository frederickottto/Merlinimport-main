import { z } from "zod";

export const employeeCertificatesSchema = z.object({
  employeeIDs: z.string(),
  employeeDisplayName: z.string(),
  certificateIDs: z.string(),
  validUntil: z.date().optional(),
  issuer: z.string().optional(),
}); 