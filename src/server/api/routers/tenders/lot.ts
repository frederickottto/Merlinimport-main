import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createLotSchema, updateLotSchema } from "@/server/controllers/tender/lot/schema";

export const lotRouter = createTRPCRouter({
  create: publicProcedure
    .input(createLotSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const lot = await ctx.db.lot.create({
          data: input,
        });
        return lot;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create lot",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(updateLotSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        const lot = await ctx.db.lot.update({
          where: { id },
          data,
        });
        return lot;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update lot",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First get the lot with its child lots and their workpackages
        const lot = await ctx.db.lot.findUnique({
          where: { id: input.id },
          include: {
            childLots: {
              include: {
                workpackages: true
              }
            },
            workpackages: true,
          },
        });

        if (!lot) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lot not found",
          });
        }

        // Delete workpackages for all child lots first
        for (const childLot of lot.childLots) {
          if (childLot.workpackages.length > 0) {
            await ctx.db.workpackage.deleteMany({
              where: { lotID: childLot.id },
            });
          }
        }

        // Delete workpackages for the parent lot
        if (lot.workpackages.length > 0) {
          await ctx.db.workpackage.deleteMany({
            where: { lotID: input.id },
          });
        }

        // Delete all child lots
        if (lot.childLots.length > 0) {
          for (const childLot of lot.childLots) {
            await ctx.db.lot.delete({
              where: { id: childLot.id },
            });
          }
        }

        // Finally delete the lot itself
        const deletedLot = await ctx.db.lot.delete({
          where: { id: input.id },
        });

        return deletedLot;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete lot",
          cause: error,
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const lot = await ctx.db.lot.findUnique({
          where: { id: input.id },
          include: {
            childLots: true,
            workpackages: true,
          },
        });
        if (!lot) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lot not found",
          });
        }
        return lot;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get lot",
          cause: error,
        });
      }
    }),

  getByCallToTenderId: publicProcedure
    .input(z.object({ callToTenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const lots = await ctx.db.lot.findMany({
          where: { callToTenderID: input.callToTenderId },
          include: {
            childLots: true,
            workpackages: true,
          },
        });
        return lots;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get lots",
          cause: error,
        });
      }
    }),
}); 