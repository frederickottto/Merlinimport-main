import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const organisationRouter = createTRPCRouter({
  all: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/organisations",
        tags: ["organisations"],
        summary: "Get all organisations",
      },
    })
    .query(async ({ ctx }) => {
      try {
        // Try to get all organisations, but handle data type inconsistencies
        const organisations = await ctx.db.organisation.findMany({
          select: {
            id: true,
            name: true,
            abbreviation: true,
            website: true,
            employeeNumber: true,
            legalType: true,
            locationID: true,
            parentOrganisationId: true,
            childOrganisationsId: true,
            projectIDs: true,
            organisationContactsIDs: true,
            industrySectorIDs: true,
            createdAt: true,
            updatedAt: true,
            anonymousIdentifier: true,
            // Skip anualReturn for now to avoid data type issues
          }
        });
        
        // Add a placeholder for anualReturn to maintain API compatibility
        const organisationsWithRevenue = organisations.map(org => ({
          ...org,
          anualReturn: null
        }));
        
        return organisationsWithRevenue;
      } catch (error) {
        console.error("Error fetching organisations:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unable to fetch organisations",
        });
      }
    }),
}); 