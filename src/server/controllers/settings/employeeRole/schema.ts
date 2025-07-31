import { z } from "zod";

export const employeeRoleSchema = z.object({
  id: z.string(),
  role: z.string().min(1, "Name is required"),

  createdAt: z.date(),
  updatedAt: z.date(),
});

export type EmployeeRole = z.infer<typeof employeeRoleSchema>;

export const createEmployeeRoleSchema = employeeRoleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateEmployeeRoleSchema = createEmployeeRoleSchema.partial(); 