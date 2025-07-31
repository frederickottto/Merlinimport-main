import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const organisationsRouter = createTRPCRouter({
   
    all: publicProcedure.query(async ({ ctx }) => {
        console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL);
        return ctx.db.organisation.findMany({
            orderBy: { name: "asc" },
            include: {
                location: true,
                industrySector: true,
                parentOrganisation: true,
            },
        });
    }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const organisation = await ctx.db.organisation.findUnique({
                where: { id: input.id },
                include: {
                    location: true,
                    industrySector: true,
                    parentOrganisation: true,
                    childOrganisations: true,
                    organisationOrganisationRoles: {
                        include: {
                            organisationRole: true
                        }
                    }
                },
            });
            if (!organisation) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Organisation not found",
                });
            }
            return organisation;
        }),
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                data: z.object({
                    name: z.string(),
                    abbreviation: z.string().optional(),
                    anonymousIdentifier: z.string().optional(),
                    website: z.string().url().optional(),
                    location: z.string().optional(),
                    employeeNumber: z.number().min(0).optional(),
                    anualReturn: z.number().min(0).optional(),
                    legalType: z.string().optional(),
                    industrySector: z.union([z.string(), z.array(z.string())]).optional(),
                    parentOrganisation: z.string().optional().nullable(),
                    organisationOrganisationRoles: z.union([z.string(), z.array(z.string())]).optional(),
                }),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, data } = input;

            // Normalize arrays
            const industrySectorArray = typeof data.industrySector === "string" ? [data.industrySector] : data.industrySector;
            const organisationRolesArray = typeof data.organisationOrganisationRoles === "string" ? [data.organisationOrganisationRoles] : data.organisationOrganisationRoles;

            // If roles are provided, update the junction table entries
            if (organisationRolesArray !== undefined) {
                // Delete existing role connections
                await ctx.db.organisationOrganisationRoles.deleteMany({
                    where: { organisationID: id }
                });

                // Create new role connections if array is not empty
                if (organisationRolesArray?.length) {
                    await Promise.all(
                        organisationRolesArray.map(roleId =>
                            ctx.db.organisationOrganisationRoles.create({
                                data: {
                                    organisation: { connect: { id } },
                                    organisationRole: { connect: { id: roleId } }
                                }
                            })
                        )
                    );
                }
            }

            // Update organisation
            const organisation = await ctx.db.organisation.update({
                where: { id },
                data: {
                    name: data.name,
                    abbreviation: data.abbreviation,
                    anonymousIdentifier: data.anonymousIdentifier,
                    website: data.website,
                    location: data.location ? { connect: { id: data.location } } : undefined,
                    employeeNumber: data.employeeNumber,
                    anualReturn: data.anualReturn,
                    legalType: data.legalType,
                    industrySector: industrySectorArray ? { connect: industrySectorArray.map(id => ({ id })) } : undefined,
                    parentOrganisation: data.parentOrganisation ? { connect: { id: data.parentOrganisation } } : undefined,
                },
                include: {
                    location: true,
                    industrySector: true,
                    parentOrganisation: true,
                    childOrganisations: true,
                    organisationOrganisationRoles: {
                        include: {
                            organisationRole: true
                        }
                    }
                },
            });

            return organisation;
        }),
    getUserById: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/users/{id}",
                tags: ["users"],
                summary: "Read a user by id",
            },
        })
        .input(
            z.object({
                id: z.string().uuid(),
            })
        )
        .output(
            z.object({
                user: z.object({
                    id: z.string(),
                    role: z.string(),
                }),
            })
        )
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.employee.findUnique({
                where: { id: input.id },
                select: {
                    id: true,
                    employeeRank: true,
                },
            });

            if (!user) {
                throw new TRPCError({
                    message: "User not found",
                    code: "NOT_FOUND",
                });
            }

            return { 
                user: {
                    id: user.id,
                    role: user.employeeRank?.employeePositionShort ?? "MITARBEITER"
                }
            };
        }),
    create: publicProcedure
        .input(
            z.object({
                name: z.string(),
                abbreviation: z.string().optional(),
                anonymousIdentifier: z.string().optional(),
                website: z.string().url().optional(),
                location: z.string().optional(),
                employeeNumber: z.number().optional(),
                anualReturn: z.number().optional(),
                legalType: z.string().optional(),
                industrySector: z.union([z.string(), z.array(z.string())]).optional(),
                parentOrganisation: z.string().optional().nullable(),
                organisationOrganisationRoles: z.union([z.string(), z.array(z.string())]).optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Normalize arrays
            const industrySectorArray = typeof input.industrySector === "string" ? [input.industrySector] : input.industrySector;
            const organisationRolesArray = typeof input.organisationOrganisationRoles === "string" ? [input.organisationOrganisationRoles] : input.organisationOrganisationRoles;

            // Create organisation
            const organisation = await ctx.db.organisation.create({
                data: {
                    name: input.name,
                    abbreviation: input.abbreviation,
                    anonymousIdentifier: input.anonymousIdentifier,
                    website: input.website,
                    location: input.location ? { connect: { id: input.location } } : undefined,
                    employeeNumber: input.employeeNumber,
                    anualReturn: input.anualReturn,
                    legalType: input.legalType,
                    industrySector: industrySectorArray ? { connect: industrySectorArray.map(id => ({ id })) } : undefined,
                    parentOrganisation: input.parentOrganisation ? { connect: { id: input.parentOrganisation } } : undefined,
                },
                include: {
                    location: true,
                    industrySector: true,
                    parentOrganisation: true,
                    childOrganisations: true,
                    organisationOrganisationRoles: {
                        include: {
                            organisationRole: true
                        }
                    }
                },
            });

            // Create junction table entries for organisation roles if provided
            if (organisationRolesArray?.length) {
                await Promise.all(
                    organisationRolesArray.map(roleId =>
                        ctx.db.organisationOrganisationRoles.create({
                            data: {
                                organisation: { connect: { id: organisation.id } },
                                organisationRole: { connect: { id: roleId } }
                            }
                        })
                    )
                );

                // Return updated organisation with roles
                return ctx.db.organisation.findUnique({
                    where: { id: organisation.id },
                    include: {
                        location: true,
                        industrySector: true,
                        parentOrganisation: true,
                        childOrganisations: true,
                        organisationOrganisationRoles: {
                            include: {
                                organisationRole: true
                            }
                        }
                    }
                });
            }

            return organisation;
        }),
    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const organisation = await ctx.db.organisation.delete({
                where: { id: input.id },
            });
            return organisation;
        }),
    formOptions: publicProcedure.query(async ({ ctx }) => {
        const [locations, industrySectors, organisations] = await Promise.all([
            ctx.db.location.findMany({ orderBy: { city: "asc" } }),
            ctx.db.industrySector.findMany({ orderBy: { industrySector: "asc" } }),
            ctx.db.organisation.findMany({ orderBy: { name: "asc" } }),
        ]);
        return {
            locations,
            industrySectors,
            organisations,
        };
        }),
});
