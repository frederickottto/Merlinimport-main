import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const riskQualityProcessRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.riskQualityProcess.findMany({
      include: {
        callToTender: true,
        organisation: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.riskQualityProcess.findUnique({
        where: { id: input.id },
        include: {
          callToTender: true,
          organisation: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "RiskQualityProcess not found",
        });
      }
      return item;
    }),

  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const processes = await ctx.db.riskQualityProcess.findMany({
          where: { callToTenderID: input.tenderId },
          include: {
            organisation: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                legalType: true,
              }
            }
          },
          orderBy: { createdAt: "desc" },
        });
        return processes;
      } catch (error) {
        console.error('Error fetching risk quality processes:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch risk quality processes",
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        type: z.string(),
        status: z.string(),
        note: z.string().optional(),
        callToTenderID: z.string(),
        organisationID: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const baseData = {
          type: input.type,
          status: input.status,
          note: input.note,
          callToTenderID: input.callToTenderID,
        };

        const data = input.organisationID 
          ? { ...baseData, organisationID: input.organisationID }
          : baseData;
        
        return await ctx.db.riskQualityProcess.create({
          data: data as Prisma.RiskQualityProcessUncheckedCreateInput,
          include: {
            callToTender: true,
            organisation: true,
          },
        });
      } catch (error) {
        console.error('Error creating risk quality process:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to create risk quality process",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.string().optional(),
        status: z.string().optional(),
        note: z.string().optional(),
        callToTenderID: z.string().optional(),
        organisationID: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        
        // First check if the process exists
        const existingProcess = await ctx.db.riskQualityProcess.findUnique({
          where: { id },
          include: {
            callToTender: true,
            organisation: true,
          }
        });

        if (!existingProcess) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Risk quality process not found",
          });
        }

        return await ctx.db.riskQualityProcess.update({
          where: { id },
          data,
          include: {
            callToTender: true,
            organisation: true,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error updating risk quality process:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to update risk quality process",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the process exists
        const existingProcess = await ctx.db.riskQualityProcess.findUnique({
          where: { id: input.id },
          include: {
            callToTender: true,
            organisation: true,
          }
        });

        if (!existingProcess) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Risk quality process not found",
          });
        }

        await ctx.db.riskQualityProcess.delete({
          where: { id: input.id },
        });
        
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Error deleting risk quality process:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to delete risk quality process",
        });
      }
    }),
}); 