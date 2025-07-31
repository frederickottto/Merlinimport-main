import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const templatesRouter = createTRPCRouter({
    all: publicProcedure
        .input(z.object({ q: z.string().optional() }).optional())
        .query(async ({ ctx }) => {
            const templates = await ctx.db.template.findMany({
                include: {
                    deliverables: true,
                    callToTender: true
                }
            });

            return templates;
        }),

    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const template = await ctx.db.template.findUnique({
                    where: { id: input.id },
                    include: {
                        deliverables: true
                    }
                });

                if (!template) {
                    throw new TRPCError({
                        code: "NOT_FOUND",
                        message: "Template not found",
                    });
                }

                return {
                    ...template,
                    conceptIDs: template.deliverables.map(d => d.id)
                };
            } catch (error: unknown) {
                console.error("Error in getById:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to fetch template",
                });
            }
        }),

    update: publicProcedure
        .input(z.object({
            id: z.string(),
            data: z.object({
                title: z.string(),
                type: z.string(),
                description: z.string().optional(),
                filePath: z.string(),
                keywords: z.array(z.string()).optional(),
                notes: z.string().optional(),
                conceptIDs: z.array(z.string()).optional(),
            }),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const { conceptIDs, ...data } = input.data;
                const template = await ctx.db.template.update({
                    where: { id: input.id },
                    data: {
                        ...data,
                        deliverables: {
                            set: conceptIDs?.map(id => ({ id })) || []
                        }
                    },
                    include: {
                        deliverables: true
                    }
                });
                return {
                    ...template,
                    conceptIDs: template.deliverables.map(d => d.id)
                };
            } catch (error: unknown) {
                console.error("Error in update:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to update template",
                });
            }
        }),

    delete: publicProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const template = await ctx.db.template.delete({
                    where: { id: input.id }
                });
                return template;
            } catch (error: unknown) {
                console.error("Error in delete:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Unable to delete template",
                });
            }
        }),

    create: publicProcedure
        .input(z.object({
            title: z.string(),
            type: z.string(),
            description: z.string().optional(),
            filePath: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            notes: z.string().optional(),
            conceptIDs: z.array(z.string()).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const { conceptIDs, ...data } = input;
                const template = await ctx.db.template.create({
                    data: {
                        ...data,
                        filePath: data.filePath || "",
                        keywords: data.keywords || [],
                        notes: data.notes || "",
                        deliverables: {
                            connect: conceptIDs?.map(id => ({ id })) || []
                        }
                    },
                    include: {
                        deliverables: true
                    }
                });
                return {
                    ...template,
                    conceptIDs: template.deliverables.map(d => d.id)
                };
            } catch (error: unknown) {
                console.error("Error in create:", error);
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Failed to create template",
                });
            }
        }),
});
