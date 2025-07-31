import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const employeeTrainingRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        trainingId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: {
        employeeID?: string;
        trainingID?: string;
      } = {};
      if (input?.employeeId) where.employeeID = input.employeeId;
      if (input?.trainingId) where.trainingID = input.trainingId;
      const employeeTrainings = await ctx.db.employeeTraining.findMany({
        where,
        include: {
          employee: true,
          training: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return employeeTrainings;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employeeTraining = await ctx.db.employeeTraining.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
          training: true,
        },
      });
      if (!employeeTraining) {
        throw new TRPCError({
          message: "EmployeeTraining not found",
          code: "NOT_FOUND",
        });
      }
      return employeeTraining;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeID: z.string(),
          trainingID: z.string(),
          passed: z.boolean().optional().default(false),
          passedDate: z.date().optional(),
          isTrainer: z.boolean().optional().default(false),
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
        // Check if training exists
        const training = await ctx.db.training.findUnique({
          where: { id: input.data.trainingID },
        });
        if (!training) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Training not found",
          });
        }
        // Check if this combination already exists
        const existing = await ctx.db.employeeTraining.findFirst({
          where: {
            employeeID: input.data.employeeID,
            trainingID: input.data.trainingID,
          },
        });
        if (existing) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This employee already has this training assigned",
          });
        }
        return await ctx.db.employeeTraining.create({
          data: input.data,
          include: {
            employee: true,
            training: true,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create employee training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee training",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeID: z.string().optional(),
          trainingID: z.string().optional(),
          passed: z.boolean().optional(),
          passedDate: z.date().optional(),
          isTrainer: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.employeeTraining.update({
          where: { id },
          data,
          include: {
            employee: true,
            training: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update employee training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee training",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.employeeTraining.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete employee training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employee training",
        });
      }
    }),
}); 