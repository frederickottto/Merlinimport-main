import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const employeeRankRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.employeeRank.findMany({
      orderBy: { employeePositionShort: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const rank = await ctx.db.employeeRank.findUnique({
        where: { id: input.id },
      });

      if (!rank) {
        throw new Error("Employee rank not found");
      }

      return rank;
    }),

  create: publicProcedure
    .input(
      z.object({
        employeePositionShort: z.string(),
        employeePositionLong: z.string(),
        employeeCostStraight: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.employeeRank.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        employeePositionShort: z.string().optional(),
        employeePositionLong: z.string().optional(),
        employeeCostStraight: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.employeeRank.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.employeeRank.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
