import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const employeeProjectActivitiesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ 
      employeeId: z.string().optional(),
      projectId: z.string().optional()
    }).optional())
    .query(async ({ ctx, input }) => {
      const where: { employeeIDs?: string; projectIDs?: string } = {};
      if (input?.employeeId) where.employeeIDs = input.employeeId;
      if (input?.projectId) where.projectIDs = input.projectId;
      
      const activities = await ctx.db.employeeProjectActivities.findMany({
        where,
        include: {
          employee: true,
          project: true,
          employeeProjectEmployeeRoles: {
            include: {
              employeeRole: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      // Map to include employeeRole as object (use first join entry)
      return activities.map(activity => ({
        ...activity,
        employeeRole: activity.employeeProjectEmployeeRoles?.[0]?.employeeRole
          ? {
              id: activity.employeeProjectEmployeeRoles[0].employeeRole.id,
              employeeRoleShort: activity.employeeProjectEmployeeRoles[0].employeeRole.role,
            }
          : null,
      }));
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.employeeProjectActivities.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
          project: true,
          employeeProjectEmployeeRoles: {
            include: {
              employeeRole: true,
            },
          },
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "EmployeeProjectActivity not found",
        });
      }
      return {
        ...item,
        employeeRole: item.employeeProjectEmployeeRoles?.[0]?.employeeRole
          ? {
              id: item.employeeProjectEmployeeRoles[0].employeeRole.id,
              employeeRoleShort: item.employeeProjectEmployeeRoles[0].employeeRole.role,
            }
          : null,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeIDs: z.string(),
          projectIDs: z.string(),
          employeeRoleID: z.string(),
          description: z.string(),
          operationalPeriodStart: z.date(),
          operationalPeriodEnd: z.date(),
          operationalDays: z.number().min(0).default(0),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { 
        employeeIDs,
        projectIDs,
        employeeRoleID,
        description,
        operationalPeriodStart,
        operationalPeriodEnd,
        operationalDays,
      } = input.data;
      // Create the activity
      const activity = await ctx.db.employeeProjectActivities.create({
        data: {
          employeeIDs,
          projectIDs,
          description,
          operationalPeriodStart,
          operationalPeriodEnd,
          operationalDays,
        },
      });
      // Create the join entry
      await ctx.db.employeeProjectEmployeeRole.create({
        data: {
          employeeID: employeeIDs,
          employeeRoleID,
          employeeProjectActivitiesID: activity.id,
        },
      });
      return activity;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeIDs: z.string().optional(),
          projectIDs: z.string().optional(),
          employeeRoleID: z.string().optional(),
          description: z.string().optional(),
          operationalPeriodStart: z.date().optional(),
          operationalPeriodEnd: z.date().optional(),
          operationalDays: z.number().min(0).default(0).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const { employeeIDs, projectIDs, employeeRoleID, ...updateData } = data;

      // Update the activity
      const activity = await ctx.db.employeeProjectActivities.update({
        where: { id },
        data: {
          ...updateData,
          employee: employeeIDs ? {
            connect: { id: employeeIDs }
          } : undefined,
          project: projectIDs ? {
            connect: { id: projectIDs }
          } : undefined,
        },
        include: {
          employee: true,
          project: true,
        },
      });

      // Update the join entry if role is provided
      if (employeeRoleID) {
        await ctx.db.employeeProjectEmployeeRole.updateMany({
          where: { employeeProjectActivitiesID: id },
          data: { employeeRoleID },
        });
      }

      return activity;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Delete the join entry first
      await ctx.db.employeeProjectEmployeeRole.deleteMany({
        where: { employeeProjectActivitiesID: input.id },
      });
      await ctx.db.employeeProjectActivities.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 