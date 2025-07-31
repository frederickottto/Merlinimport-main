import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const professionalBackgroundRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        industrySectorId: z.string().optional(),
        q: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      console.log("ProfessionalBackground.getAll input:", input);
      
      if (!input.employeeId) {
        console.log("No employeeId provided, returning empty array");
        return [];
      }

      try {
        const results = await ctx.db.professionalBackground.findMany({
          where: {
            employeeIDs: input.employeeId,
            industrySectorIDs: input.industrySectorId,
            position: input.q ? { contains: input.q, mode: "insensitive" } : undefined,
          },
          include: {
            employee: true,
            industrySector: true,
            employeeExternalProjects: true,
          },
          orderBy: {
            position: "asc",
          },
        });
        console.log("ProfessionalBackground.getAll results:", results);
        return results;
      } catch (error) {
        console.error("Error in ProfessionalBackground.getAll:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch professional backgrounds",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const item = await ctx.db.professionalBackground.findUnique({
          where: { id: input.id },
          include: {
            employee: true,
            industrySector: true,
            employeeExternalProjects: true,
          },
        });

        if (!item) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Professional background not found",
          });
        }

        return item;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch professional background",
          cause: error,
        });
      }
    }),

  create: publicProcedure
    .input(
      z.object({
        employeeIDs: z.string(),
        industrySectorIDs: z.string().optional(),
        position: z.string().optional(),
        executivePosition: z.boolean().optional().default(false),
        employer: z.string().optional(),
        description: z.string().optional(),
        professionStart: z.date().optional(),
        professionEnd: z.date().optional(),
        experienceIt: z.number().int().optional().default(0),
        experienceIs: z.number().int().optional().default(0),
        experienceItGs: z.number().int().optional().default(0),
        experienceGps: z.number().int().optional().default(0),
        experienceOther: z.number().int().optional().default(0),
        experienceAll: z.number().int().optional().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.professionalBackground.create({
          data: input,
          include: {
            employee: true,
            industrySector: true,
            employeeExternalProjects: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create professional background",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        employeeIDs: z.string().optional(),
        industrySectorIDs: z.string().optional(),
        position: z.string().optional(),
        executivePosition: z.boolean().optional(),
        employer: z.string().optional(),
        description: z.string().optional(),
        professionStart: z.date().optional(),
        professionEnd: z.date().optional(),
        experienceIt: z.number().int().optional(),
        experienceIs: z.number().int().optional(),
        experienceItGs: z.number().int().optional(),
        experienceGps: z.number().int().optional(),
        experienceOther: z.number().int().optional(),
        experienceAll: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;
        return await ctx.db.professionalBackground.update({
          where: { id },
          data,
          include: {
            employee: true,
            industrySector: true,
            employeeExternalProjects: true,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update professional background",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the record exists
        const exists = await ctx.db.professionalBackground.findUnique({
          where: { id: input.id },
        });

        if (!exists) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Professional background not found",
          });
        }

        // Then delete it
        await ctx.db.professionalBackground.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete professional background",
          cause: error,
        });
      }
    }),
}); 