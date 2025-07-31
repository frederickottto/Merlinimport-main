import { z } from "zod";

export const organisationsSchema = z.object({
  id: z.string(), // Eindeutige ID
  createdAt: z.date().optional(), // Erstellungsdatum
  updatedAt: z.date().optional(), // Aktualisierungsdatum
  name: z.string(), // Name der Organisation, eindeutig
  abbreviation: z.string().optional(), // Abkürzung
  anonymousIdentifier: z.string().optional(), // Anonymer Bezeichner
  employeeNumber: z.coerce.number().optional(), // Anzahl der Mitarbeiter
  anualReturn: z.coerce.number().optional(), // Jahresumsatz
  website: z.string().optional(), // Website-URL
  legalType: z.string().optional(), // Rechtlicher Typ (z. B. GmbH, AG)
});

export type T_Organisation = z.infer<typeof organisationsSchema>;