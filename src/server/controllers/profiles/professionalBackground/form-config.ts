import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

interface IndustrySector {
  id: string;
  industrySector: string;
}

const professionalBackgroundFields: FormFieldSchema[] = [
  {
    name: "employeeDisplayName",
    label: "Mitarbeiter",
    type: "static" as FieldType,
    position: 0,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "position",
    label: "Position",
    type: "text" as FieldType,
    position: 1,
    width: "half",
    placeholder: "Position eingeben",
    description: "Die Position des Mitarbeiters",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "executivePosition",
    label: "Führungsposition",
    type: "checkbox" as FieldType,
    position: 2,
    width: "half",
    description: "Ist dies eine Führungsposition?",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "employer",
    label: "Arbeitgeber",
    type: "text" as FieldType,
    position: 3,
    width: "half",
    placeholder: "Arbeitgeber eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea" as FieldType,
    position: 4,
    width: "full",
    placeholder: "Beschreibung eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "industrySectorIDs",
    label: "Branche",
    type: "command",
    options: {
      endpoint: "industrySector.getAll",
      labelField: "industrySector",
      valueField: "id",
      formatLabel: (item: unknown) => (item as IndustrySector).industrySector,
    },
    position: 5,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "professionStart",
    label: "Beginn",
    type: "date" as FieldType,
    position: 1,
    width: "half",
    section: {
      id: "period",
      title: "Zeitraum",
    },
  },
  {
    name: "professionEnd",
    label: "Ende",
    type: "date" as FieldType,
    position: 2,
    width: "half",
    section: {
      id: "period",
      title: "Zeitraum",
    },
  },
  {
    name: "experienceIt",
    label: "IT-Erfahrung",
    type: "number" as FieldType,
    position: 1,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
  {
    name: "experienceIs",
    label: "IS-Erfahrung",
    type: "number" as FieldType,
    position: 2,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
  {
    name: "experienceItGs",
    label: "IT-GS-Erfahrung",
    type: "number" as FieldType,
    position: 3,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
  {
    name: "experienceGps",
    label: "GPS-Erfahrung",
    type: "number" as FieldType,
    position: 4,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
  {
    name: "experienceOther",
    label: "Sonstige Erfahrung",
    type: "number" as FieldType,
    position: 5,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
  {
    name: "experienceAll",
    label: "Gesamterfahrung",
    type: "number" as FieldType,
    position: 6,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0),
    section: {
      id: "experience",
      title: "Erfahrung",
    },
  },
];

export const defaultValues = {
  employeeDisplayName: "",
  position: "",
  executivePosition: false,
  employer: "",
  description: "",
  industrySectorIDs: undefined,
  professionStart: undefined,
  professionEnd: undefined,
  experienceIt: 0,
  experienceIs: 0,
  experienceItGs: 0,
  experienceGps: 0,
  experienceOther: 0,
  experienceAll: 0,
};

export function getFormFields(): FormFieldSchema[] {
  return professionalBackgroundFields;
}

// Create schema for professional background form
export const createSchema = z.object({
  employeeDisplayName: z.string(),
  employeeIDs: z.string(),
  industrySectorIDs: z.string().optional(),
  position: z.string().optional(),
  executivePosition: z.boolean().optional().default(false),
  employer: z.string().optional(),
  description: z.string().optional(),
  professionStart: z.date().optional(),
  professionEnd: z.date().optional(),
  experienceIt: z.number().int().optional().default(0),
  experienceIs: z.number().int().optional().default(0),
  experienceItGs: z.number().int().optional().default(0),
  experienceGps: z.number().int().optional().default(0),
  experienceOther: z.number().int().optional().default(0),
  experienceAll: z.number().int().optional().default(0),
}); 