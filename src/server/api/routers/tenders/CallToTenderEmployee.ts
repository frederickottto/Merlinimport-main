import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const employeeSchema = z.object({
  id: z.string(),
  foreName: z.string(),
  lastName: z.string(),
});

export const callToTenderEmployeeRouter = createTRPCRouter({
  getAvailableEmployees: publicProcedure
    .output(z.array(employeeSchema))
    .query(async ({ ctx }) => {
      const employees = await ctx.db.employee.findMany({
        select: {
          id: true,
          foreName: true,
          lastName: true,
        },
        orderBy: {
          lastName: 'asc',
        },
      });
      return employees;
    }),

  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const employees = await ctx.db.callToTenderEmployee.findMany({
        where: { callToTenderId: input.tenderId },
        include: {
          employee: {
            select: {
              id: true,
              foreName: true,
              lastName: true,
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });

      if (!employees) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No employees found for this tender",
        });
      }

      return employees;
    }),

  create: publicProcedure
    .input(
      z.object({
        employeeId: z.string(),
        callToTenderId: z.string(),
        employeeCallToTenderRole: z.string(),
        role: z.string().optional(),
        profileTitle: z.string().optional(),
        description: z.string().optional(),
        costCenter: z.number().optional(),
        profilePrice: z.number().optional(),
        travelCost: z.number().optional(),
        autoSelected: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the employee role exists
        const role = await ctx.db.employeeRole.findUnique({
          where: { id: input.employeeCallToTenderRole }
        });

        if (!role) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee role not found",
          });
        }

        return await ctx.db.callToTenderEmployee.create({
          data: {
            employee: {
              connect: { id: input.employeeId }
            },
            callToTender: {
              connect: { id: input.callToTenderId }
            },
            employeeCallToTenderRole: role.role ?? "Unbekannte Rolle",
            role: input.role,
            profileTitle: input.profileTitle,
            description: input.description,
            costCenter: input.costCenter,
            profilePrice: input.profilePrice,
            travelCost: input.travelCost,
            autoSelected: input.autoSelected ?? false,
          },
          include: {
            employee: {
              select: {
                id: true,
                foreName: true,
                lastName: true,
              }
            }
          }
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee assignment",
          cause: error,
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        employeeId: z.string().optional(),
        callToTenderId: z.string().optional(),
        employeeCallToTenderRole: z.string().optional(),
        role: z.string().optional(),
        profileTitle: z.string().optional(),
        description: z.string().optional(),
        costCenter: z.number().optional(),
        profilePrice: z.number().optional(),
        travelCost: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input;

        // First check if the employee assignment exists
        const existingEmployee = await ctx.db.callToTenderEmployee.findUnique({
          where: { id },
          include: {
            employee: true
          }
        });

        if (!existingEmployee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee assignment not found",
          });
        }

        // Prepare update data
        const updateData: Record<string, unknown> = {};

        // Handle employee connection if provided
        if (data.employeeId) {
          updateData.employee = {
            connect: { id: data.employeeId }
          };
        }

        // Handle call to tender connection if provided
        if (data.callToTenderId) {
          updateData.callToTender = {
            connect: { id: data.callToTenderId }
          };
        }

        // Handle employee role update if provided
        if (data.employeeCallToTenderRole) {
          // Check if the role exists
          const role = await ctx.db.employeeRole.findUnique({
            where: { id: data.employeeCallToTenderRole }
          });

          if (!role) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Employee role not found",
            });
          }

          updateData.employeeCallToTenderRole = role.role ?? "Unbekannte Rolle";
        }

        // Add new fields to update data if provided
        if (data.role !== undefined) updateData.role = data.role;
        if (data.profileTitle !== undefined) updateData.profileTitle = data.profileTitle;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.costCenter !== undefined) updateData.costCenter = data.costCenter;
        if (data.profilePrice !== undefined) updateData.profilePrice = data.profilePrice;
        if (data.travelCost !== undefined) updateData.travelCost = data.travelCost;

        // Perform the update
        const updatedEmployee = await ctx.db.callToTenderEmployee.update({
          where: { id },
          data: updateData,
          include: {
            employee: {
              select: {
                id: true,
                foreName: true,
                lastName: true,
              }
            }
          }
        });

        return updatedEmployee;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee assignment",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the employee assignment exists
        const existingEmployee = await ctx.db.callToTenderEmployee.findUnique({
          where: { id: input.id },
          include: {
            employee: true
          }
        });

        if (!existingEmployee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee assignment not found",
          });
        }

        // Delete the employee assignment
        const deletedEmployee = await ctx.db.callToTenderEmployee.delete({
          where: { id: input.id },
          include: {
            employee: true
          }
        });

        return deletedEmployee;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employee assignment",
          cause: error,
        });
      }
    }),
});
