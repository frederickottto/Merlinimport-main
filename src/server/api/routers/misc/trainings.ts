import { createTRPCRouter, publicProcedure } from "../../trpc"; 
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const trainingRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        // Optionally filter by teacher or other fields if needed
        // teacherId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx }) => {
      const trainings = await ctx.db.training.findMany({
        // where: {
        //   ...(input?.teacherId && { teacherIDs: input.teacherId }),
        // },
        include: {
          employeeTrainings: true,
          trainingTemplate: true,
        },
      });
      return trainings;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const training = await ctx.db.training.findUnique({
        where: { id: input.id },
        include: {
          employeeTrainings: true,
        },
      });

      if (!training) {
        throw new TRPCError({
          message: "Training not found",
          code: "NOT_FOUND",
        });
      }

      return training;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          trainingTitle: z.string(),
          trainingContent: z.string().optional(),
          trainingDate: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.training.create({
          data: input.data,
          include: {
            employeeTrainings: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create training",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          trainingTitle: z.string().optional(),
          trainingContent: z.string().optional(),
          trainingDate: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.training.update({
          where: { id },
          data: {
            trainingTitle: data.trainingTitle?.trim(),
            trainingContent: data.trainingContent?.trim(),
            trainingDate: data.trainingDate,
          },
          include: {
            employeeTrainings: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update training",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.training.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete training: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete training",
        });
      }
    }),
}); 