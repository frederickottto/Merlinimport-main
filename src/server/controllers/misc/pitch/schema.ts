import { z } from "zod";

export const pitchModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  templateVariables: z.record(z.string()).optional(),
});

export type PitchModule = z.infer<typeof pitchModuleSchema> & {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}; 