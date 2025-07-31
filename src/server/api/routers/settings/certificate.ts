import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const certificateRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ type: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const certificates = await ctx.db.certificate.findMany({
        where: input?.type ? { type: input.type } : {},
      });
      return certificates;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const certificate = await ctx.db.certificate.findUnique({
        where: { id: input.id },
      });

      if (!certificate) {
        throw new TRPCError({
          message: "Certificate not found",
          code: "NOT_FOUND",
        });
      }

      return certificate;
    }),

  create: publicProcedure
    .input(
      z.object({
        data: z.object({
          title: z.string().min(1, "Der Name des Zertifikats darf nicht leer sein"),
          description: z.string().optional(),
          type: z.string().optional(),
          category: z.enum([
            "Projektmanagement",
            "Cloud",
            "Security",
            "Datenschutz",
            "Architektur",
            "Entwicklung",
            "DevOps",
            "Agile",
            "Sonstiges"
          ]).optional(),
          deeplink: z.string().optional(),
          salesCertificate: z.boolean().optional().default(false),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await ctx.db.certificate.create({
          data: {
            title: input.data.title.trim(),
            description: input.data.description?.trim(),
            type: input.data.type?.trim(),
            category: input.data.category,
            deeplink: input.data.deeplink?.trim(),
            salesCertificate: input.data.salesCertificate,
          },
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Certificate_title_key')) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Ein Zertifikat mit dem Namen "${input.data.title}" existiert bereits.`,
          });
        }
        throw error;
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: z.object({
          title: z.string().min(1, "Der Name des Zertifikats darf nicht leer sein").optional(),
          description: z.string().optional(),
          type: z.string().optional(),
          category: z.enum([
            "Projektmanagement",
            "Cloud",
            "Security",
            "Datenschutz",
            "Architektur",
            "Entwicklung",
            "DevOps",
            "Agile",
            "Sonstiges"
          ]).optional(),
          deeplink: z.string().optional(),
          salesCertificate: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      try {
        return await ctx.db.certificate.update({
          where: { id },
          data: {
            title: data.title?.trim(),
            description: data.description?.trim(),
            type: data.type?.trim(),
            category: data.category,
            deeplink: data.deeplink?.trim(),
            salesCertificate: data.salesCertificate,
          },
        });
      } catch (error) {
        if (error instanceof Error && error.message.includes('Certificate_title_key')) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Ein Zertifikat mit dem Namen "${data.title}" existiert bereits.`,
          });
        }
        throw error;
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.certificate.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 