import { z } from "zod";

export const employeeProjectEmployeeRoleSchema = z.object({
  employeeID: z.string(),
  projectID: z.string(),
  employeeRoleID: z.string(),
}); 