import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignedToId: z.string().optional(),
  tenderId: z.string(),
  createdById: z.string().optional(),
  dueDate: z.date().optional().nullable(),
});

export const tasksRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        assignedToId: z.string().optional(),
        tenderId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.db.task.findMany({
        where: {
          ...(input.assignedToId && input.assignedToId !== "current" && { assignedToId: input.assignedToId }),
          ...(input.tenderId && { tenderId: input.tenderId }),
        },
        include: {
          assignedTo: true,
          createdBy: true,
          tender: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return tasks;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          assignedTo: true,
          createdBy: true,
          tender: true,
        },
      });
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      }
      return task;
    }),

  create: publicProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.create({
        data: {
          ...input,
          // Use provided createdById or a placeholder since auth is disabled
          createdById: input.createdById || "system",
        },
        include: {
          assignedTo: true,
          createdBy: true,
          tender: true,
        },
      });
      return task;
    }),

  update: publicProcedure
    .input(taskSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Task ID is required for update",
        });
      }

      const { id, ...data } = input;
      const task = await ctx.db.task.update({
        where: { id },
        data,
        include: {
          assignedTo: true,
          createdBy: true,
          tender: true,
        },
      });
      return task;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.task.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 