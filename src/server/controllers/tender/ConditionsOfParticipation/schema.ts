import { z } from "zod";

export const conditionsOfParticipationSchema = z.object({
  id: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  title: z.string().nullable(),
  duration: z.number().nullable(),
  volumeEuro: z.number().nullable(),
  requirements: z.string().nullable(),
  experienceIt: z.number().nullable(),
  experienceIs: z.number().nullable(),
  experienceItGs: z.number().nullable(),
  experienceGPS: z.number().nullable(),
  experienceOther: z.number().nullable(),
  experienceAll: z.number().nullable(),
  executivePosition: z.boolean().nullable(),
  academicDegree: z.array(z.string()).nullable(),
  academicStudy: z.array(z.string()).nullable(),
  conditionsOfParticipationTypeIDs: z.string(),
  callToTenderIDs: z.string(),
  certificateIDs: z.array(z.string()).nullable(),
  customCertificates: z.array(z.string()).nullable(),
  industrySectorIDs: z.array(z.string()).nullable(),
  customIndustrySectors: z.array(z.string()).nullable(),
  criterionType: z.string().nullable(),
  searchQuery: z.string().nullable(),
});

export type ConditionsOfParticipation = z.infer<typeof conditionsOfParticipationSchema>;

export const createConditionsOfParticipationSchema = z.object({
  title: z.string().nullable(),
  duration: z.number().nullable(),
  volumeEuro: z.number().nullable(),
  requirements: z.string().nullable(),
  experienceIt: z.number().nullable(),
  experienceIs: z.number().nullable(),
  experienceItGs: z.number().nullable(),
  experienceGPS: z.number().nullable(),
  experienceOther: z.number().nullable(),
  experienceAll: z.number().nullable(),
  executivePosition: z.boolean().nullable(),
  academicDegree: z.array(z.string()).nullable(),
  academicStudy: z.array(z.string()).nullable(),
  conditionsOfParticipationTypeIDs: z.string(),
  callToTenderIDs: z.string(),
  certificateIDs: z.array(z.string()).nullable(),
  customCertificates: z.array(z.string()).nullable(),
  industrySectorIDs: z.array(z.string()).nullable(),
  customIndustrySectors: z.array(z.string()).nullable(),
  criterionType: z.string().nullable(),
  searchQuery: z.string().nullable(),
});

export const updateConditionsOfParticipationSchema = createConditionsOfParticipationSchema.partial(); 