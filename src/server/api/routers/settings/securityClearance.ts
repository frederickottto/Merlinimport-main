import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const securityClearanceRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const securityClearances = await ctx.db.securityClearance.findMany({
      include: {
        employee: true,
      },
    });
    return securityClearances;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const securityClearance = await ctx.db.securityClearance.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
        },
      });

      if (!securityClearance) {
        throw new TRPCError({
          message: "Security clearance not found",
          code: "NOT_FOUND",
        });
      }

      return securityClearance;
    }),

  create: publicProcedure
    .input(
      z.object({
        employeeIDs: z.string(),
        approved: z.boolean().optional().default(false),
        securityClearanceType: z.string().optional(),
        securityClearanceLevel: z.string().optional(),
        applicationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const securityClearance = await ctx.db.securityClearance.create({
        data: {
          approved: input.approved,
          securityClearanceType: input.securityClearanceType,
          securityClearanceLevel: input.securityClearanceLevel,
          applicationDate: input.applicationDate,
          employee: {
            connect: { id: input.employeeIDs },
          },
        },
        include: {
          employee: true,
        },
      });
      return securityClearance;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        employeeIDs: z.string().optional(),
        approved: z.boolean().optional(),
        securityClearanceType: z.string().optional(),
        securityClearanceLevel: z.string().optional(),
        applicationDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, employeeIDs, ...data } = input;
      const securityClearance = await ctx.db.securityClearance.update({
        where: { id },
        data: {
          ...data,
          employee: employeeIDs ? {
            connect: { id: employeeIDs },
          } : undefined,
        },
        include: {
          employee: true,
        },
      });
      return securityClearance;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.securityClearance.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 