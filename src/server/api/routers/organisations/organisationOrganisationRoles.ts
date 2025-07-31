import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationOrganisationRolesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const roles = await ctx.db.organisationOrganisationRoles.findMany({
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
            }
          },
          organisationRole: {
            select: {
              id: true,
              role: true,
            }
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Filter out any entries where the relationships are null
      return roles.filter(role => 
        role.organisation && 
        role.organisationRole && 
        role.organisation.id && 
        role.organisationRole.id
      );
    } catch (error) {
      console.error("Error in organisationOrganisationRoles.getAll:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organisation roles",
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.organisationOrganisationRoles.findUnique({
        where: { id: input.id },
        include: {
          organisation: true,
          organisationRole: true,
        },
      });
      if (!item || !item.organisation || !item.organisationRole) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OrganisationOrganisationRole not found",
        });
      }
      return item;
    }),

  create: publicProcedure
    .input(
      z.object({
        organisationID: z.string(),
        organisationRoleID: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First verify both organisation and role exist
      const [organisation, role] = await Promise.all([
        ctx.db.organisation.findUnique({ where: { id: input.organisationID } }),
        ctx.db.organisationRole.findUnique({ where: { id: input.organisationRoleID } })
      ]);

      if (!organisation || !role) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: !organisation ? "Organisation not found" : "Organisation role not found",
        });
      }

      return await ctx.db.organisationOrganisationRoles.create({
        data: {
          organisationID: input.organisationID,
          organisationRoleID: input.organisationRoleID,
        },
        include: {
          organisation: true,
          organisationRole: true,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        organisationID: z.string().optional(),
        organisationRoleID: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verify the record exists
      const existing = await ctx.db.organisationOrganisationRoles.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OrganisationOrganisationRole not found",
        });
      }

      // If updating relationships, verify they exist
      if (data.organisationID) {
        const organisation = await ctx.db.organisation.findUnique({
          where: { id: data.organisationID }
        });
        if (!organisation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation not found",
          });
        }
      }

      if (data.organisationRoleID) {
        const role = await ctx.db.organisationRole.findUnique({
          where: { id: data.organisationRoleID }
        });
        if (!role) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation role not found",
          });
        }
      }

      return await ctx.db.organisationOrganisationRoles.update({
        where: { id },
        data,
        include: {
          organisation: true,
          organisationRole: true,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.organisationOrganisationRoles.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 