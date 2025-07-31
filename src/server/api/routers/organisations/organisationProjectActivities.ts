import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationProjectActivitiesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.organisationProjectActivities.findMany({
        include: {
          organisation: true,
          project: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch organisation project activities",
        cause: error,
      });
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const item = await ctx.db.organisationProjectActivities.findUnique({
          where: { id: input.id },
          include: {
            organisation: true,
            project: true,
          },
        });
        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "OrganisationProjectActivity not found",
          });
        }
        return item;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch organisation project activity",
          cause: error,
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        organisationIDs: z.string(),
        projectIDs: z.string(),
        role: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.organisationProjectActivities.create({
          data: {
            organisationIDs: input.organisationIDs,
            projectIDs: input.projectIDs,
            role: input.role,
            description: input.description,
          },
          include: {
            organisation: true,
            project: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create organisation project activity",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        organisationIDs: z.string().optional(),
        projectIDs: z.string().optional(),
        role: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await ctx.db.organisationProjectActivities.update({
          where: { id },
          data,
          include: {
            organisation: true,
            project: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organisation project activity",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the record exists
        const exists = await ctx.db.organisationProjectActivities.findUnique({
          where: { id: input.id },
        });

        if (!exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organisation project activity not found",
          });
        }

        // Then delete it
        await ctx.db.organisationProjectActivities.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organisation project activity",
          cause: error,
        });
      }
    }),
}); 