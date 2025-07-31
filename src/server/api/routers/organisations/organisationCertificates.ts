import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationCertificatesRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.organisationCertificates.findMany({
      include: {
        organisation: true,
        certificate: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.organisationCertificates.findUnique({
        where: { id: input.id },
        include: {
          organisation: true,
          certificate: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "OrganisationCertificate not found",
        });
      }
      return item;
    }),

  create: publicProcedure
    .input(
      z.object({
        organisationIDs: z.string(),
        certificateIDs: z.string(),
        certificationObject: z.string().optional(),
        validUntil: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.organisationCertificates.create({
        data: {
          organisationIDs: input.organisationIDs,
          certificateIDs: input.certificateIDs,
          certificationObject: input.certificationObject,
          validUntil: input.validUntil,
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        organisationIDs: z.string().optional(),
        certificateIDs: z.string().optional(),
        certificationObject: z.string().optional(),
        validUntil: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.organisationCertificates.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.organisationCertificates.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 