import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const employeeSkillsRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        skillId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const employeeSkills = await ctx.db.employeeSkills.findMany({
        where: {
          ...(input?.employeeId && { employeeIDs: { has: input.employeeId } }),
          ...(input?.skillId && { skillIDs: input.skillId }),
        },
        include: {
          employees: true,
          skills: true,
        },
      });
      return employeeSkills;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employeeSkill = await ctx.db.employeeSkills.findUnique({
        where: { id: input.id },
        include: {
          employees: true,
          skills: true,
        },
      });

      if (!employeeSkill) {
        throw new TRPCError({
          message: "Employee skill not found",
          code: "NOT_FOUND",
        });
      }

      return employeeSkill;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          niveau: z.string().optional(),
          employeeIDs: z.array(z.string()),
          skillIDs: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.employeeSkills.create({
          data: {
            niveau: input.data.niveau?.trim(),
            employeeIDs: input.data.employeeIDs,
            skillIDs: input.data.skillIDs,
          },
          include: {
            employees: true,
            skills: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create employee skill: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee skill",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          niveau: z.string().optional(),
          employeeIDs: z.array(z.string()).optional(),
          skillIDs: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.employeeSkills.update({
          where: { id },
          data: {
            niveau: data.niveau?.trim(),
            ...(data.employeeIDs && { employeeIDs: data.employeeIDs }),
            ...(data.skillIDs && { skillIDs: data.skillIDs }),
          },
          include: {
            employees: true,
            skills: true,
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update employee skill: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee skill",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.employeeSkills.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete employee skill: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employee skill",
        });
      }
    }),
}); 