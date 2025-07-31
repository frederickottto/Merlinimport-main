import { z } from "zod";

export const certificateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  deeplink: z.string().optional(),
  category: z.enum([
    "Projektmanagement",
    "Cloud",
    "Security",
    "Datenschutz",
    "Architektur",
    "Entwicklung",
    "DevOps",
    "Agile",
    "Sonstiges"
  ]).optional(),
  salesCertificate: z.boolean().optional().default(false),
  conditionsOfParticipationIDs: z.array(z.string()).optional(),
});

export type Certificate = z.infer<typeof certificateSchema>;

export const createCertificateSchema = certificateSchema.omit({
  id: true,
});

export const updateCertificateSchema = createCertificateSchema.partial(); 