import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationTenderRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.callToTenderOrganisation.findMany({
      include: {
        organisation: true,
        callToTender: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getByContactId: publicProcedure
    .input(z.object({ contactId: z.string() }))
    .query(async ({ ctx, input }) => {
      const contact = await ctx.db.organisationContacts.findUnique({
        where: { id: input.contactId },
        include: {
          organisation: true,
        },
      });

      if (!contact) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Contact not found",
        });
      }

      const tenders = await ctx.db.callToTenderOrganisation.findMany({
        where: {
          organisationIDs: {
            in: contact.organisationIDs,
          },
        },
        include: {
          organisation: true,
          callToTender: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return tenders;
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.callToTenderOrganisation.findUnique({
        where: { id: input.id },
        include: {
          organisation: true,
          callToTender: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "CallToTenderOrganisation not found",
        });
      }
      return item;
    }),

  create: publicProcedure
    .input(
      z.object({
        organisationIDs: z.string(),
        callToTenderIDs: z.string(),
        organisationRole: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.callToTenderOrganisation.create({
        data: {
          organisation: { connect: { id: input.organisationIDs } },
          callToTender: { connect: { id: input.callToTenderIDs } },
          organisationRole: { connect: { id: input.organisationRole } },
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        organisationIDs: z.string().optional(),
        callToTenderIDs: z.string().optional(),
        organisationRole: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const updateData: Record<string, unknown> = {};
      if (data.organisationIDs) updateData.organisation = { connect: { id: data.organisationIDs } };
      if (data.callToTenderIDs) updateData.callToTender = { connect: { id: data.callToTenderIDs } };
      if (data.organisationRole) updateData.organisationRole = { connect: { id: data.organisationRole } };
      
      return await ctx.db.callToTenderOrganisation.update({
        where: { id },
        data: updateData,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.callToTenderOrganisation.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 