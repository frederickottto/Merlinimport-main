import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

// Schema definition
export const conceptSchema = z.object({
    id: z.string(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    title: z.string(),
    description: z.string(),
    type: z.string(),
    status: z.string().optional(),
    textMaturity: z.boolean().optional(),
    wordCount: z.number().optional(),
    language: z.array(z.string()),
    genderNeutral: z.boolean().optional(),
    professionalTone: z.boolean().optional(),
    containsGraphics: z.boolean().optional(),
    keywords: z.array(z.string()).optional(),
    notes: z.string().optional(),
    templateIDs: z.array(z.string()).optional(),
});

export type T_Concept = z.infer<typeof conceptSchema>;

export const conceptsRouter = createTRPCRouter({
    all: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/concepts",
                tags: ["concepts"],
                summary: "Get all concepts",
            },
        })
        .query(async ({ ctx }) => {
            try {
                const concepts = await ctx.db.deliverables.findMany({
                    where: {
                        type: "concept"
                    },
                    include: {
                        template: true
                    }
                });
                return concepts;
            } catch (error) {
                console.error("Error in all:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch concepts",
                });
            }
        }),

    getById: publicProcedure
        .meta({
            openapi: {
                method: "GET",
                path: "/concepts/{id}",
                tags: ["concepts"],
                summary: "Get concept by ID",
            },
        })
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                console.log("Attempting to fetch concept with ID:", input.id);
                
                const concept = await ctx.db.deliverables.findFirst({
                    where: {
                        id: input.id,
                        type: "concept"
                    },
                    include: {
                        template: true
                    }
                });

                console.log("Query result:", concept);

                if (!concept) {
                    console.log("No concept found with ID:", input.id);
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Concept not found",
                    });
                }

                return concept;
            } catch (error) {
                console.error("Error in getById:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch concept",
                });
            }
        }),

    create: publicProcedure
        .meta({
            openapi: {
                method: "POST",
                path: "/concepts/new",
                tags: ["concepts"],
                summary: "Create a new concept",
            },
        })
        .input(conceptSchema.omit({ id: true, createdAt: true, updatedAt: true }))
        .mutation(async ({ ctx, input }) => {
            try {
                const concept = await ctx.db.deliverables.create({
                    data: {
                        ...input,
                        type: "concept",
                        template: {
                            connect: input.templateIDs?.map(id => ({ id })) || []
                        }
                    },
                    include: {
                        template: true
                    }
                });
                return concept;
            } catch (error) {
                console.error("Error in create:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to create concept",
                });
            }
        }),

    update: publicProcedure
        .meta({
            openapi: {
                method: "PUT",
                path: "/concepts/{id}",
                tags: ["concepts"],
                summary: "Update a concept",
            },
        })
        .input(z.object({
            id: z.string(),
            data: conceptSchema.omit({ id: true, createdAt: true, updatedAt: true }),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const { id, data } = input;
                const concept = await ctx.db.deliverables.update({
                    where: { id },
                    data: {
                        ...data,
                        type: "concept",
                        template: {
                            set: data.templateIDs?.map(id => ({ id })) || []
                        }
                    },
                    include: {
                        template: true
                    }
                });
                return concept;
            } catch (error) {
                console.error("Error in update:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to update concept",
                });
            }
        }),

    delete: publicProcedure
        .meta({
            openapi: {
                method: "DELETE",
                path: "/concepts/{id}",
                tags: ["concepts"],
                summary: "Delete a concept",
            },
        })
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const concept = await ctx.db.deliverables.delete({
                    where: { id: input.id }
                });
                return concept;
            } catch (error) {
                console.error("Error in delete:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to delete concept",
                });
            }
        }),
});
