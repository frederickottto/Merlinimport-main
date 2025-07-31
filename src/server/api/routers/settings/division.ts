import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const divisionRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    try {
      const divisions = await ctx.db.division.findMany({
        orderBy: { title: "asc" },
        include: {
          managedBy: true,
          parentDivision: true,
          subDivisions: true,
          employees: true,
        },
      });
      return divisions;
    } catch (error) {
      console.error("Error fetching divisions:", error);
      return [];
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const division = await ctx.db.division.findUnique({
        where: { id: input.id },
        include: {
          managedBy: true,
          parentDivision: true,
          subDivisions: true,
          employees: true,
        },
      });

      if (!division) {
        throw new Error("Division not found");
      }

      return division;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        abbreviation: z.string().optional(),
        managedById: z.string().optional(),
        parentDivisionId: z.string().optional().nullable(),
        employeeIDs: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Ensure we have a valid database connection
        if (!ctx.db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection is not available",
          });
        }

        // If parentDivisionId is provided, verify it exists
        if (input.parentDivisionId) {
          const parentDivision = await ctx.db.division.findUnique({
            where: { id: input.parentDivisionId },
          });

          if (!parentDivision) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Parent division not found",
            });
          }
        }

        // Create the division using the context's db instance
        const division = await ctx.db.division.create({
          data: {
            title: input.title,
            abbreviation: input.abbreviation,
            managedById: input.managedById,
            parentDivisionId: input.parentDivisionId || null,
            employees: input.employeeIDs ? {
              connect: input.employeeIDs.map(id => ({ id }))
            } : undefined,
          },
          include: {
            managedBy: true,
            parentDivision: true,
            subDivisions: true,
            employees: true,
          },
        });

        return division;
      } catch (error) {
        console.error("Error creating division:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create division",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        abbreviation: z.string().optional(),
        managedById: z.string().optional(),
        parentDivisionId: z.string().optional().nullable(),
        employeeIDs: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // If parentDivisionId is provided, verify it exists
      if (data.parentDivisionId) {
        const parentDivision = await ctx.db.division.findUnique({
          where: { id: data.parentDivisionId },
        });

        if (!parentDivision) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Parent division not found",
          });
        }
      }

      return await ctx.db.division.update({
        where: { id },
        data: {
          ...data,
          parentDivisionId: data.parentDivisionId || null,
          employees: data.employeeIDs ? {
            set: data.employeeIDs.map(id => ({ id }))
          } : undefined,
        },
        include: {
          managedBy: true,
          parentDivision: true,
          subDivisions: true,
          employees: true,
        },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if division has sub-divisions
      const division = await ctx.db.division.findUnique({
        where: { id: input.id },
        include: { subDivisions: true },
      });

      if (!division) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Division not found",
        });
      }

      if (division.subDivisions && division.subDivisions.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot delete division with sub-divisions",
        });
      }

      await ctx.db.division.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 