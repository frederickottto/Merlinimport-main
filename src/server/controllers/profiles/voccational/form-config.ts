import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const voccationalFields: FormFieldSchema[] = [
  {
    name: "employeeDisplayName",
    label: "Mitarbeiter",
    type: "static",
    placeholder: "Mitarbeiter",
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "industrySectorIDs",
    label: "Branche",
    type: "command" as FieldType,
    placeholder: "Branche auswählen",
    options: {
      endpoint: "industrySector.getAll",
      labelField: "industrySector",
      valueField: "id",
      multiple: false,
    },
    position: 2,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "voccationalTitleShort",
    label: "Berufsbezeichnung (Kurz)",
    type: "text" as FieldType,
    position: 3,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "voccationalTitleLong",
    label: "Berufsbezeichnung (Lang)",
    type: "text" as FieldType,
    position: 4,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "voccationalMINT",
    label: "MINT-Beruf?",
    type: "checkbox" as FieldType,
    position: 5,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "company",
    label: "Unternehmen",
    type: "text" as FieldType,
    position: 6,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "voccationalStart",
    label: "Berufsbeginn",
    type: "date" as FieldType,
    position: 7,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "voccationalEnd",
    label: "Berufsende",
    type: "date" as FieldType,
    position: 8,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeeDisplayName: "",
  industrySectorIDs: "",
  voccationalTitleShort: "",
  voccationalTitleLong: "",
  voccationalMINT: false,
  company: "",
  voccationalStart: undefined,
  voccationalEnd: undefined,
};

export function getFormFields(): FormFieldSchema[] {
  return voccationalFields;
}

export const createSchema = z.object({
  employeeDisplayName: z.string(),
  industrySectorIDs: z.string().optional(),
  voccationalTitleShort: z.string().optional(),
  voccationalTitleLong: z.string().optional(),
  voccationalMINT: z.boolean().optional(),
  company: z.string().optional(),
  voccationalStart: z.date().optional(),
  voccationalEnd: z.date().optional(),
}); 