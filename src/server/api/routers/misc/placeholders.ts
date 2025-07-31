import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { DELIVERABLES_PLACEHOLDERS } from "@/lib/deliverables-placeholders";
import { EMPLOYEE_PLACEHOLDERS } from "@/lib/employee-placeholders";
import { PROJECT_PLACEHOLDERS } from "@/lib/project-placeholders";

export const placeholdersRouter = createTRPCRouter({
  // Get all placeholders for a specific type
  getByType: publicProcedure
    .input(z.object({
      type: z.enum(['deliverables', 'employee', 'project']),
    }))
    .query(async ({ input }) => {
      switch (input.type) {
        case 'deliverables':
          return DELIVERABLES_PLACEHOLDERS;
        case 'employee':
          return EMPLOYEE_PLACEHOLDERS;
        case 'project':
          return PROJECT_PLACEHOLDERS;
        default:
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid placeholder type",
          });
      }
    }),

  // Get placeholder data for a specific item
  getPlaceholderData: publicProcedure
    .input(z.object({
      type: z.enum(['project', 'employee', 'deliverables']),
      id: z.string(),
      placeholderIds: z.array(z.string())
    }))
    .query(async ({ ctx, input }) => {
      try {
        const data: Record<string, unknown> = {};

        switch (input.type) {
          case 'project': {
            if (input.id === 'all') {
              // Fetch all projects
              const projects = await ctx.db.project.findMany({
                include: {
                  organisation: {
                    include: {
                      location: true,
                      organisationContacts: true
                    }
                  },
                  EmployeeProjectActivities: true,
                  OrganisationProjectActivities: true,
                  organisationProjectsOrganisationRoles: true,
                  referenceTenders: true
                }
              });

              // Map all projects to placeholder data
              input.placeholderIds.forEach(placeholderId => {
                const values = projects.map(project => {
                  switch (placeholderId) {
                    case 'project_title': return project.title;
                    case 'project_description': return project.description;
                    case 'project_contract_start': return project.contractBeginn?.toISOString();
                    case 'project_contract_end': return project.contractEnd?.toISOString();
                    case 'project_first_contact_date': return project.firstContactDate?.toISOString();
                    case 'project_service_date': return project.serviceDate?.toISOString();
                    case 'project_organisation_name': return project.organisation?.[0]?.name;
                    case 'project_organisation_street': return project.organisation?.[0]?.location?.street;
                    case 'project_organisation_zip': return project.organisation?.[0]?.location?.postCode;
                    case 'project_organisation_city': return project.organisation?.[0]?.location?.city;
                    case 'project_organisation_country': return project.organisation?.[0]?.location?.country;
                    case 'project_organisation_website': return project.organisation?.[0]?.website;
                    case 'project_organisation_email': return project.organisation?.[0]?.organisationContacts?.[0]?.email;
                    case 'project_organisation_phone': return project.organisation?.[0]?.organisationContacts?.[0]?.telephone;
                    case 'project_organisation_fax': return project.organisation?.[0]?.organisationContacts?.[0]?.mobile;
                    default: return null;
                  }
                }).filter(Boolean);
                data[placeholderId] = values.join(', ');
              });
            } else {
              const project = await ctx.db.project.findUnique({
                where: { id: input.id },
                include: {
                  organisation: {
                    include: {
                      location: true,
                      organisationContacts: true
                    }
                  },
                  EmployeeProjectActivities: true,
                  OrganisationProjectActivities: true,
                  organisationProjectsOrganisationRoles: true,
                  referenceTenders: true
                }
              });

              if (!project) {
                throw new Error('Project not found');
              }

              // Map project data to placeholders
              input.placeholderIds.forEach(placeholderId => {
                switch (placeholderId) {
                  case 'project_title': data[placeholderId] = project.title;
                  case 'project_description': data[placeholderId] = project.description;
                  case 'project_contract_start': data[placeholderId] = project.contractBeginn?.toISOString();
                  case 'project_contract_end': data[placeholderId] = project.contractEnd?.toISOString();
                  case 'project_first_contact_date': data[placeholderId] = project.firstContactDate?.toISOString();
                  case 'project_service_date': data[placeholderId] = project.serviceDate?.toISOString();
                  case 'project_organisation_name': data[placeholderId] = project.organisation?.[0]?.name;
                  case 'project_organisation_street': data[placeholderId] = project.organisation?.[0]?.location?.street;
                  case 'project_organisation_zip': data[placeholderId] = project.organisation?.[0]?.location?.postCode;
                  case 'project_organisation_city': data[placeholderId] = project.organisation?.[0]?.location?.city;
                  case 'project_organisation_country': data[placeholderId] = project.organisation?.[0]?.location?.country;
                  case 'project_organisation_website': data[placeholderId] = project.organisation?.[0]?.website;
                  case 'project_organisation_email': data[placeholderId] = project.organisation?.[0]?.organisationContacts?.[0]?.email;
                  case 'project_organisation_phone': data[placeholderId] = project.organisation?.[0]?.organisationContacts?.[0]?.telephone;
                  case 'project_organisation_fax': data[placeholderId] = project.organisation?.[0]?.organisationContacts?.[0]?.mobile;
                }
              });
            }
            break;
          }
          case 'employee': {
            if (input.id === 'all') {
              // Fetch all employees
              const employees = await ctx.db.employee.findMany({
                include: {
                  location: true,
                  employeeRank: true,
                  employeeSkills: {
                    include: {
                      skills: true
                    }
                  },
                  employeeCertificates: {
                    include: {
                      certificate: true
                    }
                  },
                  academicDegree: true,
                  professionalBackground: true,
                  employeeProjectActivities: true,
                  employeeTrainings: true,
                  division: true
                }
              });

              // Map all employees to placeholder data
              input.placeholderIds.forEach(placeholderId => {
                const values = employees.map(employee => {
                  switch (placeholderId) {
                    case 'employee_name': return `${employee.foreName} ${employee.lastName}`;
                    case 'employee_title': return employee.employeeRank?.employeePositionLong;
                    case 'employee_division': return employee.division?.title;
                    case 'employee_skills': return employee.employeeSkills.map(es => es.skills.title).join(', ');
                    case 'employee_certificates': return employee.employeeCertificates.map(ec => ec.certificate.title).join(', ');
                    case 'employee_education': return employee.academicDegree.map(ad => ad.degreeTitleLong).join(', ');
                    case 'employee_experience': return employee.professionalBackground.map(pb => pb.position).join(', ');
                    case 'employee_projects': return employee.employeeProjectActivities.map(epa => epa.description).join(', ');
                    case 'employee_trainings': return employee.employeeTrainings.map(et => et.trainingID).join(', ');
                    default: return null;
                  }
                }).filter(Boolean);
                data[placeholderId] = values.join(', ');
              });
            } else {
              const employee = await ctx.db.employee.findUnique({
                where: { id: input.id },
                include: {
                  location: true,
                  employeeRank: true,
                  employeeSkills: {
                    include: {
                      skills: true
                    }
                  },
                  employeeCertificates: {
                    include: {
                      certificate: true
                    }
                  },
                  academicDegree: true,
                  professionalBackground: true,
                  employeeProjectActivities: true,
                  employeeTrainings: true,
                  division: true
                }
              });

              if (!employee) {
                throw new Error('Employee not found');
              }

              // Map employee data to placeholders
              input.placeholderIds.forEach(placeholderId => {
                switch (placeholderId) {
                  case 'employee_name': data[placeholderId] = `${employee.foreName} ${employee.lastName}`;
                  case 'employee_title': data[placeholderId] = employee.employeeRank?.employeePositionLong;
                  case 'employee_division': data[placeholderId] = employee.division?.title;
                  case 'employee_skills': data[placeholderId] = employee.employeeSkills.map(es => es.skills.title).join(', ');
                  case 'employee_certificates': data[placeholderId] = employee.employeeCertificates.map(ec => ec.certificate.title).join(', ');
                  case 'employee_education': data[placeholderId] = employee.academicDegree.map(ad => ad.degreeTitleLong).join(', ');
                  case 'employee_experience': data[placeholderId] = employee.professionalBackground.map(pb => pb.position).join(', ');
                  case 'employee_projects': data[placeholderId] = employee.employeeProjectActivities.map(epa => epa.description).join(', ');
                  case 'employee_trainings': data[placeholderId] = employee.employeeTrainings.map(et => et.trainingID).join(', ');
                }
              });
            }
            break;
          }
          case 'deliverables': {
            if (input.id === 'all') {
              // Fetch all deliverables
              const deliverables = await ctx.db.deliverables.findMany({
                include: {
                  template: true
                }
              });

              // Map all deliverables to placeholder data
              input.placeholderIds.forEach(placeholderId => {
                const values = deliverables.map(deliverable => {
                  switch (placeholderId) {
                    case 'deliverable_title': return deliverable.title;
                    case 'deliverable_description': return deliverable.description;
                    case 'deliverable_type': return deliverable.type;
                    case 'deliverable_status': return deliverable.status;
                    case 'deliverable_language': return deliverable.language.join(', ');
                    case 'deliverable_keywords': return deliverable.keywords.join(', ');
                    default: return null;
                  }
                }).filter(Boolean);
                data[placeholderId] = values.join(', ');
              });
            } else {
              const deliverable = await ctx.db.deliverables.findUnique({
                where: { id: input.id },
                include: {
                  template: true
                }
              });

              if (!deliverable) {
                throw new Error('Deliverable not found');
              }

              // Map deliverable data to placeholders
              input.placeholderIds.forEach(placeholderId => {
                switch (placeholderId) {
                  case 'deliverable_title': data[placeholderId] = deliverable.title;
                  case 'deliverable_description': data[placeholderId] = deliverable.description;
                  case 'deliverable_type': data[placeholderId] = deliverable.type;
                  case 'deliverable_status': data[placeholderId] = deliverable.status;
                  case 'deliverable_language': data[placeholderId] = deliverable.language.join(', ');
                  case 'deliverable_keywords': data[placeholderId] = deliverable.keywords.join(', ');
                }
              });
            }
            break;
          }
        }

        return data;
      } catch (error) {
        console.error('Error fetching placeholder data:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch placeholder data",
          cause: error,
        });
      }
    }),
}); 