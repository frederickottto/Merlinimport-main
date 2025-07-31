import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { profilesRouter } from "./routers/profiles/profiles";
import { tenderRouter } from "./routers/tenders/tender";
import { organisationsRouter } from "./routers/organisations/organisations";
import { organisationContactsRouter } from "./routers/organisations/organisationContacts";
import { projectsRouter } from "./routers/projects/projects";
import { industrySectorRouter } from "./routers/settings/industrySector";
import { conceptsRouter } from "./routers/misc/concepts";
import { templatesRouter } from "./routers/misc/templates";
import { placeholdersRouter } from "./routers/misc/placeholders";
import { conditionsOfParticipationRouter } from "./routers/tenders/conditionsOfParticipation";
import { certificateRouter } from "./routers/settings/certificate";
import { employeeRoleRouter } from "./routers/settings/employeeRole";
import { employeeRankRouter } from "./routers/settings/employeeRank";
import { locationRouter } from "./routers/settings/location";
import { salutationRouter } from "./routers/settings/salutation";
import { organisationRoleRouter } from "./routers/settings/organisationRole";
import { skillRouter } from "./routers/settings/skill";
import { securityClearanceRouter } from "./routers/settings/securityClearance";
import { organisationOrganisationRolesRouter } from "./routers/organisations/organisationOrganisationRoles";
import { organisationCertificatesRouter } from "./routers/organisations/organisationCertificates";
import { organisationTenderRouter } from "./routers/organisations/organisationTender";
import { organisationProjectActivitiesRouter } from "./routers/organisations/organisationProjectActivities";

import { conditionsOfParticipationTypeRouter } from "./routers/tenders/conditionsOfParticipationType";
import { riskQualityProcessRouter } from "./routers/tenders/riskQualityProcess";
import { callToTenderDeliverablesRouter } from "./routers/tenders/callToTenderDeliverables";
import { academicDegreeRouter } from "./routers/profiles/academicDegree";
import { employeeCertificatesRouter } from "./routers/profiles/employeeCertificates";
import { employeeProjectActivitiesRouter } from "./routers/profiles/employeeProjectActivities";
import { employeeSkillsRouter } from "./routers/profiles/employeeSkills";
import { professionalBackgroundRouter } from "./routers/profiles/professionalBackground";
import { employeeExternalProjectsRouter } from "./routers/profiles/employeeExternalProjects";
import { voccationalRouter } from "./routers/profiles/voccational";
import { trainingRouter } from "./routers/misc/trainings";
import { employeeTrainingRouter } from "./routers/profiles/employeeTraining";
import { callToTenderOrganisationsRouter } from "./routers/tenders/organisations";
import { callToTenderEmployeeRouter } from "./routers/tenders/CallToTenderEmployee";
import { tasksRouter } from "./routers/tasks/tasks";
import { pitchRouter } from "./routers/misc/pitch";
import { divisionRouter } from "./routers/settings/division";
import { lessonsLearnedRouter } from "./routers/tenders/lessonsLearned";
import { lotRouter } from "./routers/tenders/lot";
import { workpackageRouter } from "./routers/tenders/workpackage";
import { searchRouter } from "./routers/search";
import { callToTenderProjectRouter } from "./routers/tenders/CallToTenderProject";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  profiles: profilesRouter,
  tenders: tenderRouter,
  organisations: organisationsRouter,
  organisationContacts: organisationContactsRouter,
  projects: projectsRouter,
  industrySector: industrySectorRouter,
  concepts: conceptsRouter,
  templates: templatesRouter,
  placeholders: placeholdersRouter,
  conditionsOfParticipation: conditionsOfParticipationRouter,
  certificate: certificateRouter,
  employeeRole: employeeRoleRouter,
  employeeRank: employeeRankRouter,
  location: locationRouter,
  salutation: salutationRouter,
  organisationRole: organisationRoleRouter,
  skills: skillRouter,
  securityClearance: securityClearanceRouter,
  organisationOrganisationRoles: organisationOrganisationRolesRouter,
  organisationCertificates: organisationCertificatesRouter,
  organisationTender: organisationTenderRouter,
  organisationProjectActivities: organisationProjectActivitiesRouter,
 
  conditionsOfParticipationType: conditionsOfParticipationTypeRouter,
  riskQualityProcess: riskQualityProcessRouter,
  callToTenderDeliverables: callToTenderDeliverablesRouter,
  academicDegree: academicDegreeRouter,
  employeeCertificates: employeeCertificatesRouter,
  employeeProjectActivities: employeeProjectActivitiesRouter,
  employeeSkills: employeeSkillsRouter,
  professionalBackground: professionalBackgroundRouter,
  employeeExternalProjects: employeeExternalProjectsRouter,
  employeeTraining: employeeTrainingRouter,
  trainings: trainingRouter,
  employeeTrainings: employeeTrainingRouter,
  voccational: voccationalRouter,
  callToTenderOrganisations: callToTenderOrganisationsRouter,
  callToTenderEmployee: callToTenderEmployeeRouter,
  tasks: tasksRouter,
  pitch: pitchRouter,
  division: divisionRouter,
  lessonsLearned: lessonsLearnedRouter,
  lot: lotRouter,
  workpackage: workpackageRouter,
  search: searchRouter,
  callToTenderProject: callToTenderProjectRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
