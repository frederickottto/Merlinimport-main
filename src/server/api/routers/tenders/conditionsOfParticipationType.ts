import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createConditionsOfParticipationTypeSchema, updateConditionsOfParticipationTypeSchema } from "@/server/controllers/tender/conditionsOfParticipationType/schema";

export const conditionsOfParticipationTypeRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.conditionsOfParticipationType.findMany({
      include: {
        parentType: true,
        childType: true,
        ConditionsOfParticipation: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.conditionsOfParticipationType.findMany({
          where: {
            callToTenderIDs: input.tenderId
          },
          include: {
            parentType: true,
            childType: true,
            ConditionsOfParticipation: true,
          },
          orderBy: { createdAt: "desc" },
        });
      } catch (error) {
        console.error('Error in getByTenderId:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch conditions of participation types',
          cause: error,
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.conditionsOfParticipationType.findUnique({
        where: { id: input.id },
        include: {
          parentType: true,
          childType: true,
          ConditionsOfParticipation: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Condition of Participation Type not found",
        });
      }
      return item;
    }),

  create: publicProcedure
    .input(createConditionsOfParticipationTypeSchema)
    .mutation(async ({ ctx, input }) => {
      // Convert "none" to null for parentTypeIDs
      const parentTypeIDs = input.parentTypeIDs === "none" ? null : input.parentTypeIDs;

      return await ctx.db.conditionsOfParticipationType.create({
        data: {
          title: input.title,
          description: input.description,
          callToTender: {
            connect: {
              id: input.callToTenderIDs
            }
          },
          parentType: parentTypeIDs ? {
            connect: {
              id: parentTypeIDs
            }
          } : undefined
        }
      });
    }),

  update: publicProcedure
    .input(updateConditionsOfParticipationTypeSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      // Convert "none" to null for parentTypeIDs
      if (data.parentTypeIDs === "none") {
        data.parentTypeIDs = null;
      }

      return await ctx.db.conditionsOfParticipationType.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if there are any child types or conditions using this type
      const type = await ctx.db.conditionsOfParticipationType.findUnique({
        where: { id: input.id },
        include: {
          childType: true,
          ConditionsOfParticipation: true,
        },
      });

      if (!type) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Condition of Participation Type not found",
        });
      }

      if (type.childType.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete type with child types",
        });
      }

      if (type.ConditionsOfParticipation.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete type with associated conditions",
        });
      }

      await ctx.db.conditionsOfParticipationType.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 