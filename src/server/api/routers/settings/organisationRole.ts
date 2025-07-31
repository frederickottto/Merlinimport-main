import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationRoleRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.organisationRole.findMany({
      orderBy: { role: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.organisationRole.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organisationsrolle nicht gefunden",
        });
      }

      return role;
    }),

  create: publicProcedure
    .input(
      z.object({
        role: z.string().min(1, "Rolle ist erforderlich"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.organisationRole.create({
        data: {
          role: input.role,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string().min(1, "Rolle ist erforderlich"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.organisationRole.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // First, delete related OrganisationProjectsOrganisationRoles
      await ctx.db.organisationProjectsOrganisationRoles.deleteMany({
        where: { organisationRoleID: input.id },
      });

      // Then, delete related OrganisationOrganisationRoles
      await ctx.db.organisationOrganisationRoles.deleteMany({
        where: { organisationRoleID: input.id },
      });

      // Finally, delete the OrganisationRole
      await ctx.db.organisationRole.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
}); 