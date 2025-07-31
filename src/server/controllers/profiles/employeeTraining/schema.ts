import { z } from "zod";

export const employeeTrainingSchema = z.object({
  employeeID: z.string(),
  trainingID: z.string(),
  passed: z.boolean().optional().default(false),
  passedDate: z.date().optional(),
}); 