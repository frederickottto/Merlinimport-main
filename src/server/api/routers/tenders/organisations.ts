import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

interface UpdateData {
  organisation?: { connect: { id: string } };
  callToTender?: { connect: { id: string } };
  organisationRole?: { 
    update?: { role: string };
    create?: { role: string };
  };
}

export const callToTenderOrganisationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.callToTenderOrganisation.findMany({
      include: {
        organisation: true,
        callToTender: true,
        OrganisationContacts: true
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.callToTenderOrganisation.findUnique({
        where: { id: input.id },
        include: {
          organisation: true,
          callToTender: true,
          OrganisationContacts: true
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organisation not found",
        });
      }
      return item;
    }),

  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const organisations = await ctx.db.callToTenderOrganisation.findMany({
        where: { callToTenderIDs: input.tenderId },
        include: {
          organisation: true,
          callToTender: true,
          OrganisationContacts: true,
          organisationRole: {
            select: {
              id: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });
      
      if (!organisations) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No organisations found for this tender",
        });
      }
      
      return organisations;
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
          organisationRole: {
            create: {
              role: input.organisationRole
            }
          },
          organisation: {
            connect: {
              id: input.organisationIDs
            }
          },
          callToTender: {
            connect: {
              id: input.callToTenderIDs
            }
          }
        },
        include: {
          organisation: true,
          callToTender: true,
          OrganisationContacts: true,
          organisationRole: true
        }
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
      try {
        const { id, ...data } = input;

        // First check if the organization exists
        const existingOrg = await ctx.db.callToTenderOrganisation.findUnique({
          where: { id },
          include: {
            organisation: true,
            callToTender: true,
            organisationRole: true,
            OrganisationContacts: true
          }
        });

        if (!existingOrg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // Prepare update data
        const updateData: UpdateData = {};

        // Handle organization connection if provided
        if (data.organisationIDs) {
          updateData.organisation = {
            connect: { id: data.organisationIDs }
          };
        }

        // Handle call to tender connection if provided
        if (data.callToTenderIDs) {
          updateData.callToTender = {
            connect: { id: data.callToTenderIDs }
          };
        }

        // Handle organization role update if provided
        if (data.organisationRole) {
          // If there's an existing role, update it
          if (existingOrg.organisationRole) {
            updateData.organisationRole = {
              update: {
                role: data.organisationRole
              }
            };
          } else {
            // If no existing role, create a new one
            updateData.organisationRole = {
              create: {
                role: data.organisationRole
              }
            };
          }
        }

        // Perform the update
        const updatedOrg = await ctx.db.callToTenderOrganisation.update({
          where: { id },
          data: updateData,
          include: {
            organisation: true,
            callToTender: true,
            organisationRole: true,
            OrganisationContacts: true
          }
        });

        return updatedOrg;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update organization",
          cause: error,
        });
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the organization exists
        const existingOrg = await ctx.db.callToTenderOrganisation.findUnique({
          where: { id: input.id },
          include: {
            organisation: true,
            callToTender: true,
            OrganisationContacts: true
          }
        });

        if (!existingOrg) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Organization not found",
          });
        }

        // First delete any associated contacts
        await ctx.db.organisationContacts.deleteMany({
          where: { CallToTenderOrganisationIDs: input.id }
        });
        
        // Then delete the organisation
        const deletedOrg = await ctx.db.callToTenderOrganisation.delete({
          where: { id: input.id },
          include: {
            organisation: true,
            callToTender: true,
            OrganisationContacts: true
          }
        });
        
        return deletedOrg;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete organization",
          cause: error,
        });
      }
    }),
});
