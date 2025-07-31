import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";
import { TenderStatus } from "./schema";

// Base fields that are common to all types
const baseFields: FormFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    placeholder: "Titel eingeben",
    description: "Der Haupttitel",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Fields specific to tenders and concepts
const descriptionFields: FormFieldSchema[] = [
  {
    name: "shortDescription",
    label: "Kurzbeschreibung",
    type: "textarea" as FieldType,
    position: 2,
    width: "full",
    placeholder: "Kurze Beschreibung eingeben",
    required: false,
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Fields specific to tenders
const tenderFields: FormFieldSchema[] = [
  {
    name: "status",
    label: "Status",
    type: "select" as FieldType,
    options: [
      { label: "Präqualifikation", value: TenderStatus.PRAEQUALIFIKATION },
      { label: "Teilnahmeantrag", value: TenderStatus.TEILNAHMEANTRAG },
      { label: "Angebotsphase", value: TenderStatus.ANGEBOTSPHASE },
      { label: "Warten auf Entscheidung", value: TenderStatus.WARTEN_AUF_ENTSCHEIDUNG },
      { label: "Gewonnen", value: TenderStatus.GEWONNEN },
      { label: "Verloren", value: TenderStatus.VERLOREN },
      { label: "Nicht angeboten", value: TenderStatus.NICHT_ANGEBOTEN },
    ],
    position: 3,
    width: "half",
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "successChance",
    label: "Zuschlagswahrscheinlichkeit (%)",
    type: "number" as FieldType,
    position: 4,
    width: "half",
    validation: z.number().min(0).max(100).optional(),
    description: "Geschätzte Wahrscheinlichkeit des Zuschlags",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "volumeEuro",
    label: "Volumen (Euro)",
    type: "currency" as FieldType,
    position: 5,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "€0,00",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "volumePT",
    label: "Volumen (Personentage)",
    type: "number" as FieldType,
    position: 6,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "offerDeadline",
    label: "Angebotsfrist",
    type: "date" as FieldType,
    position: 7,
    width: "third",
    validation: z.union([z.date(), z.string(), z.null()]).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "questionDeadline",
    label: "Fragefrist",
    type: "date" as FieldType,
    position: 8,
    width: "third",
    validation: z.union([z.date(), z.string(), z.null()]).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "bindingDeadline",
    label: "Bindefrist",
    type: "date" as FieldType,
    position: 9,
    width: "third",
    validation: z.union([z.date(), z.string(), z.null()]).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "keywords",
    label: "Schlagworte",
    type: "tags" as FieldType,
    position: 10,
    width: "full",
    description: "Relevante Schlagworte",
    validation: z.array(z.string()).optional(),
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
  {
    name: "websiteTenderPlattform",
    label: "Link Vergabeplattform",
    type: "text" as FieldType,
    position: 11,
    width: "full",
    placeholder: "https://",
    validation: z.string().optional(),
    section: {
      id: "conditions",
      title: "Teilnahmebedinungen",
    },
  },
  {
    name: "awardCriteria",
    label: "Zuschlagskriterien",
    type: "textarea" as FieldType,
    position: 12,
    width: "full",
    placeholder: "Zuschlagskriterien eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "notes",
    label: "Anmerkungen",
    type: "textarea" as FieldType,
    position: 13,
    width: "full",
    placeholder: "Allgemeine Anmerkungen",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "standards",
    label: "Standards",
    type: "tags" as FieldType,
    position: 14,
    width: "full",
    description: "Relevante Standards",
    validation: z.array(z.string()).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "volumeHoursTotal",
    label: "Volumen (Stunden)",
    type: "number" as FieldType,
    position: 15,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "approvedMargin",
    label: "Genehmigte Marge",
    type: "number" as FieldType,
    position: 16,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "firstContactDate",
    label: "Datum Erstkontakt",
    type: "date" as FieldType,
    position: 17,
    width: "half",
    validation: z.union([z.date(), z.string(), z.null()]).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "serviceDate",
    label: "Leistungszeitpunkt",
    type: "date" as FieldType,
    position: 18,
    width: "half",
    validation: z.union([z.date(), z.string(), z.null()]).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "evbItContractNumber",
    label: "EVB-IT-Vertragsnummer",
    type: "text" as FieldType,
    position: 19,
    width: "half",
    placeholder: "Vertragsnummer eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "evbItContractLocation",
    label: "EVB-IT-Vertragsspeicherort",
    type: "text" as FieldType,
    position: 20,
    width: "half",
    placeholder: "Speicherort eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Navigation schema for tender
export const navigationSchema: FormFieldSchema[] = [
  {
    name: "overview",
    label: "Übersicht",
    type: "text" as FieldType,
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "text" as FieldType,
    position: 2,
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
  {
    name: "conditions",
    label: "Teilnahmebedinungen",
    type: "text" as FieldType,
    position: 3,
    section: {
      id: "conditions",
      title: "Teilnahmebedinungen",
    },
  },
];

// Function to get form fields for tender
export function getFormFields(): FormFieldSchema[] {
  return [...baseFields, ...descriptionFields, ...tenderFields];
}

// Default values for tender form
export const defaultValues = {
  title: "",
  shortDescription: "",
  status: "",
  successChance: 0,
  volumeEuro: 0,
  volumePT: 0,
  offerDeadline: "",
  questionDeadline: "",
  bindingDeadline: "",
  keywords: [],
  websiteTenderPlattform: "",
  awardCriteria: "",
  notes: "",
  standards: [],
  volumeHoursTotal: 0,
  approvedMargin: 0,
  firstContactDate: "",
  serviceDate: "",
  evbItContractNumber: "",
  evbItContractLocation: "",
}; 