import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const skillRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const skills = await ctx.db.skills.findMany({
      include: {
        employeeSkills: true,
      },
    });
    return skills;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const skill = await ctx.db.skills.findUnique({
        where: { id: input.id },
        include: {
          employeeSkills: true,
        },
      });

      if (!skill) {
        throw new TRPCError({
          message: "Skill not found",
          code: "NOT_FOUND",
        });
      }

      return skill;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const skill = await ctx.db.skills.create({
        data: {
          title: input.title,
          type: input.type,
          description: input.description,
        },
        include: {
          employeeSkills: true,
        },
      });
      return skill;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        type: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const skill = await ctx.db.skills.update({
        where: { id },
        data: {
          title: data.title,
          type: data.type,
          description: data.description,
        },
        include: {
          employeeSkills: true,
        },
      });
      return skill;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.skills.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 