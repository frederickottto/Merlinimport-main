import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";

export const lessonsLearnedRouter = createTRPCRouter({
  // Get all lessons learned
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.lessonsLearned.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        wonByOrganisation: true,
        tender: true,
      },
    });
  }),

  // Get lessons learned by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.lessonsLearned.findUnique({
        where: { id: input.id },
        include: {
          wonByOrganisation: true,
          tender: true,
        },
      });
    }),

  // Get lessons learned by tender ID
  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.lessonsLearned.findMany({
        where: {
          tenderId: input.tenderId,
        },
        include: {
          wonByOrganisation: true,
          tender: true,
        },
      });
    }),

  // Create new lessons learned
  create: publicProcedure
    .input(
      z.object({
        tenderId: z.string(),
        submissionDate: z.date().optional(),
        decisionDate: z.date().optional(),
        rejectionReasons: z.string().optional(),
        lessonsLearned: z.string(),
        wonByOrganisationId: z.string().optional(),
        wonByOrganisationName: z.string().optional(),
        relatedProfiles: z.array(z.string()).optional(),
        relatedTasks: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { wonByOrganisationId, ...rest } = input;
      return await ctx.db.lessonsLearned.create({
        data: {
          ...rest,
          wonByOrganisationId: wonByOrganisationId === "" ? null : wonByOrganisationId,
          relatedProfiles: input.relatedProfiles || [],
          relatedTasks: input.relatedTasks || [],
        },
        include: {
          wonByOrganisation: true,
          tender: true,
        },
      });
    }),

  // Update lessons learned
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        submissionDate: z.date().optional(),
        decisionDate: z.date().optional(),
        rejectionReasons: z.string().optional(),
        lessonsLearned: z.string().optional(),
        wonByOrganisationId: z.string().optional(),
        wonByOrganisationName: z.string().optional(),
        relatedProfiles: z.array(z.string()).optional(),
        relatedTasks: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.lessonsLearned.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          wonByOrganisation: true,
          tender: true,
        },
      });
    }),

  // Delete lessons learned
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.lessonsLearned.delete({
        where: { id: input.id },
      });
    }),
}); 