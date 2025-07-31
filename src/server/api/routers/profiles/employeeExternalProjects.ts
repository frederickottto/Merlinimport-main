import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const employeeExternalProjectsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({
        employeeId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { employeeId } = input;

      const items = await ctx.db.employeeExternalProjects.findMany({
        where: {
          employeeIDs: employeeId,
        },
        include: {
          employee: true,
          professionalBackground: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return items;
    }),

  getById: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const item = await ctx.db.employeeExternalProjects.findUnique({
        where: {
          id,
        },
        include: {
          employee: true,
          professionalBackground: true,
        },
      });

      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "EmployeeExternalProject not found",
        });
      }

      return item;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeDisplayName: z.string(),
          employeeIDs: z.string(),
          professionalBackgroundIDs: z.string(),
          employeeProjectRole: z.string().optional(),
          projectTitle: z.string(),
          description: z.string(),
          projectStart: z.date(),
          projectEnd: z.date(),
          operationalDays: z.number().min(0).default(0),
          keywords: z.array(z.string()).default([]),
          experienceIt: z.boolean().default(false),
          experienceIs: z.boolean().default(false),
          experienceItGs: z.boolean().default(false),
          experienceGps: z.boolean().default(false),
          experienceOther: z.boolean().default(false),
          clientName: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ...createData } = input.data;
      
      // Verify that the professional background exists and belongs to the employee
      const professionalBackground = await ctx.db.professionalBackground.findFirst({
        where: {
          id: createData.professionalBackgroundIDs,
          employeeIDs: createData.employeeIDs,
        },
      });

      if (!professionalBackground) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid professional background for this employee",
        });
      }
      
      const item = await ctx.db.employeeExternalProjects.create({
        data: createData,
        include: {
          employee: true,
          professionalBackground: true,
        },
      });

      return item;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          professionalBackgroundIDs: z.string().optional(),
          employeeProjectRole: z.string().optional(),
          projectTitle: z.string().optional(),
          description: z.string().optional(),
          projectStart: z.date().optional(),
          projectEnd: z.date().optional(),
          operationalDays: z.number().min(0).default(0).optional(),
          keywords: z.array(z.string()).default([]).optional(),
          experienceIt: z.boolean().default(false).optional(),
          experienceIs: z.boolean().default(false).optional(),
          experienceItGs: z.boolean().default(false).optional(),
          experienceGps: z.boolean().default(false).optional(),
          experienceOther: z.boolean().default(false).optional(),
          clientName: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // If professionalBackgroundIDs is being updated, verify it exists
      if (data.professionalBackgroundIDs) {
        const existingProject = await ctx.db.employeeExternalProjects.findUnique({
          where: { id },
          select: { employeeIDs: true },
        });

        if (!existingProject) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "EmployeeExternalProject not found",
          });
        }

        const professionalBackground = await ctx.db.professionalBackground.findFirst({
          where: {
            id: data.professionalBackgroundIDs,
            employeeIDs: existingProject.employeeIDs,
          },
        });

        if (!professionalBackground) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid professional background for this employee",
          });
        }
      }

      const item = await ctx.db.employeeExternalProjects.update({
        where: {
          id,
        },
        data,
        include: {
          employee: true,
          professionalBackground: true,
        },
      });

      return item;
    }),

  delete: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.db.employeeExternalProjects.delete({
        where: {
          id,
        },
      });

      return { success: true };
    }),
}); 