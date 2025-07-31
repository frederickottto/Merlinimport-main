import { z } from "zod";

// Schema for creating a new employee assignment
export const createCallToTenderEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Mitarbeiter ist erforderlich"),
  callToTenderId: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  employeeCallToTenderRole: z.string().min(1, "Rolle ist erforderlich"),
  profilePrice: z.number().optional(),
  travelCost: z.number().optional(),
  autoSelected: z.boolean().optional(),
});

// Schema for the full employee assignment including all fields
export const callToTenderEmployeeSchema = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  role: z.string().optional(),
  description: z.string().optional(),
  profileTitle: z.string().optional(),
  costCenter: z.number().optional(),
  profilePrice: z.number().optional(),
  travelCost: z.number().optional(),
  employeeId: z.string().min(1, "Mitarbeiter ist erforderlich"),
  callToTenderId: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  employeeCallToTenderRole: z.string().min(1, "Rolle ist erforderlich"),
  employee: z.object({
    id: z.string(),
    name: z.string(),
  }).optional().nullable(),
});

export type CreateCallToTenderEmployee = z.infer<typeof createCallToTenderEmployeeSchema>;
export type CallToTenderEmployee = z.infer<typeof callToTenderEmployeeSchema>;
