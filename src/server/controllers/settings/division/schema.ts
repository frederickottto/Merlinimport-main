import { z } from "zod";

const employeeSchema = z.object({
  id: z.string(),
  foreName: z.string(),
  lastName: z.string(),
});

export const divisionSchema = z.object({
  id: z.string(),
  title: z.string(),
  abbreviation: z.string().optional(),
  managedById: z.string().optional(),
  parentDivisionId: z.string().optional(),
  employeeIDs: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Relations
  managedBy: employeeSchema.nullable(),
  parentDivision: z.object({
    id: z.string(),
    title: z.string(),
  }).nullable(),
  subDivisions: z.array(z.object({
    id: z.string(),
    title: z.string(),
  })).optional(),
  employees: z.array(employeeSchema).optional(),
});

export type Division = z.infer<typeof divisionSchema>; 