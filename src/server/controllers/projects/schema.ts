import { z } from "zod";

export const projectsSchema = z.object({
	id: z.string(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	type: z.string().optional(),
	title: z.string().optional(),
	referenceApproval: z.boolean().optional().default(false),
	teamSize: z.coerce.number().optional(),
	description: z.string().optional(),
	scopeAuditHours: z.coerce.number().optional(),
	contractBeginn: z.date().optional(),
	contractEnd: z.date().optional(),
	volumeEuroTotal: z.coerce.number().optional(),
	volumeEuroRetrieved: z.coerce.number().optional(),
	volumePTTotal: z.coerce.number().optional(),
	volumePTRetrieved: z.coerce.number().optional(),
	keywords: z.array(z.string()).default([]),
	projectIT: z.boolean().optional().default(false),
	projectIS: z.boolean().optional().default(false),
	projectGS: z.boolean().optional().default(false),
	standards: z.array(z.string()).optional(),
	volumeHoursTotal: z.coerce.number().optional(),
	approvedMargin: z.coerce.number().optional(),
	firstContactDate: z.union([z.date(), z.string()]).optional().transform((val) => {
		if (!val) return undefined;
		if (typeof val === 'string') return new Date(val);
		return val;
	}),
	serviceDate: z.union([z.date(), z.string()]).optional().transform((val) => {
		if (!val) return undefined;
		if (typeof val === 'string') return new Date(val);
		return val;
	}),
	evbItContractNumber: z.string().optional(),
	evbItContractLocation: z.string().optional(),
});

export type T_Projects = z.infer<typeof projectsSchema>;