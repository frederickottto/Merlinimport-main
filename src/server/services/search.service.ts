import { PrismaClient, Prisma } from "@prisma/client"
import { z } from "zod"

const searchInputSchema = z.object({
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
          experience: z
            .object({
              it: z.array(z.number()).optional(),
              is: z.array(z.number()).optional(),
              itgs: z.array(z.number()).optional(),
              gps: z.array(z.number()).optional(),
              other: z.array(z.number()).optional(),
            })
            .optional(),
          division: z.array(z.string()).optional(),
          certificates: z.array(z.string()).optional(),
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
      organisationContacts: z
        .object({
          organisation: z.array(z.string()).optional(),
          role: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
  sortBy: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
})

type SearchInput = z.infer<typeof searchInputSchema>
type SearchFilters = NonNullable<SearchInput["filters"]>

export class SearchService {
  constructor(private prisma: PrismaClient) {}

  async search(input: unknown) {
    const validatedInput = searchInputSchema.parse(input)
    const { model, query, filters, sortBy, page = 1, limit = 10 } = validatedInput
    const skip = (page - 1) * limit

    switch (model) {
      case "employees":
        return this.searchEmployees(query, filters?.employees, sortBy, skip, limit, page)
      case "organisations":
        return this.searchOrganisations(query, filters?.organisations, sortBy, skip, limit, page)
      case "projects":
        return this.searchProjects(query, filters?.projects, sortBy, skip, limit, page)
      case "callToTender":
        return this.searchCallToTender(query, filters?.callToTender, sortBy, skip, limit, page)
      case "tasks":
        return this.searchTasks(query, filters?.tasks, sortBy, skip, limit, page)
      case "organisationContacts":
        return this.searchOrganisationContacts(query, filters?.organisationContacts, sortBy, skip, limit, page)
      default:
        throw new Error(`Unsupported model: ${model}`)
    }
  }

  private async searchEmployees(
    query: string,
    filters: SearchFilters["employees"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.EmployeeWhereInput = {
      OR: [
        { foreName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ],
      ...(filters?.employeeRank && {
        employeeRank: { id: { in: filters.employeeRank } },
      }),
      ...(filters?.location && {
        location: {
          city: {
            in: filters.location.map(loc => loc.charAt(0).toUpperCase() + loc.slice(1))
          }
        },
      }),
      ...(filters?.skills && {
        employeeSkills: { some: { skills: { id: { in: filters.skills } } } },
      }),
      ...(filters?.certificates && {
        employeeCertificates: { some: { certificate: { id: { in: filters.certificates } } } },
      }),
      ...(filters?.experience && {
        ...(filters.experience.it && {
          experienceIt: {
            gte: filters.experience.it[0],
            lte: filters.experience.it[1],
          },
        }),
        ...(filters.experience.is && {
          experienceIs: {
            gte: filters.experience.is[0],
            lte: filters.experience.is[1],
          },
        }),
        ...(filters.experience.itgs && {
          experienceItGs: {
            gte: filters.experience.itgs[0],
            lte: filters.experience.itgs[1],
          },
        }),
        ...(filters.experience.gps && {
          experienceGps: {
            gte: filters.experience.gps[0],
            lte: filters.experience.gps[1],
          },
        }),
        ...(filters.experience.other && {
          experienceOther: {
            gte: filters.experience.other[0],
            lte: filters.experience.other[1],
          },
        }),
      }),
      ...(filters?.division && {
        division: { id: { in: filters.division } },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? [
          { lastName: sortDirection as Prisma.SortOrder },
          { foreName: sortDirection as Prisma.SortOrder }
        ]
      : sortField === "name"
        ? [
            { lastName: sortDirection as Prisma.SortOrder },
            { foreName: sortDirection as Prisma.SortOrder }
          ]
        : sortField === "createdAt"
          ? { createdAt: sortDirection as Prisma.SortOrder }
          : sortField 
            ? { [sortField]: sortDirection as Prisma.SortOrder } 
            : undefined

    const [total, items] = await Promise.all([
      this.prisma.employee.count({ where }),
      this.prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          employeeRank: true,
          location: true,
          employeeSkills: {
            include: {
              skills: true,
            },
          },
          employeeCertificates: {
            include: {
              certificate: true,
            },
          },
          division: true,
        },
      }),
    ])

    // Transform the data to match SearchResultItem interface
    const transformedItems = items.map(item => ({
      id: item.id,
      foreName: item.foreName,
      lastName: item.lastName,
      name: `${item.foreName} ${item.lastName}`,
      description: item.description,
      location: item.location,
      createdAt: item.createdAt,
      employeeRank: item.employeeRank,
      employeeSkills: item.employeeSkills,
      employeeCertificates: item.employeeCertificates,
      division: item.division,
    }))

    return {
      total,
      items: transformedItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async searchOrganisations(
    query: string,
    filters: SearchFilters["organisations"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.OrganisationWhereInput = {
      OR: [
        { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { abbreviation: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { industrySector: { some: { industrySector: { contains: query, mode: Prisma.QueryMode.insensitive } } } },
      ],
      ...(filters?.industrySector && {
        industrySector: { some: { id: { in: filters.industrySector } } },
      }),
      ...(filters?.location && {
        location: { id: { in: filters.location } },
      }),
      ...(filters?.employeeNumber && {
        employeeNumber: {
          gte: filters.employeeNumber[0],
          lte: filters.employeeNumber[1],
        },
      }),
      ...(filters?.annualReturn && {
        anualReturn: {
          gte: filters.annualReturn[0],
          lte: filters.annualReturn[1],
        },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? { name: sortDirection as Prisma.SortOrder }
      : sortField 
        ? { [sortField]: sortDirection as Prisma.SortOrder } 
        : undefined

    const [total, items] = await Promise.all([
      this.prisma.organisation.count({ where }),
      this.prisma.organisation.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          industrySector: true,
          location: true,
          parentOrganisation: true,
        },
      }),
    ])

    // Transform the data to match SearchResultItem interface
    const transformedItems = items.map(item => ({
      id: item.id,
      name: item.name,
      title: item.name,
      location: item.location,
      createdAt: item.createdAt,
      organisation: {
        name: item.name,
        website: item.website,
        legalType: item.legalType,
        parentOrganisation: item.parentOrganisation ? {
          name: item.parentOrganisation.name
        } : null
      },
      employeeNumber: item.employeeNumber,
      annualReturn: item.anualReturn,
      industrySector: item.industrySector
    }))

    return {
      total,
      items: transformedItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async searchProjects(
    query: string,
    filters: SearchFilters["projects"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.ProjectWhereInput = {
      OR: [
        { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { organisation: { some: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } } },
        { keywords: { hasSome: [query] } },
      ],
      ...(filters?.type && { type: { in: filters.type } }),
      ...(filters?.dateRange && {
        contractBeginn: {
          gte: filters.dateRange.from,
          lte: filters.dateRange.to,
        },
      }),
      ...(filters?.volume?.euro && {
        volumeEuroTotal: {
          gte: filters.volume.euro[0],
          lte: filters.volume.euro[1],
        },
      }),
      ...(filters?.volume?.pt && {
        volumePTTotal: {
          gte: filters.volume.pt[0],
          lte: filters.volume.pt[1],
        },
      }),
      ...(filters?.volume?.hours && {
        volumeHoursTotal: {
          gte: filters.volume.hours[0],
          lte: filters.volume.hours[1],
        },
      }),
      ...(filters?.keywords && {
        keywords: { hasSome: filters.keywords },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? { title: sortDirection as Prisma.SortOrder }
      : sortField === "name"
        ? { title: sortDirection as Prisma.SortOrder }
        : sortField === "createdAt"
          ? { createdAt: sortDirection as Prisma.SortOrder }
          : sortField 
            ? { [sortField]: sortDirection as Prisma.SortOrder } 
            : undefined

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organisation: true,
          EmployeeProjectActivities: {
            include: {
              employee: true,
            },
          },
        },
      }),
    ])

    // Transform the data to match SearchResultItem interface
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title || null,
      description: item.description || null,
      createdAt: item.createdAt,
      organisation: item.organisation && item.organisation.length > 0 ? {
        name: item.organisation[0].name || null
      } : null,
      type: item.type,
      volume: {
        euro: item.volumeEuroTotal,
        pt: item.volumePTTotal,
        hours: item.volumeHoursTotal
      },
      keywords: item.keywords || []
    }))

    return {
      total,
      items: transformedItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async searchCallToTender(
    query: string,
    filters: SearchFilters["callToTender"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.CallToTenderWhereInput = {
      OR: [
        { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { shortDescription: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { awardCriteria: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { notes: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { organisations: { some: { organisation: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } } } },
        { keywords: { hasSome: [query] } },
        { tag: { hasSome: [query] } },
      ],
      ...(filters?.type && filters.type.length > 0 && { type: { in: filters.type } }),
      ...(filters?.status && filters.status.length > 0 && { status: { in: filters.status } }),
      ...(filters?.offerDeadlineRange?.from && {
        offerDeadline: {
          gte: filters.offerDeadlineRange.from,
          ...(filters.offerDeadlineRange.to && { lte: filters.offerDeadlineRange.to }),
        },
      }),
      ...(filters?.bindingDeadlineRange?.from && {
        bindingDeadline: {
          gte: filters.bindingDeadlineRange.from,
          ...(filters.bindingDeadlineRange.to && { lte: filters.bindingDeadlineRange.to }),
        },
      }),
      ...(filters?.volume?.euro && {
        volumeEuro: {
          gte: filters.volume.euro[0],
          lte: filters.volume.euro[1],
        },
      }),
      ...(filters?.volume?.pt && {
        volumePT: {
          gte: filters.volume.pt[0],
          lte: filters.volume.pt[1],
        },
      }),
      ...(filters?.volume?.hours && {
        volumeHours: {
          gte: filters.volume.hours[0],
          lte: filters.volume.hours[1],
        },
      }),
      ...(filters?.successChance && {
        successChance: {
          gte: filters.successChance[0],
          lte: filters.successChance[1],
        },
      }),
      ...(filters?.keywords && filters.keywords.length > 0 && {
        keywords: { hasSome: filters.keywords },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? { title: sortDirection as Prisma.SortOrder }
      : sortField === "name"
        ? { title: sortDirection as Prisma.SortOrder }
        : sortField === "createdAt"
          ? { createdAt: sortDirection as Prisma.SortOrder }
          : sortField 
            ? { [sortField]: sortDirection as Prisma.SortOrder } 
            : undefined

    const [total, items] = await Promise.all([
      this.prisma.callToTender.count({ where }),
      this.prisma.callToTender.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organisations: {
            include: {
              organisation: true,
            },
          },
          employees: {
            include: {
              employee: true,
            },
          },
        },
      }),
    ])

    // Transform the data to match SearchResultItem interface
    const transformedItems = items.map(item => ({
      id: item.id,
      title: item.title || null,
      description: item.shortDescription || null,
      createdAt: item.createdAt,
      organisation: item.organisations && item.organisations.length > 0 ? {
        name: item.organisations[0].organisation.name || null
      } : null,
      status: item.status,
      type: item.type,
      offerDeadline: item.offerDeadline,
      bindingDeadline: item.bindingDeadline,
      volume: {
        euro: item.volumeEuro,
        pt: item.volumePT,
        hours: item.volumeHours
      },
      successChance: item.successChance,
      keywords: item.keywords || []
    }))

    return {
      total,
      items: transformedItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async searchTasks(
    query: string,
    filters: SearchFilters["tasks"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.TaskWhereInput = {
      OR: [
        { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
      ],
      ...(filters?.status && { status: { in: filters.status } }),
      ...(filters?.assignee && { assignedToId: { in: filters.assignee } }),
      ...(filters?.dueDate && {
        dueDate: {
          gte: filters.dueDate.from,
          lte: filters.dueDate.to,
        },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? { title: sortDirection as Prisma.SortOrder }
      : sortField === "name"
        ? { title: sortDirection as Prisma.SortOrder }
        : sortField === "createdAt"
          ? { createdAt: sortDirection as Prisma.SortOrder }
          : sortField 
            ? { [sortField]: sortDirection as Prisma.SortOrder } 
            : undefined

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          assignedTo: true,
          createdBy: true,
          tender: true,
        },
      }),
    ])

    return {
      total,
      items,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  private async searchOrganisationContacts(
    query: string,
    filters: SearchFilters["organisationContacts"] | undefined,
    sortBy: string | undefined,
    skip: number,
    limit: number,
    page: number
  ) {
    const where: Prisma.OrganisationContactsWhereInput = {
      OR: [
        { foreName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { lastName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { mobile: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { telephone: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { position: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { department: { contains: query, mode: Prisma.QueryMode.insensitive } },
        { organisation: { some: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } } },
      ],
      ...(filters?.organisation && {
        organisation: { some: { id: { in: filters.organisation } } },
      }),
      ...(filters?.role && {
        position: { in: filters.role },
      }),
    }

    const [sortField, sortDirection] = sortBy?.split("-") ?? ["relevance", "asc"]
    const orderBy = sortField === "relevance" 
      ? [
          { lastName: sortDirection as Prisma.SortOrder },
          { foreName: sortDirection as Prisma.SortOrder }
        ]
      : sortField === "name"
        ? [
            { lastName: sortDirection as Prisma.SortOrder },
            { foreName: sortDirection as Prisma.SortOrder }
          ]
        : sortField === "createdAt"
          ? { createdAt: sortDirection as Prisma.SortOrder }
          : sortField 
            ? { [sortField]: sortDirection as Prisma.SortOrder } 
            : undefined

    const [total, items] = await Promise.all([
      this.prisma.organisationContacts.count({ where }),
      this.prisma.organisationContacts.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          organisation: true,
        },
      }),
    ])

    // Transform the data to match SearchResultItem interface
    const transformedItems = items.map((item) => ({
      id: item.id,
      name: `${item.foreName} ${item.lastName}`,
      title: item.position || null,
      description: item.email || null,
      createdAt: item.createdAt,
      organisation: item.organisation && item.organisation.length > 0 ? {
        name: item.organisation[0].name || null
      } : null
    }))

    return {
      total,
      items: transformedItems,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }
} 