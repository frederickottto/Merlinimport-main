import { z } from "zod";

export const academicDegreeSchema = z.object({
  employeeIDs: z.string(),
  degreeTitleShort: z.string().optional(),
  degreeTitleLong: z.string().optional(),
  completed: z.boolean().optional().default(true),
  study: z.string().optional(),
  studyStart: z.date().optional(),
  studyEnd: z.date().optional(),
  university: z.string().optional(),
  studyMINT: z.boolean().optional(),
}); 