import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const employeeRoleRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.employeeRole.findMany({
      orderBy: { role: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.employeeRole.findUnique({
        where: { id: input.id },
      });

      if (!role) {
        throw new Error("Employee role not found");
      }

      return role;
    }),

  create: publicProcedure
    .input(
      z.object({
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.employeeRole.create({
        data: input,
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.employeeRole.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.employeeRole.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});
