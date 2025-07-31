import { z } from "zod";

// Define the tender status enum
export const TenderStatus = {
  PRAEQUALIFIKATION: "praequalifikation",
  TEILNAHMEANTRAG: "teilnahmeantrag",
  ANGEBOTSPHASE: "angebotsphase",
  WARTEN_AUF_ENTSCHEIDUNG: "warten_auf_entscheidung",
  GEWONNEN: "gewonnen",
  VERLOREN: "verloren",
  NICHT_ANGEBOTEN: "nicht angeboten"
} as const;

export type TenderStatusType = typeof TenderStatus[keyof typeof TenderStatus];

type KanbanColumn = {
  id: TenderStatusType;
  label: string;
  statuses: TenderStatusType[];
};

// Define the KANBAN column mapping
export const KANBAN_COLUMNS: Record<string, KanbanColumn> = {
  PRAEQUALIFIKATION: {
    id: TenderStatus.PRAEQUALIFIKATION,
    label: "Präqualifikation",
    statuses: [TenderStatus.PRAEQUALIFIKATION]
  },
  TEILNAHMEANTRAG: {
    id: TenderStatus.TEILNAHMEANTRAG,
    label: "Teilnahmeantrag",
    statuses: [TenderStatus.TEILNAHMEANTRAG]
  },
  ANGEBOTSPHASE: {
    id: TenderStatus.ANGEBOTSPHASE,
    label: "Angebotsphase",
    statuses: [TenderStatus.ANGEBOTSPHASE]
  },
  WARTEN_AUF_ENTSCHEIDUNG: {
    id: TenderStatus.WARTEN_AUF_ENTSCHEIDUNG,
    label: "Warten auf Entscheidung",
    statuses: [TenderStatus.WARTEN_AUF_ENTSCHEIDUNG]
  }
} as const;

export const tenderSchema = z.object({
  id: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  title: z.string(),
  type: z.string().optional(),
  shortDescription: z.string().optional(),
  awardCriteria: z.string().optional(),
  offerDeadline: z.date().optional(),
  questionDeadline: z.date().optional(),
  bindingDeadline: z.date().optional(),
  volumeEuro: z.number().optional(),
  volumePT: z.number().optional(),
  volumeHours: z.number().optional(),
  successChance: z.number().optional(),
  keywords: z.array(z.string()),
  status: z.string().optional(),
  notes: z.string().optional(),
  hyperlink: z.string().optional(),
  websiteTenderPlattform: z.string().optional(),
  internalPlattform: z.string().optional(),
  standards: z.array(z.string()).optional(),
  volumeHoursTotal: z.number().optional(),
  approvedMargin: z.number().optional(),
  firstContactDate: z.date().optional(),
  serviceDate: z.date().optional(),
  evbItContractNumber: z.string().optional(),
  evbItContractLocation: z.string().optional(),
  ocid: z.string().optional(),
  noticeType: z.string().optional(),
  releaseDate: z.date().optional(),
  tag: z.array(z.string()).optional(),
  isFrameworkContract: z.boolean().optional(),
  serviceTitle: z.string().optional(),
  serviceDetails: z.string().optional(),
  servicePeriodStart: z.union([z.string(), z.date()]).optional(),
  servicePeriodEnd: z.union([z.string(), z.date()]).optional(),
  processor: z.string().optional(),
  technicalRequirements: z.string().optional(),
  deliverables: z.string().optional(),
  participationConditions: z.string().optional(),
  legalBasis: z.string().optional(),
  obligations: z.string().optional(),
  qualificationRequirements: z.string().optional(),
  exclusionCriteria: z.string().optional(),
  organisations: z.array(z.object({
    id: z.string(),
    organisation: z.object({
      id: z.string(),
      name: z.string(),
    }),
    organisationRole: z.string(),
  })).optional(),
  employees: z.array(z.object({
    id: z.string(),
    employee: z.object({
      id: z.string(),
      foreName: z.string(),
      lastName: z.string(),
    }),
    employeeCallToTenderRole: z.string(),
  })).optional(),
  conditionsOfParticipation: z.array(z.object({
    id: z.string(),
    title: z.string(),
    conditionsOfParticipationType: z.object({
      id: z.string(),
      title: z.string(),
    }).optional(),
    certificate: z.array(z.object({
      id: z.string(),
      title: z.string(),
    })).optional(),
    industrySector: z.array(z.object({
      id: z.string(),
      industrySector: z.string(),
    })).optional(),
  })).optional(),
  lots: z.array(z.object({
    id: z.string(),
    number: z.string().optional(),
    title: z.string().optional(),
    description: z.string(),
    volumeEuro: z.number().optional(),
    volumePT: z.number().optional(),
    workpackages: z.array(z.object({
      id: z.string(),
      number: z.string(),
      title: z.string(),
      description: z.string(),
      volumeEuro: z.number().optional(),
      volumePT: z.number().optional(),
    })).optional(),
  })).optional(),
  workpackages: z.array(z.object({
    id: z.string(),
    number: z.string(),
    title: z.string(),
    description: z.string(),
    volumeEuro: z.number().optional(),
    volumePT: z.number().optional(),
  })).optional(),
  template: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })).optional(),
  callToTenderDeliverables: z.array(z.object({
    id: z.string(),
    deliverables: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
    }),
  })).optional(),
  riskQualityProcesses: z.array(z.object({
    id: z.string(),
    type: z.string(),
    status: z.string(),
    note: z.string().optional(),
  })).optional(),
  projectCallToTender: z.array(z.object({
    id: z.string(),
    title: z.string().nullable(),
    type: z.string().nullable(),
  })).optional(),
});

export type T_Tender = z.infer<typeof tenderSchema>; 