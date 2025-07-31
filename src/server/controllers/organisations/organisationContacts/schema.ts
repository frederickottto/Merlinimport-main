import { z } from "zod";

export const organisationContactsSchema = z.object({
  id: z.string(), // Eindeutige ID
  createdAt: z.date().optional(), // Erstellungsdatum
  updatedAt: z.date().optional(), // Aktualisierungsdatum
  foreName: z.string(), // Vorname
  lastName: z.string(), // Nachname
  email: z.string().email().optional(), // E-Mail-Adresse (optional, mit Validierung)
  mobile: z.string().optional(), // Mobile Telefonnummer (optional)
  telephone: z.string().optional(), // Festnetznummer (optional)
  position: z.string().optional(), // Position im Unternehmen
  department: z.string().optional(), // Abteilung
});

export type T_OrganisationContacts = z.infer<typeof organisationContactsSchema>;