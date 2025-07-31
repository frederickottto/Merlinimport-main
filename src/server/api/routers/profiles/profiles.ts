import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const profilesRouter = createTRPCRouter({
	all: publicProcedure.query(async ({ ctx }) => {
		const employees = await ctx.db.employee.findMany({
			orderBy: { lastName: "asc" },
			include: {
				employeeRank: true,
				location: true,
				titles: true,
				counselor: true,
			},
		});

		// Filter out employees with missing essential data and provide defaults
		return employees
			.filter(emp => emp.foreName !== null || emp.lastName !== null)
			.map(emp => ({
				...emp,
				foreName: emp.foreName || "Unknown",
				lastName: emp.lastName || "Employee",
			}));
	}),
	create: publicProcedure
		.meta({
			openapi: {
				method: "POST",
				path: "/profiles",
				tags: ["profiles"],
				summary: "Create a new profile",
			},
		})
		.input(
			z.object({
				foreName: z.string().min(1, "First name is required"),
				lastName: z.string().min(1, "Last name is required"),
				pseudonym: z.string().optional(),
				employeerCompany: z.string().optional(),
				counselorIDs: z.string().optional(),
				mobile: z.string().optional(),
				telephone: z.string().optional(),
				linkedInURL: z.string().url().optional(),
				xingURL: z.string().url().optional(),
				discoverURL: z.string().url().optional(),
				experienceIt: z.number().min(0),
				experienceIs: z.number().min(0),
				experienceItGs: z.number().min(0),
				experienceGps: z.number().min(0),
				experienceOther: z.number().min(0),
				experienceAll: z.number().min(0),
				description: z.string().optional(),
				employeeRankIDs: z.string().optional(),
				locationIDs: z.string().optional(),
				salutationIDs: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { employeeRankIDs, locationIDs, salutationIDs, counselorIDs, ...rest } = input;
			const profile = await ctx.db.employee.create({
				data: {
					...rest,
					employeeRank: employeeRankIDs ? { connect: { id: employeeRankIDs } } : undefined,
					location: locationIDs ? { connect: { id: locationIDs } } : undefined,
					titles: salutationIDs ? { connect: salutationIDs.map((id: string) => ({ id })) } : undefined,
					counselor: counselorIDs ? { connect: { id: counselorIDs } } : undefined,
				},
				include: {
					employeeRank: true,
					location: true,
					titles: true,
					counselor: true,
				},
			});
			return profile;
		}),
	delete: publicProcedure
		.meta({
			openapi: {
				method: "DELETE",
				path: "/profiles/{id}",
				tags: ["profiles"],
				summary: "Delete a profile",
			},
		})
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const profile = await ctx.db.employee.delete({
				where: { id: input.id },
			});
			return profile;
		}),
	getById: publicProcedure
		.meta({
			openapi: {
				method: "GET",
				path: "/profiles/{id}",
				tags: ["profiles"],
				summary: "Get a profile by ID",
			},
		})
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const profile = await ctx.db.employee.findUnique({
				where: { id: input.id },
				include: {
					employeeRank: true,
					location: true,
					titles: true,
					counselor: true,
					division: true,
				},
			});
			if (!profile) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Profile not found",
				});
			}
			// Provide defaults for nullable names
			return {
				...profile,
				foreName: profile.foreName || "Unknown",
				lastName: profile.lastName || "Employee",
			};
		}),
	update: publicProcedure
		.meta({
			openapi: {
				method: "PUT",
				path: "/profiles/{id}",
				tags: ["profiles"],
				summary: "Update a profile",
			},
		})
		.input(
			z.object({
				id: z.string(),
				data: z.object({
					foreName: z.string().min(1, "First name is required"),
					lastName: z.string().min(1, "Last name is required"),
					pseudonym: z.string().optional(),
					employeerCompany: z.string().optional(),
					counselorIDs: z.string().optional(),
					mobile: z.string().optional(),
					telephone: z.string().optional(),
					linkedInURL: z.string().url().optional(),
					xingURL: z.string().url().optional(),
					discoverURL: z.string().url().optional(),
					experienceIt: z.number().min(0),
					experienceIs: z.number().min(0),
					experienceItGs: z.number().min(0),
					experienceGps: z.number().min(0),
					experienceOther: z.number().min(0),
					experienceAll: z.number().min(0),
					description: z.string().optional(),
					employeeRankIDs: z.string().optional(),
					locationIDs: z.string().optional(),
					salutationIDs: z.array(z.string()).optional(),
					contractStartDate: z.date().optional(),
					divisionId: z.string().optional(),
				}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;
			const { employeeRankIDs, locationIDs, salutationIDs, counselorIDs, divisionId, ...rest } = data;
			const updateData: Record<string, unknown> = {
				...rest,
				counselor: counselorIDs ? { connect: { id: counselorIDs } } : undefined,
				division: divisionId ? { connect: { id: divisionId } } : undefined,
			};
			if (salutationIDs) {
				updateData.titles = { set: salutationIDs.map((id: string) => ({ id })) };
			}
			if (employeeRankIDs) {
				updateData.employeeRank = { connect: { id: employeeRankIDs } };
			}
			if (locationIDs) {
				updateData.location = { connect: { id: locationIDs } };
			}
			const profile = await ctx.db.employee.update({
				where: { id },
				data: updateData,
				include: {
					employeeRank: true,
					location: true,
					titles: true,
					counselor: true,
					division: true,
				},
			});
			return profile;
		}),
	formOptions: publicProcedure.query(async ({ ctx }) => {
		const [employeeRanks, locations, salutations] = await Promise.all([
			ctx.db.employeeRank.findMany({ orderBy: { employeePositionShort: "asc" } }),
			ctx.db.location.findMany({ orderBy: { city: "asc" } }),
			ctx.db.salutation.findMany({ orderBy: { salutationShort: "asc" } }),
		]);
		return {
			employeeRanks,
			locations,
			salutations,
		};
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
				}),
			})
		)
		.query(async ({ ctx, input }) => {
			const user = await ctx.db.employee.findUnique({
				where: { id: input.id },
				select: {
					id: true,
				},
			});

			if (!user) {
				throw new TRPCError({
					message: "User not found",
					code: "NOT_FOUND",
				});
			}

			return { user };
		}),
	search: publicProcedure
		.input(z.object({ q: z.string().optional() }))
		.query(async ({ ctx, input }) => {
			const q = input.q?.trim() || "";
			if (!q) return [];
			const employees = await ctx.db.employee.findMany({
				where: {
					OR: [
						{ foreName: { contains: q, mode: "insensitive" } },
						{ lastName: { contains: q, mode: "insensitive" } },
					],
				},
				take: 20,
				orderBy: [{ lastName: "asc" }, { foreName: "asc" }],
			});
			return employees
				.filter(e => e.foreName || e.lastName) // Filter out completely empty names
				.map(e => ({
					id: e.id,
					fullName: `${e.foreName || "Unknown"} ${e.lastName || "Employee"}`.trim(),
				}));
		}),
	getCurrentUser: publicProcedure
		.meta({
			openapi: {
				method: "GET",
				path: "/profiles/current",
				tags: ["profiles"],
				summary: "Get the current user's profile (disabled - auth removed)",
			},
		})
		.query(async ({ ctx }) => {
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "getCurrentUser is disabled since authentication was removed",
			});
		}),
	getByClerkId: publicProcedure
		.input(z.object({ clerkId: z.string() }))
		.query(async ({ ctx, input }) => {
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "getByClerkId is disabled since authentication was removed",
			});
		}),
});
