import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { updateProjectSchema } from "@/server/controllers/projects/form-config";
import { Prisma } from "@prisma/client";

export const projectsRouter = createTRPCRouter({
    all: publicProcedure.query(async ({ ctx }) => {
        const projects = await ctx.db.project.findMany();
        return projects;
    }),
    getUserById: publicProcedure
        .meta({
            openapi: {
                // enabled: true,
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
                    foreName: z.string(),
                    lastName: z.string(),
                    clerkId: z.string().nullable(),
                }),
            })
        )
        .query(async ({ ctx, input }) => {
            const user = await ctx.db.employee.findUnique({
                where: { id: input.id }
            });

            if (!user) {
                throw new TRPCError({
                    message: "User not found",
                    code: "NOT_FOUND",
                });
            }

            return { user };
        }),
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ ctx, input }) => {
            const project = await ctx.db.project.findUnique({
                where: { id: input.id },
                include: {
                    organisation: true,
                    organisationContacts: true,
                    frameworkContractProject: {
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            description: true
                        }
                    },
                    subProjects: true,
                    callToTender: true,
                },
            });

            if (!project) {
                throw new TRPCError({
                    message: "Project not found",
                    code: "NOT_FOUND",
                });
            }

            // Ensure keywords is always an array
            if (!Array.isArray(project.keywords)) {
                project.keywords = project.keywords ? [project.keywords] : [];
            }

            return project;
        }),
    update: publicProcedure
        .input(
            z.object({
                id: z.string(),
                title: z.string().optional(),
                type: z.string().optional(),
                referenceApproval: z.boolean().optional(),
                description: z.string().optional(),
                keywords: z.array(z.string()).optional(),
                teamSize: z.number().optional(),
                scopeAuditHours: z.number().optional(),
                volumePTTotal: z.number().optional(),
                volumePTRetrieved: z.number().optional(),
                volumeEuroTotal: z.number().optional(),
                volumeEuroRetrieved: z.number().optional(),
                contractBeginn: z.union([z.string(), z.date()]).optional(),
                contractEnd: z.union([z.string(), z.date()]).optional(),
                projectIT: z.boolean().optional(),
                projectIS: z.boolean().optional(),
                projectGS: z.boolean().optional(),
                organisationIDs: z.array(z.string()).optional(),
                organisationContactsIDs: z.array(z.string()).optional(),
                frameworkContractProjectIDs: z.string().optional().nullable(),
                subProjectIDs: z.array(z.string()).optional(),
                standards: z.array(z.string()).optional(),
                approvedMargin: z.number().optional(),
                firstContactDate: z.union([z.string(), z.date()]).optional(),
                serviceDate: z.union([z.string(), z.date()]).optional(),
                evbItContractNumber: z.string().optional(),
                evbItContractLocation: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, frameworkContractProjectIDs, ...data } = input;

            // Handle nested updates for relations
            const updateData: Prisma.ProjectUpdateInput = { ...data };
            
            if (data.organisationIDs) {
                updateData.organisation = {
                    connect: data.organisationIDs.map(id => ({ id })),
                };
            }
            
            if (data.organisationContactsIDs) {
                updateData.organisationContacts = {
                    connect: data.organisationContactsIDs.map(id => ({ id })),
                };
            }
            
            // Handle framework contract relation - connect if ID provided, disconnect if null/undefined
            if (typeof frameworkContractProjectIDs === "string" && frameworkContractProjectIDs) {
                updateData.frameworkContractProject = {
                    connect: { id: frameworkContractProjectIDs },
                };
            } else if (frameworkContractProjectIDs === null || frameworkContractProjectIDs === undefined) {
                updateData.frameworkContractProject = {
                    disconnect: true,
                };
            }
            
            if (data.subProjectIDs) {
                updateData.subProjects = {
                    connect: data.subProjectIDs.map(id => ({ id })),
                };
            }

            const project = await ctx.db.project.update({
                where: { id },
                data: updateData,
                include: {
                    organisation: true,
                    organisationContacts: true,
                    frameworkContractProject: true,
                    subProjects: true,
                },
            });

            return project;
        }),
    create: publicProcedure
        .input(updateProjectSchema)
        .mutation(async ({ ctx, input }) => {
            const { frameworkContractProjectIDs, organisationIDs, organisationContactsIDs, ...rest } = input;
            
            const project = await ctx.db.project.create({
                data: {
                    ...rest,
                    keywords: Array.isArray(input.keywords) ? input.keywords : [],
                    standards: Array.isArray(input.standards) ? input.standards : [],
                    ...(typeof frameworkContractProjectIDs === "string" && frameworkContractProjectIDs ? {
                        frameworkContractProject: {
                            connect: { id: frameworkContractProjectIDs }
                        }
                    } : {}),
                    ...(organisationIDs ? {
                        organisation: {
                            connect: organisationIDs.map(id => ({ id }))
                        }
                    } : {}),
                    ...(organisationContactsIDs ? {
                        organisationContacts: {
                            connect: organisationContactsIDs.map(id => ({ id }))
                        }
                    } : {})
                },
            });

            return project;
        }),
});
