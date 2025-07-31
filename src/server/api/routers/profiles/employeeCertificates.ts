import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const employeeCertificatesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        employeeId: z.string().optional(),
        certificateId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const employeeCertificates = await ctx.db.employeeCertificates.findMany({
        where: {
          ...(input?.employeeId && { employeeIDs: input.employeeId }),
          ...(input?.certificateId && { certificateIDs: input.certificateId }),
        },
        include: {
          employee: true,
          certificate: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              category: true,
              deeplink: true,
              salesCertificate: true,
              createdAt: true,
              updatedAt: true,
            }
          },
        },
        orderBy: {
          validUntil: 'desc',
        },
      });
      return employeeCertificates;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const employeeCertificate = await ctx.db.employeeCertificates.findUnique({
        where: { id: input.id },
        include: {
          employee: true,
          certificate: {
            select: {
              id: true,
              title: true,
              description: true,
              type: true,
              category: true,
              deeplink: true,
              salesCertificate: true,
              createdAt: true,
              updatedAt: true,
            }
          },
        },
      });

      if (!employeeCertificate) {
        throw new TRPCError({
          message: "Employee certificate not found",
          code: "NOT_FOUND",
        });
      }

      return employeeCertificate;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          employeeIDs: z.string(),
          employeeDisplayName: z.string(),
          certificateIDs: z.string(),
          validUntil: z.date().optional(),
          issuer: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Check if employee exists
        const employee = await ctx.db.employee.findUnique({
          where: { id: input.data.employeeIDs },
        });
        if (!employee) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee not found",
          });
        }

        // Check if certificate exists
        const certificate = await ctx.db.certificate.findUnique({
          where: { id: input.data.certificateIDs },
        });
        if (!certificate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Certificate not found",
          });
        }

        // Check if this combination already exists
        const existingCertificate = await ctx.db.employeeCertificates.findFirst({
          where: {
            employeeIDs: input.data.employeeIDs,
            certificateIDs: input.data.certificateIDs,
          },
        });
        if (existingCertificate) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This employee already has this certificate assigned",
          });
        }

        return await ctx.db.employeeCertificates.create({
          data: {
            employeeIDs: input.data.employeeIDs,
            certificateIDs: input.data.certificateIDs,
            validUntil: input.data.validUntil,
            issuer: input.data.issuer,
          },
          include: {
            employee: true,
            certificate: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                category: true,
                deeplink: true,
                salesCertificate: true,
                createdAt: true,
                updatedAt: true,
              }
            },
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to create employee certificate: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee certificate",
        });
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          employeeDisplayName: z.string(),
          validUntil: z.date().optional(),
          issuer: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.employeeCertificates.update({
          where: { id },
          data: {
            validUntil: data.validUntil,
            issuer: data.issuer,
          },
          include: {
            employee: true,
            certificate: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                category: true,
                deeplink: true,
                salesCertificate: true,
                createdAt: true,
                updatedAt: true,
              }
            },
          },
        });
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to update employee certificate: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee certificate",
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.employeeCertificates.delete({
          where: { id: input.id },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Failed to delete employee certificate: ${error.message}`,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employee certificate",
        });
      }
    }),
}); 