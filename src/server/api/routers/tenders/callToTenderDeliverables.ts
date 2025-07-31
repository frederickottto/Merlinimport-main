import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const callToTenderDeliverablesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.callToTenderDeliverables.findMany({
      include: {
        callToTender: true,
        deliverables: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.callToTenderDeliverables.findUnique({
        where: { id: input.id },
        include: {
          callToTender: true,
          deliverables: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CallToTenderDeliverable not found",
        });
      }
      return item;
    }),

  getByTenderId: publicProcedure
    .input(z.object({ callToTenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const deliverables = await ctx.db.callToTenderDeliverables.findMany({
          where: { callToTenderIDs: input.callToTenderId },
          include: {
            callToTender: true,
            deliverables: true,
          },
          orderBy: { createdAt: "desc" },
        });
        return deliverables;
      } catch (error) {
        console.error('Error fetching call to tender deliverables:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch call to tender deliverables",
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        deliverablesIDs: z.string(),
        callToTenderIDs: z.string(),
        autoSelected: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.callToTenderDeliverables.create({
        data: {
          deliverables: {
            connect: { id: input.deliverablesIDs }
          },
          callToTender: {
            connect: { id: input.callToTenderIDs }
          },
          autoSelected: input.autoSelected ?? false,
        },
        include: {
          deliverables: {
            select: {
              id: true,
              title: true,
              type: true,
              description: true,
            }
          }
        }
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        callToTenderIDs: z.string().optional(),
        deliverablesIDs: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;

        // First check if the deliverable exists
        const existingDeliverable = await ctx.db.callToTenderDeliverables.findUnique({
          where: { id },
          include: {
            callToTender: true,
            deliverables: true,
          }
        });

        if (!existingDeliverable) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Call to tender deliverable not found",
          });
        }

        return await ctx.db.callToTenderDeliverables.update({
          where: { id },
          data,
          include: {
            callToTender: true,
            deliverables: true,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating call to tender deliverable:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to update call to tender deliverable",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the deliverable exists
        const existingDeliverable = await ctx.db.callToTenderDeliverables.findUnique({
          where: { id: input.id },
          include: {
            callToTender: true,
            deliverables: true,
          }
        });

        if (!existingDeliverable) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Call to tender deliverable not found",
          });
        }

        await ctx.db.callToTenderDeliverables.delete({
          where: { id: input.id },
        });
        
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting call to tender deliverable:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to delete call to tender deliverable",
        });
      }
    }),
}); 