import { z } from "zod";

export const trainingsSchema = z.object({
  id: z.string(), // Eindeutige ID
  createdAt: z.date().optional(), // Erstellungsdatum
  updatedAt: z.date().optional(), // Aktualisierungsdatum
  trainingTitle: z.string(), // Titel des Trainings
  trainingContent: z.string().optional(), // Inhalt des Trainings (optional)
  trainingType: z.string().optional(), // Typ des Trainings (optional)
  trainingTemplateID: z.string().optional(), // Vorlagen-ID (optional)
});

export type T_Trainings = z.infer<typeof trainingsSchema>; 