import { z } from "zod";

export const employeeSkillsSchema = z.object({
  niveau: z.string().optional(),
  employeeIDs: z.array(z.string()),
  skillIDs: z.string(),
}); 