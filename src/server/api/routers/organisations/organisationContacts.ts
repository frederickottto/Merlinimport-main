import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationContactsRouter = createTRPCRouter({
    all: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/organisationContacts",
                tags: ["organisationContacts"],
                summary: "Get all organisation contacts",
            },
        })
        .query(async ({ ctx }) => {
            try {
                const contacts = await ctx.db.organisationContacts.findMany({
                    orderBy: { lastName: "asc" },
                });
                return contacts;
            } catch (error) {
                console.error("Error fetching organisation contacts:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch organisation contacts",
                });
            }
        }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const contact = await ctx.db.organisationContacts.findUnique({
                where: { id: input.id },
                include: {
                    organisation: {
                        include: {
                            industrySector: true
                        }
                    },
                    salutation: {
                        select: {
                            id: true,
                            salutationShort: true,
                            salutationLong: true
                        }
                    },
                    projectContacts: true,
                },
            });
            if (!contact) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Contact not found",
                });
            }

            // Transform the data for display
            const transformedContact = {
                ...contact,
                // Transform salutation to display the short form
                salutation: contact.salutation?.[0]?.salutationShort || "",
                organisationDisplay: contact.organisation?.map(o => {
                    const sectors = o.industrySector?.map(s => s.industrySector).join(", ") || "";
                    return `${o.name}${sectors ? ` (${sectors})` : ""}`;
                }).join(", ") || ""
            };

            console.log('Contact data:', {
                salutations: contact.salutation,
                transformed: transformedContact.salutation
            });

            return transformedContact;
        }),
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    foreName: z.string(),
                    lastName: z.string(),
                    position: z.string().optional(),
                    department: z.string().optional(),
                    email: z.string().optional(),
                    mobile: z.string().optional(),
                    telephone: z.string().optional(),
                    organisationIDs: z.string().optional(),
                    salutationIDs: z.string().optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, data } = input;
            return await ctx.db.organisationContacts.update({
                where: { id },
                data: {
                    foreName: data.foreName,
                    lastName: data.lastName,
                    position: data.position,
                    department: data.department,
                    email: data.email,
                    mobile: data.mobile,
                    telephone: data.telephone,
                    organisationIDs: data.organisationIDs ? [data.organisationIDs] : [],
                    salutationIDs: data.salutationIDs ? [data.salutationIDs] : [],
                },
            });
        }),
    create: publicProcedure
        .input(
            z.object({
                foreName: z.string(),
                lastName: z.string(),
                position: z.string().optional(),
                department: z.string().optional(),
                email: z.string().optional(),
                mobile: z.string().optional(),
                telephone: z.string().optional(),
                organisationIDs: z.string(),
                salutationIDs: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                return await ctx.db.organisationContacts.create({
                    data: {
                        foreName: input.foreName,
                        lastName: input.lastName,
                        position: input.position,
                        department: input.department,
                        email: input.email,
                        mobile: input.mobile,
                        telephone: input.telephone,
                        organisation: {
                            connect: [{ id: input.organisationIDs }]
                        },
                        salutation: input.salutationIDs ? {
                            connect: [{ id: input.salutationIDs }]
                        } : undefined
                    },
                    include: {
                        organisation: true,
                        salutation: true
                    }
                });
            } catch (error) {
                console.error("Error creating contact:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create contact"
                });
            }
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const contact = await ctx.db.organisationContacts.delete({
                where: { id: input.id },
            });
            return contact;
        }),
    getByOrganisationId: publicProcedure
        .input(z.object({ organisationId: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.organisationContacts.findMany({
                where: {
                    organisation: {
                        some: { id: input.organisationId }
                    }
                },
                orderBy: { lastName: "asc" },
            });
        }),
});
