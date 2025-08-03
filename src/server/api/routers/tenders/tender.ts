import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { tenderSchema } from "@/server/controllers/tender/schema";

export type T_Tender = z.infer<typeof tenderSchema>;

export const tenderRouter = createTRPCRouter({
	all: publicProcedure
		.meta({
			openapi: {
				method: "GET",
				path: "/tenders",
				tags: ["tender"],
				summary: "Get all tenders",
			},
		})
		.query(async ({ ctx }) => {
			try {
				const tenders = await ctx.db.callToTender.findMany({
					select: {
						id: true,
						createdAt: true,
						updatedAt: true,
						title: true,
						type: true,
						shortDescription: true,
						awardCriteria: true,
						offerDeadline: true,
						questionDeadline: true,
						bindingDeadline: true,
						volumeEuro: true,
						volumePT: true,
						volumeHours: true,
						successChance: true,
						keywords: true,
						status: true,
						notes: true,
						hyperlink: true,
						websiteTenderPlattform: true,
						internalPlattform: true,
						ocid: true,
						noticeType: true,
						releaseDate: true,
						tag: true,
						organisations: {
							select: {
								id: true,
								organisationRole: {
									select: {
										role: true
									}
								},
								organisation: {
									select: {
										id: true,
										name: true,
									}
								}
							}
						},
						employees: {
							select: {
								id: true,
								employeeCallToTenderRole: true,
								employee: {
									select: {
										id: true,
										foreName: true,
										lastName: true,
									}
								}
							}
						},
						conditionsOfParticipation: {
							select: {
								id: true,
								title: true,
								conditionsOfParticipationType: {
									select: {
										id: true,
										title: true,
									}
								},
								certificate: {
									select: {
										id: true,
										title: true,
									}
								},
								industrySector: {
									select: {
										id: true,
										industrySector: true,
									}
								}
							}
						},
						lots: {
							select: {
								id: true,
								number: true,
								title: true,
								description: true,
								volumeEuro: true,
								volumePT: true,
								workpackages: {
									select: {
										id: true,
										number: true,
										title: true,
										description: true,
										volumeEuro: true,
										volumePT: true,
									}
								}
							}
						},
						template: {
							select: {
								id: true,
								title: true,
								description: true,
							}
						},
						callToTenderDeliverables: {
							select: {
								id: true,
								deliverables: {
									select: {
										id: true,
										title: true,
										description: true,
									}
								}
							}
						},
						riskQualityProcesses: {
							select: {
								id: true,
								type: true,
								status: true,
								note: true,
							}
						}
					}
				});

				// Convert string dates to Date objects and transform the data to match the schema
				const processedTenders = tenders.map(tender => ({
					...tender,
					offerDeadline: tender.offerDeadline ? new Date(tender.offerDeadline) : undefined,
					questionDeadline: tender.questionDeadline ? new Date(tender.questionDeadline) : undefined,
					bindingDeadline: tender.bindingDeadline ? new Date(tender.bindingDeadline) : undefined,
					organisations: tender.organisations?.map(org => ({
						id: org.id,
						organisation: org.organisation,
						organisationRole: org.organisationRole.role,
					})) || [],
					workpackages: tender.lots?.flatMap(lot =>
						(lot.workpackages ?? []).map(wp => ({
							id: wp.id,
							number: wp.number ?? "",
							title: wp.title ?? "",
							description: wp.description,
							volumeEuro: wp.volumeEuro ?? undefined,
							volumePT: wp.volumePT ?? undefined,
						}))
					) || [],
				}));

				return processedTenders;
			} catch (e) {
				console.error('Error fetching tenders:', e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to fetch tenders",
				});
			}
		}),

	getById: publicProcedure
		.meta({
			openapi: {
				method: "GET",
				path: "/tenders/{id}",
				tags: ["tender"],
				summary: "Get tender by ID",
			},
		})
		.input(z.object({ 
			id: z.string(),
			_timestamp: z.number().optional() // Add optional timestamp for cache busting
		}))
		.query(async ({ ctx, input }) => {
			try {
				const tender = await ctx.db.callToTender.findUnique({
					where: { id: input.id },
					include: {
						organisations: {
							include: {
								organisation: true,
								organisationRole: true,
							},
						},
						employees: {
							include: {
								employee: true,
							},
						},
						conditionsOfParticipation: {
							include: {
								conditionsOfParticipationType: true,
								certificate: true,
								industrySector: true,
							},
						},
						lots: {
							include: {
								workpackages: true,
							},
						},
						projectCallToTender: {
							select: {
								id: true,
								title: true,
								type: true,
							},
						},
					},
				});

				if (!tender) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Tender not found",
					});
				}

				// Convert string dates to Date objects and transform the data to match the schema
				const processedTender = {
					...tender,
					createdAt: tender.createdAt ? new Date(tender.createdAt) : undefined,
					updatedAt: tender.updatedAt ? new Date(tender.updatedAt) : undefined,
					offerDeadline: tender.offerDeadline ? new Date(tender.offerDeadline) : undefined,
					questionDeadline: tender.questionDeadline ? new Date(tender.questionDeadline) : undefined,
					bindingDeadline: tender.bindingDeadline ? new Date(tender.bindingDeadline) : undefined,
					releaseDate: tender.releaseDate ? new Date(tender.releaseDate) : undefined,
					organisations: tender.organisations?.map(org => ({
						id: org.id,
						organisation: {
							id: org.organisation.id,
							name: org.organisation.name,
						},
						organisationRole: org.organisationRole.role,
					})) || [],
					workpackages: tender.lots?.flatMap(lot => 
						lot.workpackages?.map(wp => ({
							id: wp.id,
							number: wp.number || "",
							title: wp.title || "",
							description: wp.description,
							volumeEuro: wp.volumeEuro || undefined,
							volumePT: wp.volumePT || undefined,
						})) || []
					) || [],
					projectCallToTender: tender.projectCallToTender?.map(project => ({
						id: project.id,
						title: project.title,
						type: project.type,
					})) || [],
				} as T_Tender;

				return processedTender;
			} catch (e) {
				console.error('Error fetching tender:', e);
				if (e instanceof TRPCError) {
					throw e;
				}
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to fetch tender",
					cause: e,
				});
			}
		}),

	create: publicProcedure
		.meta({
			openapi: {
				method: "POST",
				path: "/tenders",
				tags: ["tender"],
				summary: "Create a new tender",
			},
		})
		.input(tenderSchema.omit({ id: true, createdAt: true, updatedAt: true }))
		.mutation(async ({ ctx, input }) => {
			try {
				// Convert string dates to Date objects and prepare create data
				const { organisations, employees, lots, ...baseData } = input;

				const createData = {
					...baseData,
					offerDeadline: input.offerDeadline ? new Date(input.offerDeadline) : undefined,
					questionDeadline: input.questionDeadline ? new Date(input.questionDeadline) : undefined,
					bindingDeadline: input.bindingDeadline ? new Date(input.bindingDeadline) : undefined,
					firstContactDate: input.firstContactDate ? new Date(input.firstContactDate) : undefined,
					serviceDate: input.serviceDate ? new Date(input.serviceDate) : undefined,
					standards: input.standards || [],
					volumeHoursTotal: input.volumeHoursTotal || 0,
					approvedMargin: input.approvedMargin || 0,
					evbItContractNumber: input.evbItContractNumber || "",
					evbItContractLocation: input.evbItContractLocation || "",
					...(organisations && {
						organisations: {
							create: organisations.map(org => ({
								organisation: {
									connect: { id: org.organisation.id }
								},
								organisationRole: {
									connect: { id: org.organisationRole }
								}
							}))
						}
					}),
					...(employees && {
						employees: {
							create: employees.map(emp => ({
								employeeCallToTenderRole: emp.employeeCallToTenderRole,
								employee: {
									connect: { id: emp.employee.id }
								}
							}))
						}
					}),
					...(lots && {
						lots: {
							create: lots.map(lot => {
								const { workpackages, ...lotData } = lot;
								return {
									number: lotData.number ?? "",
									title: lotData.title ?? "",
									description: lotData.description,
									volumeEuro: lotData.volumeEuro ?? undefined,
									volumePT: lotData.volumePT ?? undefined,
									...(workpackages && workpackages.length > 0 ? {
										workpackages: {
											create: workpackages.map(wp => {
												const wpData = wp;
												return {
													number: wpData.number ?? "",
													title: wpData.title ?? "",
													description: wpData.description,
													volumeEuro: wpData.volumeEuro ?? undefined,
													volumePT: wpData.volumePT ?? undefined
												};
											})
										}
									} : {})
								};
							})
						}
					})
				};

				const tender = await ctx.db.callToTender.create({
					data: createData as Prisma.CallToTenderCreateInput,
				});
				return tender;
			} catch (e) {
				console.error('Error creating tender:', e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to create tender",
				});
			}
		}),

	update: publicProcedure
		.meta({
			openapi: {
				method: "PUT",
				path: "/tenders/{id}",
				tags: ["tender"],
				summary: "Update a tender",
			},
		})
		.input(z.object({
			id: z.string(),
			data: tenderSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial(),
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				const { id, data } = input;
				const { organisations, employees, ...baseData } = data;

				const updateData = {
					...baseData,
					offerDeadline: data.offerDeadline ? new Date(data.offerDeadline) : undefined,
					questionDeadline: data.questionDeadline ? new Date(data.questionDeadline) : undefined,
					bindingDeadline: data.bindingDeadline ? new Date(data.bindingDeadline) : undefined,
					...(organisations && {
						organisations: {
							upsert: organisations.map(org => ({
								where: { id: org.id },
								create: {
									organisationRole: org.organisationRole,
									organisation: {
										connect: { id: org.organisation.id }
									}
								},
								update: {
									organisationRole: org.organisationRole,
									organisation: {
										connect: { id: org.organisation.id }
									}
								}
							}))
						}
					}),
					...(employees && {
						employees: {
							upsert: employees.map(emp => ({
								where: { id: emp.id },
								create: {
									employeeCallToTenderRole: emp.employeeCallToTenderRole,
									employee: {
										connect: { id: emp.employee.id }
									}
								},
								update: {
									employeeCallToTenderRole: emp.employeeCallToTenderRole,
									employee: {
										connect: { id: emp.employee.id }
									}
								}
							}))
						}
					})
				};

				const tender = await ctx.db.callToTender.update({
					where: { id },
					data: updateData as Prisma.CallToTenderUpdateInput,
				});
				return tender;
			} catch (e) {
				console.error('Error updating tender:', e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to update tender",
				});
			}
		}),

	delete: publicProcedure
		.meta({
			openapi: {
				method: "DELETE",
				path: "/tenders/{id}",
				tags: ["tender"],
				summary: "Delete a tender",
			},
		})
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				const tender = await ctx.db.callToTender.delete({
					where: { id: input.id }
				});
				return tender;
			} catch (e) {
				console.error('Error deleting tender:', e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to delete tender",
				});
			}
		}),

	createProjectFromTender: publicProcedure
		.meta({
			openapi: {
				method: "POST",
				path: "/tenders/{id}/create-project",
				tags: ["tender"],
				summary: "Create a project from a won tender",
			},
		})
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				// Get the tender
				const tender = await ctx.db.callToTender.findUnique({
					where: { id: input.id },
					include: {
						organisations: {
							include: {
								organisation: true
							}
						},
						employees: {
							include: {
								employee: true
							}
						},
						lots: {
							include: {
								workpackages: true
							}
						}
					}
				});

				if (!tender) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Tender not found",
					});
				}

				if (tender.status !== "gewonnen") {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Can only create project from won tenders",
					});
				}

				// Check if a project already exists for this tender
				const existingProject = await ctx.db.project.findFirst({
					where: {
						callToTenderIDs: tender.id
					}
				});

				if (existingProject) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "A project already exists for this tender",
					});
				}

				// Create a default employee role if it doesn't exist
				const defaultRole = await ctx.db.employeeRole.findFirst({
					where: { role: "Project Team Member" }
				}) || await ctx.db.employeeRole.create({
					data: {
						role: "Project Team Member"
					}
				});

				// Create the project
				const project = await ctx.db.project.create({
					data: {
						title: tender.title,
						type: tender.type,
						description: tender.shortDescription,
						volumeEuroTotal: tender.volumeEuro,
						volumePTTotal: tender.volumePT,
						volumeHoursTotal: tender.volumeHours,
						keywords: tender.keywords,
						callToTenderIDs: tender.id,
						// Connect organizations
						organisationIDs: tender.organisations.map(org => org.organisation.id),
						// Connect employees
						EmployeeProjectActivities: {
							create: tender.employees.map(emp => ({
								employeeIDs: emp.employee.id,
								description: emp.description || "Project team member",
								operationalPeriodStart: new Date(),
								operationalPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default to 1 year
								operationalDays: 0,
								employeeProjectEmployeeRoles: {
									create: {
										employeeID: emp.employee.id,
										employeeRoleID: defaultRole.id
									}
								}
							}))
						}
					}
				});

				return project;
			} catch (e) {
				console.error('Error creating project from tender:', e);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to create project from tender",
				});
			}
		}),
});
