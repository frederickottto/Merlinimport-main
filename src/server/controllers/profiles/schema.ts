import { z } from "zod";

export const profileSchema = z.object({
  id: z.string(),
  foreName: z.string(),
  lastName: z.string(),
  pseudonym: z.string().nullable(),
  employeerCompany: z.string(),
  contractStartDate: z.date().nullable(),
  mobile: z.string().nullable(),
  telephone: z.string().nullable(),
  linkedInURL: z.string().nullable(),
  xingURL: z.string().nullable(),
  discoverURL: z.string().nullable(),
  description: z.string().nullable(),
  experienceIt: z.number(),
  experienceIs: z.number(),
  experienceItGs: z.number(),
  experienceGps: z.number(),
  experienceOther: z.number(),
  experienceAll: z.number(),
  divisionId: z.string().nullable(),
  division: z.object({
    id: z.string(),
    title: z.string(),
    abbreviation: z.string().nullable(),
  }).nullable(),
  employeeRank: z.object({
    id: z.string(),
    employeePositionShort: z.string(),
    employeePositionLong: z.string(),
  }).nullable(),
  location: z.object({
    id: z.string(),
    street: z.string(),
    houseNumber: z.string(),
    postCode: z.string(),
    city: z.string(),
    region: z.string(),
    country: z.string(),
  }).nullable(),
  counselor: z.object({
    id: z.string(),
    foreName: z.string(),
    lastName: z.string(),
  }).nullable(),
  titles: z.array(z.object({
    id: z.string(),
    salutationShort: z.string(),
    salutationLong: z.string(),
  })),
});

export type Profile = z.infer<typeof profileSchema>;