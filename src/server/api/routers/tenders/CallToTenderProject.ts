import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";


export const callToTenderProjectRouter = createTRPCRouter({
  getByTenderId: publicProcedure
    .input(z.object({ callToTenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.callToTenderProject.findMany({
        where: {
          callToTenderId: input.callToTenderId,
        },
        include: {
          project: true,
        },
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        projectId: z.string(),
        callToTenderId: z.string(),
        role: z.string().optional(),
        description: z.string().optional(),
        relevance: z.string().optional(),
        autoSelected: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.callToTenderProject.create({
        data: {
          project: {
            connect: { id: input.projectId }
          },
          callToTender: {
            connect: { id: input.callToTenderId }
          },
          role: input.role,
          description: input.description,
          relevance: input.relevance,
          autoSelected: input.autoSelected ?? false,
        },
        include: {
          project: {
            select: {
              id: true,
              title: true,
              type: true,
              description: true,
            }
          }
        }
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.string(),
      projectId: z.string().optional(),
      role: z.string().optional(),
      description: z.string().optional(),
      relevance: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.callToTenderProject.update({
        where: { id },
        data,
        include: {
          project: true,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.callToTenderProject.delete({
        where: { id: input.id },
      });
    }),
}); 