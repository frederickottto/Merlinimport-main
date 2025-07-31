import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

interface ProfessionalBackground {
  id: string;
  position: string;
}

export const projectActivityFields: FormFieldSchema[] = [
  {
    name: "employeeDisplayName",
    label: "Mitarbeiter",
    type: "static" as FieldType,
    position: 0,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "professionalBackgroundIDs",
    label: "Beruflicher Hintergrund",
    type: "command" as FieldType,
    position: 1,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
    options: {
      endpoint: "professionalBackground.getAll",
      labelField: "position",
      valueField: "id",
      multiple: false,
      filter: {
        employeeId: "{{employeeIDs}}"
      },
      formatLabel: (item: unknown) => {
        const bg = item as ProfessionalBackground;
        return bg.position || "-";
      }
    },
    disabled: false
  },
  {
    name: "employeeProjectRole",
    label: "Rolle",
    type: "text" as FieldType,
    position: 2,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "projectTitle",
    label: "Projekttitel",
    type: "text" as FieldType,
    position: 3,
    required: true,
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
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "projectStart",
    label: "Startdatum",
    type: "date" as FieldType,
    position: 5,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "projectEnd",
    label: "Enddatum",
    type: "date" as FieldType,
    position: 6,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "operationalDays",
    label: "Operative Tage",
    type: "number" as FieldType,
    position: 7,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "keywords",
    label: "Schlagworte",
    type: "tags" as FieldType,
    position: 8,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "clientName",
    label: "Kundenname",
    type: "text" as FieldType,
    position: 9,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "experienceIt",
    label: "IT-Erfahrung",
    type: "checkbox" as FieldType,
    position: 10,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "experienceIs",
    label: "IS-Erfahrung",
    type: "checkbox" as FieldType,
    position: 11,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "experienceItGs",
    label: "IT/GS-Erfahrung",
    type: "checkbox" as FieldType,
    position: 12,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "experienceGps",
    label: "GPS-Erfahrung",
    type: "checkbox" as FieldType,
    position: 13,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "experienceOther",
    label: "Sonstige Erfahrung",
    type: "checkbox" as FieldType,
    position: 14,
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeeDisplayName: "",
  professionalBackgroundIDs: "",
  employeeProjectRole: "",
  projectTitle: "",
  description: "",
  projectStart: new Date(),
  projectEnd: new Date(),
  operationalDays: 0,
  keywords: [],
  experienceIt: false,
  experienceIs: false,
  experienceItGs: false,
  experienceGps: false,
  experienceOther: false,
  clientName: "",
};

export const createSchema = z.object({
  employeeDisplayName: z.string(),
  professionalBackgroundIDs: z.string(),
  employeeProjectRole: z.string(),
  projectTitle: z.string(),
  description: z.string(),
  projectStart: z.date(),
  projectEnd: z.date(),
  operationalDays: z.number().min(0).default(0),
  keywords: z.array(z.string()).default([]),
  experienceIt: z.boolean().default(false),
  experienceIs: z.boolean().default(false),
  experienceItGs: z.boolean().default(false),
  experienceGps: z.boolean().default(false),
  experienceOther: z.boolean().default(false),
  clientName: z.string().optional(),
});

export const getFormFields = () => projectActivityFields; 