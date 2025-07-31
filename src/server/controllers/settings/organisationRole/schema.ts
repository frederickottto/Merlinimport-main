import { z } from "zod";

export const organisationRoleSchema = z.object({
  id: z.string(),
  role: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type OrganisationRole = z.infer<typeof organisationRoleSchema>;

export const createOrganisationRoleSchema = z.object({
  role: z.string().min(1, "Rolle ist erforderlich"),
});

export type CreateOrganisationRoleInput = z.infer<typeof createOrganisationRoleSchema>; 