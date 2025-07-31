import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const voccationalRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const voccationals = await ctx.db.voccational.findMany({
        where: {
          ...(input?.employeeId && { employeeIDs: input.employeeId }),
        },
        include: {
          employee: true,
          industrySector: true,
        },
      });
      return voccationals;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const voccational = await ctx.db.voccational.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
          industrySector: true,
        },
      });

      if (!voccational) {
        throw new TRPCError({
          message: "Voccational not found",
          code: "NOT_FOUND",
        });
      }

      return voccational;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeIDs: z.string(),
          industrySectorIDs: z.string().optional(),
          voccationalTitleShort: z.string().optional(),
          voccationalTitleLong: z.string().optional(),
          voccationalMINT: z.boolean().optional(),
          company: z.string().optional(),
          voccationalStart: z.date().optional(),
          voccationalEnd: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.voccational.create({
          data: input.data,
          include: {
            employee: true,
            industrySector: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create voccational: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create voccational",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeIDs: z.string().optional(),
          industrySectorIDs: z.string().optional(),
          voccationalTitleShort: z.string().optional(),
          voccationalTitleLong: z.string().optional(),
          voccationalMINT: z.boolean().optional(),
          company: z.string().optional(),
          voccationalStart: z.date().optional(),
          voccationalEnd: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.voccational.update({
          where: { id },
          data: {
            employeeIDs: data.employeeIDs,
            industrySectorIDs: data.industrySectorIDs,
            voccationalTitleShort: data.voccationalTitleShort?.trim(),
            voccationalTitleLong: data.voccationalTitleLong?.trim(),
            voccationalMINT: data.voccationalMINT,
            company: data.company?.trim(),
            voccationalStart: data.voccationalStart,
            voccationalEnd: data.voccationalEnd,
          },
          include: {
            employee: true,
            industrySector: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update voccational: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update voccational",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.voccational.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete voccational: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete voccational",
        });
      }
    }),
}); 