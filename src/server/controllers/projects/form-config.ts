import { FormFieldSchema, FormSchema, FieldType } from "@/types/form";
import { z } from "zod";

const baseFields: FormFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    required: true,
    placeholder: "Projekttitel eingeben",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "frameworkContractProjectIDs",
    label: "Rahmenvertrag",
    type: "command" as FieldType,
    position: 2,
    width: "full",
    required: false,
    placeholder: "Rahmenvertrag auswählen",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
    options: {
      endpoint: "projects.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
  },
  {
    name: "contractBeginn",
    label: "Vertragsbeginn",
    type: "date" as FieldType,
    position: 4,
    width: "half",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "contractEnd",
    label: "Vertragsende",
    type: "date" as FieldType,
    position: 5,
    width: "half",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "referenceApproval",
    label: "Referenzfreigabe",
    type: "checkbox" as FieldType,
    position: 5,
    width: "third",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "teamSize",
    label: "Teamgröße",
    type: "number" as FieldType,
    position: 6,
    width: "third",
    placeholder: "Teamgröße eingeben",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "scopeAuditHours",
    label: "Auditstunden",
    type: "number" as FieldType,
    position: 7,
    width: "third",
    placeholder: "Auditstunden eingeben",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "type",
    label: "Projekttyp",
    type: "select" as FieldType,
    position: 8,
    width: "full",
    placeholder: "Projekttyp auswählen",
    required: false,
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
    options: [
      { value: "consulting", label: "Beratung" },
      { value: "implementation", label: "Implementierung" },
      { value: "audit", label: "Audit" },
      { value: "other", label: "Sonstiges" },
    ],
  },
  {
    name: "volumeEuroTotal",
    label: "Volumen (€)",
    type: "currency" as FieldType,
    position: 9,
    width: "half",
    placeholder: "Gesamtvolumen eingeben",
    required: false,
    section: {
      id: "financial",
      title: "Finanzielle Details",
    },
  },
  {
    name: "volumeEuroRetrieved",
    label: "Abgerufenes Volumen (€)",
    type: "currency" as FieldType,
    position: 10,
    width: "half",
    placeholder: "Abgerufenes Volumen eingeben",
    required: false,
    section: {
      id: "financial",
      title: "Finanzielle Details",
    },
  },
  {
    name: "volumePTTotal",
    label: "Volumen (PT)",
    type: "number" as FieldType,
    position: 3,
    width: "half",
    placeholder: "Gesamt PT eingeben",
    required: false,
    section: {
      id: "financial",
      title: "Finanzielle Details",
    },
  },
  {
    name: "volumePTRetrieved",
    label: "Abgerufenes Volumen (PT)",
    type: "number" as FieldType,
    position: 4,
    width: "half",
    placeholder: "Abgerufene PT eingeben",
    required: false,
    section: {
      id: "financial",
      title: "Finanzielle Details",
    },
  },
  {
    name: "keywords",
    label: "Schlagwörter",
    type: "tags" as FieldType,
    position: 11,
    width: "full",
    placeholder: "Schlagwörter eingeben",
    required: false,
    section: {
      id: "details",
      title: "Weitere Details",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea" as FieldType,
    position: 12,
    width: "full",
    placeholder: "Projektbeschreibung eingeben",
    required: false,
    section: {
      id: "details",
      title: "Weitere Details",
    },
  },
  {
    name: "standards",
    label: "Standards",
    type: "tags" as FieldType,
    position: 5,
    width: "full",
    description: "Relevante Standards",
    validation: z.array(z.string()).optional(),
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "volumeHoursTotal",
    label: "Volumen (Stunden)",
    type: "number" as FieldType,
    position: 6,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "approvedMargin",
    label: "Genehmigte Marge",
    type: "number" as FieldType,
    position: 7,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "firstContactDate",
    label: "Datum Erstkontakt",
    type: "date" as FieldType,
    position: 8,
    width: "half",
    validation: z.union([z.date(), z.string()]).optional().transform((val) => {
      if (!val) return undefined;
      if (typeof val === 'string') return new Date(val);
      return val;
    }),
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "serviceDate",
    label: "Leistungszeitpunkt",
    type: "date" as FieldType,
    position: 9,
    width: "half",
    validation: z.union([z.date(), z.string()]).optional().transform((val) => {
      if (!val) return undefined;
      if (typeof val === 'string') return new Date(val);
      return val;
    }),
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "evbItContractNumber",
    label: "EVB-IT-Vertragsnummer",
    type: "text" as FieldType,
    position: 10,
    width: "half",
    placeholder: "Vertragsnummer eingeben",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
  {
    name: "evbItContractLocation",
    label: "EVB-IT-Vertragsspeicherort",
    type: "text" as FieldType,
    position: 11,
    width: "half",
    placeholder: "Speicherort eingeben",
    section: {
      id: "overview",
      title: "Projektübersicht",
    },
  },
];

const sections = [
  {
    id: "overview",
    title: "Projektübersicht",
    position: 1,
  },
  {
    id: "financial",
    title: "Finanzielle Details",
    position: 2,
  },
  {
    id: "details",
    title: "Weitere Details",
    position: 3,
  }
];

export const formSchema: FormSchema = {
  fields: baseFields,
  sections,
};

export const defaultValues = {
  title: "",
  type: "",
  referenceApproval: false,
  description: "",
  keywords: [],
  teamSize: undefined,
  scopeAuditHours: undefined,
  volumePTTotal: undefined,
  volumePTRetrieved: undefined,
  volumeEuroTotal: undefined,
  volumeEuroRetrieved: undefined,
  contractBeginn: undefined,
  contractEnd: undefined,
  frameworkContractProjectIDs: undefined,
  standards: [],
  volumeHoursTotal: 0,
  approvedMargin: 0,
  firstContactDate: "",
  serviceDate: "",
  evbItContractNumber: "",
  evbItContractLocation: "",
};

export const updateProjectSchema = z.object({
  title: z.string(),
  type: z.string().optional(),
  description: z.string().optional(),
  referenceApproval: z.boolean().optional(),
  keywords: z.array(z.string()).optional(),
  teamSize: z.number().optional(),
  scopeAuditHours: z.number().optional(),
  volumePTTotal: z.number().optional(),
  volumePTRetrieved: z.number().optional(),
  volumeEuroTotal: z.number().optional(),
  volumeEuroRetrieved: z.number().optional(),
  contractBeginn: z.union([z.string(), z.date()]).optional(),
  contractEnd: z.union([z.string(), z.date()]).optional(),
  projectIT: z.boolean().optional(),
  projectIS: z.boolean().optional(),
  projectGS: z.boolean().optional(),
  organisationIDs: z.array(z.string()).optional(),
  organisationContactsIDs: z.array(z.string()).optional(),
  frameworkContractProjectIDs: z.string().optional(),
  standards: z.array(z.string()).optional(),
  approvedMargin: z.number().optional(),
  firstContactDate: z.union([z.string(), z.date()]).optional(),
  serviceDate: z.union([z.string(), z.date()]).optional(),
  evbItContractNumber: z.string().optional(),
  evbItContractLocation: z.string().optional(),
});

export function getFormFields(): FormFieldSchema[] {
  return baseFields;
}
