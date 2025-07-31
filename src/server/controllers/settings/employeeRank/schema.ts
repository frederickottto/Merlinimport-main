import { z } from "zod";

export const employeeRankSchema = z.object({
  id: z.string(),
  employeePositionShort: z.string().min(1, "Kurzbezeichnung ist erforderlich"),
  employeePositionLong: z.string().min(1, "Langbezeichnung ist erforderlich"),
  employeeCostStraight: z.number().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EmployeeRank = z.infer<typeof employeeRankSchema>;

export const createEmployeeRankSchema = employeeRankSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmployeeRankSchema = createEmployeeRankSchema.partial(); 