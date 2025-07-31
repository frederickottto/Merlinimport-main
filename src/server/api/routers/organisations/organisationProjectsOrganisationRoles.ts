import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationProjectsOrganisationRolesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.organisationProjectsOrganisationRoles.findMany({
      include: {
        organisation: true,
        organisationRole: true,
        project: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.organisationProjectsOrganisationRoles.findUnique({
        where: { id: input.id },
        include: {
          organisation: true,
          organisationRole: true,
          project: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OrganisationProjectsOrganisationRole not found",
        });
      }
      return item;
    }),

  create: publicProcedure
    .input(
      z.object({
        organisationID: z.string(),
        organisationRoleID: z.string(),
        projectID: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.organisationProjectsOrganisationRoles.create({
        data: {
          organisationID: input.organisationID,
          organisationRoleID: input.organisationRoleID,
          projectID: input.projectID,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        organisationID: z.string().optional(),
        organisationRoleID: z.string().optional(),
        projectID: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.organisationProjectsOrganisationRoles.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.organisationProjectsOrganisationRoles.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 