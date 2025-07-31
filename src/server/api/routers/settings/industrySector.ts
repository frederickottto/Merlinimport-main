import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

import { z } from "zod";

export const industrySectorRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const sectors = await ctx.db.industrySector.findMany({
      orderBy: { industrySector: "asc" },
    });
    // Deduplicate by industrySector name
    const uniqueSectors = Array.from(
      new Map(sectors.map((item) => [item.industrySector, item])).values()
    );
    return uniqueSectors;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const sector = await ctx.db.industrySector.findUnique({
        where: { id: input.id },
      });

      if (!sector) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Industry sector not found",
        });
      }

      return sector;
    }),

  create: publicProcedure
    .input(
      z.object({
        industrySector: z.string().min(1, "Industry sector name is required"),
        industrySectorEY: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.industrySector.create({
          data: input,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error creating industry sector",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        industrySector: z
          .string()
          .min(1, "Industry sector name is required")
          .optional(),
        industrySectorEY: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await ctx.db.industrySector.update({
          where: { id },
          data,
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating industry sector",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.industrySector.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error deleting industry sector",
          cause: error,
        });
      }
    }),
});
