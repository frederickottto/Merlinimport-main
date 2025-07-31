import { z } from "zod";

export const industrySectorSchema = z.object({
  id: z.string(),
  industrySector: z.string().min(1, "Industry sector is required"),
  industrySectorEY: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type IndustrySector = z.infer<typeof industrySectorSchema>;

export const createIndustrySectorSchema = industrySectorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateIndustrySectorSchema = createIndustrySectorSchema.partial(); 