import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createConditionsOfParticipationSchema } from "@/server/controllers/tender/conditionsOfParticipation/schema";

export const conditionsOfParticipationRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.conditionsOfParticipation.findMany({
      include: {
        callToTender: true,
        conditionsOfParticipationType: true,
        certificate: true,
        industrySector: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.db.conditionsOfParticipation.findUnique({
        where: { id: input.id },
        include: {
          callToTender: true,
          conditionsOfParticipationType: true,
          certificate: true,
          industrySector: true,
        },
      });
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Condition of Participation not found",
        });
      }
      return item;
    }),

  getByTenderId: publicProcedure
    .input(z.object({ tenderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.conditionsOfParticipation.findMany({
        where: { callToTenderIDs: input.tenderId },
        include: {
          conditionsOfParticipationType: true,
          certificate: true,
          industrySector: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  create: publicProcedure
    .input(createConditionsOfParticipationSchema)
    .mutation(async ({ ctx, input }) => {
      // Ensure required fields are present
      if (!input.conditionsOfParticipationTypeIDs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "conditionsOfParticipationTypeIDs is required",
        });
      }
      if (!input.callToTenderIDs) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "callToTenderIDs is required",
        });
      }
      if (!input.title) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "title is required",
        });
      }

      const cop = await ctx.db.conditionsOfParticipation.create({
        data: {
          title: input.title,
          duration: input.duration ?? null,
          volumeEuro: input.volumeEuro ?? null,
          requirements: input.requirements ?? null,
          experienceIt: input.experienceIt ?? null,
          experienceIs: input.experienceIs ?? null,
          experienceItGs: input.experienceItGs ?? null,
          experienceGPS: input.experienceGPS ?? null,
          experienceOther: input.experienceOther ?? null,
          experienceAll: input.experienceAll ?? null,
          executivePosition: input.executivePosition ?? null,
          academicDegree: input.academicDegree ?? [],
          academicStudy: input.academicStudy ?? [],
          conditionsOfParticipationTypeIDs: input.conditionsOfParticipationTypeIDs,
          callToTenderIDs: input.callToTenderIDs,
          certificateIDs: input.certificateIDs ?? [],
          industrySectorIDs: input.industrySectorIDs ?? [],
          criterionType: input.criterionType ?? null,
        },
      });

      // --- AUTO-MATCHING LOGIC ---
      // 1. Employees (Profiles)
      console.log('Starting employee matching with criteria:', {
        experienceIt: input.experienceIt,
        experienceIs: input.experienceIs,
        experienceItGs: input.experienceItGs,
        experienceGPS: input.experienceGPS,
        experienceOther: input.experienceOther,
        experienceAll: input.experienceAll,
        certificateIDs: input.certificateIDs,
        industrySectorIDs: input.industrySectorIDs,
        academicDegree: input.academicDegree,
        executivePosition: input.executivePosition
      });

      const employees = await ctx.db.employee.findMany({
        where: {
          OR: [
            // Experience requirements - match if any experience type meets the requirement
            {
              OR: [
                { experienceIt: { gte: input.experienceIt ?? 0 } },
                { experienceIs: { gte: input.experienceIs ?? 0 } },
                { experienceItGs: { gte: input.experienceItGs ?? 0 } },
                { experienceGps: { gte: input.experienceGPS ?? 0 } },
                { experienceOther: { gte: input.experienceOther ?? 0 } },
                { experienceAll: { gte: input.experienceAll ?? 0 } },
              ],
            },
            // Certificates - match if has any of the required certificates
            input.certificateIDs && input.certificateIDs.length > 0
              ? {
                  employeeCertificates: {
                    some: { certificateIDs: { in: input.certificateIDs } },
                  },
                }
              : {},
            // Industry sectors - match if has any of the required sectors
            input.industrySectorIDs && input.industrySectorIDs.length > 0
              ? {
                  professionalBackground: {
                    some: { industrySectorIDs: { in: input.industrySectorIDs } },
                  },
                }
              : {},
            // Academic degrees - match if has any of the required degrees
            input.academicDegree && input.academicDegree.length > 0
              ? {
                  academicDegree: {
                    some: { degreeTitleShort: { in: input.academicDegree } },
                  },
                }
              : {},
            // Executive position - only check if specifically required
            input.executivePosition
              ? {
                  professionalBackground: {
                    some: { executivePosition: true },
                  },
                }
              : {},
          ],
        },
      });

      console.log('Found matching employees:', employees.length);
      if (employees.length > 0) {
        console.log('First matching employee:', {
          id: employees[0].id,
          name: `${employees[0].foreName} ${employees[0].lastName}`,
          experience: {
            it: employees[0].experienceIt,
            is: employees[0].experienceIs,
            itgs: employees[0].experienceItGs,
            gps: employees[0].experienceGps,
            other: employees[0].experienceOther,
            all: employees[0].experienceAll
          }
        });
      }

      // Create employee matches and update with autoSelected
      await Promise.all(employees.map(async (emp) => {
        const defaultRole = await ctx.db.employeeRole.findFirst({
          where: { role: "Project Team Member" }
        }) || await ctx.db.employeeRole.create({
          data: {
            role: "Project Team Member"
          }
        });

        return ctx.db.callToTenderEmployee.create({
          data: {
            employeeId: emp.id,
            callToTenderId: input.callToTenderIDs,
            employeeCallToTenderRole: defaultRole.role ?? "Project Team Member",
            role: defaultRole.role ?? "Project Team Member",
            description: "Auto-matched based on criteria",
            autoSelected: true
          }
        });
      }));

      // 2. Projects
      console.log('Starting project matching with criteria:', {
        requirements: input.requirements,
        industrySectorIDs: input.industrySectorIDs,
        volumeEuro: input.volumeEuro,
        duration: input.duration
      });

      const projects = await ctx.db.project.findMany({
        where: {
          OR: [
            // Keywords from requirements - match if any keyword matches
            input.requirements
              ? {
                  keywords: {
                    hasSome: input.requirements
                      .split(/\s+/)
                      .filter((word) => word.length > 3)
                      .map((word) => word.toLowerCase()),
                  },
                }
              : {},
            // Industry sectors - match if any sector matches
            input.industrySectorIDs && input.industrySectorIDs.length > 0
              ? {
                  organisation: {
                    some: {
                      industrySector: {
                        some: { id: { in: input.industrySectorIDs } },
                      },
                    },
                  },
                }
              : {},
            // Volume requirements - match if project volume is within 20% of required volume
            input.volumeEuro
              ? {
                  volumeEuroTotal: {
                    gte: input.volumeEuro * 0.8, // 20% lower bound
                    lte: input.volumeEuro * 1.2, // 20% upper bound
                  },
                }
              : {},
            // Duration requirements - match if project duration is within 20% of required duration
            input.duration
              ? {
                  contractEnd: {
                    gte: new Date(Date.now() + input.duration * 0.8 * 24 * 60 * 60 * 1000), // 20% lower bound
                    lte: new Date(Date.now() + input.duration * 1.2 * 24 * 60 * 60 * 1000), // 20% upper bound
                  },
                }
              : {},
          ],
        },
      });

      console.log('Found matching projects:', projects.length);
      if (projects.length > 0) {
        console.log('First matching project:', {
          id: projects[0].id,
          title: projects[0].title,
          keywords: projects[0].keywords,
          volumeEuroTotal: projects[0].volumeEuroTotal,
          duration: projects[0].contractEnd && projects[0].contractBeginn ? 
            Math.round((projects[0].contractEnd.getTime() - projects[0].contractBeginn.getTime()) / (24 * 60 * 60 * 1000)) : 
            null
        });
      }

      // Create project matches and update with autoSelected
      await Promise.all(projects.map(async (proj) => {
        const match = await ctx.db.callToTenderProject.create({
          data: {
            projectId: proj.id,
            callToTenderId: input.callToTenderIDs,
            description: "Auto-matched based on criteria"
          }
        });

        // Update with autoSelected flag
        return ctx.db.callToTenderProject.update({
          where: { id: match.id },
          data: { autoSelected: true }
        });
      }));

      // 3. Deliverables (Concepts)
      console.log('Starting deliverable matching with criteria:', {
        requirements: input.requirements,
        criterionType: input.criterionType
      });

      const deliverables = await ctx.db.deliverables.findMany({
        where: {
          OR: [
            // Text matching from requirements - improved matching
            input.requirements
              ? {
                  OR: [
                    // Match in title
                    {
                      title: {
                        contains: input.requirements,
                        mode: 'insensitive'
                      }
                    },
                    // Match in description
                    {
                      description: {
                        contains: input.requirements,
                        mode: 'insensitive'
                      }
                    },
                    // Match in keywords
                    {
                      keywords: {
                        hasSome: input.requirements
                          .split(/\s+/)
                          .filter((word) => word.length > 3)
                          .map((word) => word.toLowerCase()),
                      },
                    },
                  ],
                }
              : {},
            // Type matching - only check if specifically required
            input.criterionType ? { type: input.criterionType } : {},
          ],
        },
      });

      console.log('Found matching deliverables:', deliverables.length);
      if (deliverables.length > 0) {
        console.log('First matching deliverable:', {
          id: deliverables[0].id,
          title: deliverables[0].title,
          type: deliverables[0].type,
          keywords: deliverables[0].keywords,
          description: deliverables[0].description?.substring(0, 100) + '...'
        });
      }

      // Create deliverable matches and update with autoSelected
      await Promise.all(deliverables.map(async (del) => {
        const match = await ctx.db.callToTenderDeliverables.create({
          data: {
            deliverablesIDs: del.id,
            callToTenderIDs: input.callToTenderIDs
          }
        });

        // Update with autoSelected flag
        return ctx.db.callToTenderDeliverables.update({
          where: { id: match.id },
          data: { autoSelected: true }
        });
      }));

      return cop;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        duration: z.number().optional(),
        volumeEuro: z.number().optional(),
        requirements: z.string().optional(),
        experienceIt: z.number().optional(),
        experienceIs: z.number().optional(),
        experienceItGs: z.number().optional(),
        experienceGPS: z.number().optional(),
        experienceOther: z.number().optional(),
        experienceAll: z.number().optional(),
        executivePosition: z.boolean().optional(),
        academicDegree: z.array(z.string()).optional(),
        academicStudy: z.array(z.string()).optional(),
        conditionsOfParticipationTypeIDs: z.string().optional(),
        callToTenderIDs: z.string().optional(),
        certificateIDs: z.array(z.string()).optional(),
        industrySectorIDs: z.array(z.string()).optional(),
        criterionType: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await ctx.db.conditionsOfParticipation.update({
        where: { id },
        data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.conditionsOfParticipation.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
}); 