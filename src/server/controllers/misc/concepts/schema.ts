import { z } from "zod";

export const conceptSchema = z.object({
  id: z.string(), // Eindeutige ID
  createdAt: z.date().optional(), // Erstellungsdatum
  updatedAt: z.date().optional(), // Aktualisierungsdatum
  title: z.string(), // Titel des Deliverables
  description: z.string(), // Beschreibung des Deliverables
  type: z.string(), // Typ des Deliverables
  status: z.string().optional(), // Status des Konzepts
  textMaturity: z.boolean().optional(), // Reifegrad des Textes (optional)
  wordCount: z.number().optional(), // Wortanzahl (optional)
  language: z.array(z.string()), // Sprachen als Array
  genderNeutral: z.boolean().optional(), // Gender-Neutralität (optional)
  professionalTone: z.boolean().optional(), // Professioneller Ton (optional)
  containsGraphics: z.boolean().optional(), // Enthält Grafiken (optional)
  keywords: z.array(z.string()).optional(), // Schlagworte (optional)
  notes: z.string().optional(), // Anmerkungen (optional)
  templateIDs: z.array(z.string()).optional(), // IDs der ausgewählten Templates
});

export type T_Concept = z.infer<typeof conceptSchema>;