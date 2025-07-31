import { z } from "zod";

export const lotSchema = z.object({
  id: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  lotIdentifier: z.string().nullable(),
  status: z.string().nullable(),
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().nullable(),
  volumePT: z.number().nullable(),
  parentLotID: z.string().nullable(),
  callToTenderID: z.string(),
});

export const createLotSchema = z.object({
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().optional(),
  volumePT: z.number().optional(),
  parentLotID: z.string().nullable(),
  callToTenderID: z.string(),
});

export const updateLotSchema = z.object({
  id: z.string(),
  number: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string(),
  volumeEuro: z.number().nullable(),
  volumePT: z.number().nullable(),
  parentLotID: z.string().nullable(),
});

export type Lot = z.infer<typeof lotSchema>;
export type CreateLot = z.infer<typeof createLotSchema>;
export type UpdateLot = z.infer<typeof updateLotSchema>; 