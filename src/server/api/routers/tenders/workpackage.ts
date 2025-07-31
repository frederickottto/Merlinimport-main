import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { createWorkpackageSchema, updateWorkpackageSchema } from "@/server/controllers/tender/workpackage/schema";

export const workpackageRouter = createTRPCRouter({
  create: publicProcedure
    .input(createWorkpackageSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const workpackage = await ctx.db.workpackage.create({
          data: input,
        });
        return workpackage;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create workpackage",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(updateWorkpackageSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        const workpackage = await ctx.db.workpackage.update({
          where: { id },
          data,
        });
        return workpackage;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update workpackage",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const workpackage = await ctx.db.workpackage.delete({
          where: { id: input.id },
        });
        return workpackage;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete workpackage",
          cause: error,
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workpackage = await ctx.db.workpackage.findUnique({
          where: { id: input.id },
        });
        if (!workpackage) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Workpackage not found",
          });
        }
        return workpackage;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workpackage",
          cause: error,
        });
      }
    }),

  getByLotId: publicProcedure
    .input(z.object({ lotId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const workpackages = await ctx.db.workpackage.findMany({
          where: { lotID: input.lotId },
        });
        return workpackages;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get workpackages",
          cause: error,
        });
      }
    }),
}); 