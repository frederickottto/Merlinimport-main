import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc"
import { SearchService } from "@/server/services/search.service"
//import { PrismaClient } from "@prisma/client"

import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()
const searchService = new SearchService(prisma)

export const searchRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        model: z.enum([
          "employees",
          "organisations",
          "projects",
          "callToTender",
          "tasks",
          "organisationContacts"
        ]),
        query: z.string(),
        filters: z
          .object({
            employees: z
              .object({
                employeeRank: z.array(z.string()).optional(),
                location: z.array(z.string()).optional(),
                skills: z.array(z.string()).optional(),
                certificates: z.array(z.string()).optional(),
                experience: z
                  .object({
                    it: z.tuple([z.number(), z.number()]).optional(),
                    is: z.tuple([z.number(), z.number()]).optional(),
                    itgs: z.tuple([z.number(), z.number()]).optional(),
                    gps: z.tuple([z.number(), z.number()]).optional(),
                    other: z.tuple([z.number(), z.number()]).optional(),
                  })
                  .optional(),
                division: z.array(z.string()).optional(),
              })
              .optional(),
            organisations: z
              .object({
                industrySector: z.array(z.string()).optional(),
                location: z.array(z.string()).optional(),
                employeeNumber: z.tuple([z.number(), z.number()]).optional(),
                annualReturn: z.tuple([z.number(), z.number()]).optional(),
              })
              .optional(),
            projects: z
              .object({
                type: z.array(z.string()).optional(),
                status: z.array(z.string()).optional(),
                dateRange: z
                  .object({
                    from: z.date().optional(),
                    to: z.date().optional(),
                  })
                  .optional(),
                volume: z
                  .object({
                    euro: z.tuple([z.number(), z.number()]).optional(),
                    pt: z.tuple([z.number(), z.number()]).optional(),
                    hours: z.tuple([z.number(), z.number()]).optional(),
                  })
                  .optional(),
                keywords: z.array(z.string()).optional(),
              })
              .optional(),
            callToTender: z
              .object({
                type: z.array(z.string()).optional(),
                status: z.array(z.string()).optional(),
                offerDeadlineRange: z
                  .object({
                    from: z.date().optional(),
                    to: z.date().optional(),
                  })
                  .optional(),
                bindingDeadlineRange: z
                  .object({
                    from: z.date().optional(),
                    to: z.date().optional(),
                  })
                  .optional(),
                volume: z
                  .object({
                    euro: z.tuple([z.number(), z.number()]).optional(),
                    pt: z.tuple([z.number(), z.number()]).optional(),
                    hours: z.tuple([z.number(), z.number()]).optional(),
                  })
                  .optional(),
                successChance: z.tuple([z.number(), z.number()]).optional(),
                keywords: z.array(z.string()).optional(),
              })
              .optional(),
            tasks: z
              .object({
                status: z.array(z.string()).optional(),
                assignee: z.array(z.string()).optional(),
                dueDate: z
                  .object({
                    from: z.date().optional(),
                    to: z.date().optional(),
                  })
                  .optional(),
              })
              .optional(),
            certificates: z
              .object({
                type: z.array(z.string()).optional(),
                category: z.array(z.string()).optional(),
                salesCertificate: z.boolean().optional(),
              })
              .optional(),
            divisions: z
              .object({
                parentDivision: z.array(z.string()).optional(),
                manager: z.array(z.string()).optional(),
              })
              .optional(),
          })
          .optional(),
        sortBy: z.string().optional(),
        page: z.number().min(1).optional(),
        limit: z.number().min(1).max(100).optional(),
      }),
    )
    .query(async ({ input }) => {
      return searchService.search(input)
    }),
}) 