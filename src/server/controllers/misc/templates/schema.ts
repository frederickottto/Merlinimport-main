import { z } from "zod";

export const templatesSchema = z.object({
  id: z.string(), // Eindeutige ID
  createdAt: z.date().optional(), // Erstellungsdatum
  updatedAt: z.date().optional(), // Aktualisierungsdatum
  filePath: z.string(), // Dateipfad (falls sinnvoll)
  type: z.string(), // Typ des Templates
  title: z.string(), // Titel des Templates
  description: z.string().optional(), // Beschreibung des Templates (optional)
  keywords: z.array(z.string()).optional(), // Schlagworte (optional)
  notes: z.string().optional(), // Anmerkungen (optional)
  conceptIDs: z.array(z.string()).optional(), // Verknüpfte Konzepte (optional)
});

export type T_Templates = z.infer<typeof templatesSchema>;