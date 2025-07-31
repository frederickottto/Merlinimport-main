import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export const employeeProjectEmployeeRoleRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        projectId: z.string().optional(),
        employeeRoleId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Prisma.EmployeeProjectEmployeeRoleWhereInput = {};
      if (input?.employeeId) where.employeeID = input.employeeId;
      if (input?.projectId) where.employeeProjectActivitiesID = input.projectId;
      if (input?.employeeRoleId) where.employeeRoleID = input.employeeRoleId;
      const roles = await ctx.db.employeeProjectEmployeeRole.findMany({
        where,
        include: {
          employee: true,
          employeeRole: true,
          employeeProjectActivities: {
            include: {
              project: true
            }
          }
        },
      });
      return roles;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const role = await ctx.db.employeeProjectEmployeeRole.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
          employeeRole: true,
          employeeProjectActivities: {
            include: {
              project: true
            }
          }
        },
      });
      if (!role) {
        throw new TRPCError({
          message: "EmployeeProjectEmployeeRole not found",
          code: "NOT_FOUND",
        });
      }
      return role;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeID: z.string(),
          projectID: z.string(),
          employeeRoleID: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if employee exists
        const employee = await ctx.db.employee.findUnique({
          where: { id: input.data.employeeID },
        });
        if (!employee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee not found",
          });
        }
        // Check if project exists
        const project = await ctx.db.project.findUnique({
          where: { id: input.data.projectID },
        });
        if (!project) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Project not found",
          });
        }
        // Check if employeeRole exists
        const employeeRole = await ctx.db.employeeRole.findUnique({
          where: { id: input.data.employeeRoleID },
        });
        if (!employeeRole) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "EmployeeRole not found",
          });
        }
        return await ctx.db.employeeProjectEmployeeRole.create({
          data: {
            employeeID: input.data.employeeID,
            employeeRoleID: input.data.employeeRoleID,
            employeeProjectActivitiesID: input.data.projectID,
          },
          include: {
            employee: true,
            employeeRole: true,
            employeeProjectActivities: {
              include: {
                project: true
              }
            }
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create EmployeeProjectEmployeeRole: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create EmployeeProjectEmployeeRole",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeID: z.string().optional(),
          projectID: z.string().optional(),
          employeeRoleID: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.employeeProjectEmployeeRole.update({
          where: { id },
          data: {
            ...(data.employeeID && { employeeID: data.employeeID }),
            ...(data.employeeRoleID && { employeeRoleID: data.employeeRoleID }),
            ...(data.projectID && { employeeProjectActivitiesID: data.projectID }),
          },
          include: {
            employee: true,
            employeeRole: true,
            employeeProjectActivities: {
              include: {
                project: true
              }
            }
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update EmployeeProjectEmployeeRole: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update EmployeeProjectEmployeeRole",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.employeeProjectEmployeeRole.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 