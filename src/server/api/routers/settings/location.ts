import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Input schema for location
const locationInputSchema = z.object({
	street: z.string(),
	houseNumber: z.string(),
	postCode: z.string(),
	city: z.string(),
	region: z.string(),
	country: z.string(),
});

export const locationRouter = createTRPCRouter({
	getAll: publicProcedure.query(async ({ ctx }) => {
		try {
			const items = await ctx.db.location.findMany({
				orderBy: { city: "asc" },
			});
			
			// Transform items to include the formatted name
			return items.map(item => ({
				...item,
				name: `${item.street} ${item.houseNumber}, ${item.city}`,
				postalCode: item.postCode,
				createdAt: item.createdAt ?? new Date(),
				updatedAt: item.updatedAt ?? new Date(),
			}));
		} catch (error: unknown) {
			console.error("Error fetching locations:", error);
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Unable to fetch locations",
			});
		}
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			try {
				const item = await ctx.db.location.findUnique({
					where: { id: input.id },
				});

				if (!item) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Location not found",
					});
				}

				// Transform item to include the formatted name
				return {
					...item,
					name: `${item.street} ${item.houseNumber}, ${item.city}`,
					postalCode: item.postCode,
					createdAt: item.createdAt ?? new Date(),
					updatedAt: item.updatedAt ?? new Date(),
				};
			} catch (error: unknown) {
				if (error instanceof TRPCError) throw error;
				console.error("Error fetching location:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to fetch location",
				});
			}
		}),

	create: publicProcedure
		.input(locationInputSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const item = await ctx.db.location.create({
					data: input,
				});

				// Transform the created item
				return {
					...item,
					name: `${item.street} ${item.houseNumber}, ${item.city}`,
					postalCode: item.postCode,
					createdAt: item.createdAt ?? new Date(),
					updatedAt: item.updatedAt ?? new Date(),
				};
			} catch (error: unknown) {
				console.error("Error creating location:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to create location",
				});
			}
		}),

	update: publicProcedure
		.input(z.object({
			id: z.string(),
			...locationInputSchema.partial().shape,
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				const { id, ...data } = input;
				const item = await ctx.db.location.update({
					where: { id },
					data,
				});

				// Transform the updated item
				return {
					...item,
					name: `${item.street} ${item.houseNumber}, ${item.city}`,
					postalCode: item.postCode,
					createdAt: item.createdAt ?? new Date(),
					updatedAt: item.updatedAt ?? new Date(),
				};
			} catch (error: unknown) {
				console.error("Error updating location:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to update location",
				});
			}
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			try {
				await ctx.db.location.delete({
					where: { id: input.id },
				});
				return { success: true, message: "Location deleted successfully" };
			} catch (error: unknown) {
				console.error("Error deleting location:", error);
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to delete location",
				});
			}
		}),
}); 