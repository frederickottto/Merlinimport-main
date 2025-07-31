import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const academicDegreeRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const academicDegrees = await ctx.db.academicDegree.findMany({
        where: {
          ...(input?.employeeId && { employeeIDs: input.employeeId }),
        },
        include: {
          employee: true,
        },
      });
      return academicDegrees;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const academicDegree = await ctx.db.academicDegree.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
        },
      });

      if (!academicDegree) {
        throw new TRPCError({
          message: "Academic degree not found",
          code: "NOT_FOUND",
        });
      }

      return academicDegree;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeIDs: z.string(),
          degreeTitleShort: z.string().optional(),
          degreeTitleLong: z.string().optional(),
          completed: z.boolean().optional().default(true),
          study: z.string().optional(),
          studyStart: z.date().optional(),
          studyEnd: z.date().optional(),
          university: z.string().optional(),
          studyMINT: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.academicDegree.create({
          data: input.data,
          include: {
            employee: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create academic degree: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create academic degree",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeIDs: z.string().optional(),
          degreeTitleShort: z.string().optional(),
          degreeTitleLong: z.string().optional(),
          completed: z.boolean().optional(),
          study: z.string().optional(),
          studyStart: z.date().optional(),
          studyEnd: z.date().optional(),
          university: z.string().optional(),
          studyMINT: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.academicDegree.update({
          where: { id },
          data: {
            employeeIDs: data.employeeIDs,
            degreeTitleShort: data.degreeTitleShort?.trim(),
            degreeTitleLong: data.degreeTitleLong?.trim(),
            completed: data.completed,
            study: data.study?.trim(),
            studyStart: data.studyStart,
            studyEnd: data.studyEnd,
            university: data.university?.trim(),
            studyMINT: data.studyMINT,
          },
          include: {
            employee: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update academic degree: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update academic degree",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.academicDegree.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete academic degree: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete academic degree",
        });
      }
    }),
}); 