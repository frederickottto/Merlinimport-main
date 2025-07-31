import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const salutationRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.salutation.findMany({
      orderBy: { salutationShort: "asc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const salutation = await ctx.db.salutation.findUnique({
        where: { id: input.id },
      });

      if (!salutation) {
        throw new TRPCError({
          message: "Salutation not found",
          code: "NOT_FOUND",
        });
      }

      return salutation;
    }),

  create: publicProcedure
    .input(
      z.object({
        salutationShort: z.string(),
        salutationLong: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const salutation = await ctx.db.salutation.create({
        data: input,
      });
      return salutation;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        salutationShort: z.string().optional(),
        salutationLong: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const salutation = await ctx.db.salutation.update({
        where: { id },
        data,
      });
      return salutation;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.salutation.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 