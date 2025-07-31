import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

// Base fields that are common to all types
const baseFields: FormFieldSchema[] = [
  {
    name: "name",
    label: "Name",
    type: "text" as FieldType,
    position: 1,
    width: "half",
    placeholder: "Name eingeben",
    description: "Der Name der Organisation",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Fields specific to organisations
const organisationFields: FormFieldSchema[] = [
  {
    name: "abbreviation",
    label: "Abkürzung",
    type: "text" as FieldType,
    position: 3,
    width: "third",
    placeholder: "Abkürzung eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "anonymousIdentifier",
    label: "Anonymer Bezeichner",
    type: "text" as FieldType,
    position: 4,
    width: "third",
    placeholder: "Anonymer Bezeichner eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "website",
    label: "Website",
    type: "text" as FieldType,
    position: 4,
    width: "full",
    placeholder: "https://",
    validation: z.string().url().optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "location",
    label: "Standort",
    type: "command" as FieldType,
    options: {
      endpoint: "location.getAll",
      labelField: "city",
      valueField: "id",
      formatLabel: (item: unknown) => {
        const loc = item as { city: string; country: string };
        return `${loc.city}, ${loc.country}`;
      },
    },
    position: 6,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "employeeNumber",
    label: "Anzahl Mitarbeiter",
    type: "number" as FieldType,
    position: 1,
    width: "half",
    placeholder: "0",
    validation: z.number().min(0).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "anualReturn",
    label: "Jahresumsatz",
    type: "currency" as FieldType,
    position: 2,
    width: "half",
    placeholder: "0,00",
    validation: z.number().min(0).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "legalType",
    label: "Rechtsform",
    type: "select" as FieldType,
    options: [
      { label: "GmbH", value: "GmbH" },
      { label: "AG", value: "AG" },
      { label: "e.V.", value: "e.V." },
      { label: "gGmbH", value: "gGmbH" },
      { label: "KG", value: "KG" },
      { label: "OHG", value: "OHG" },
    ],
    position: 1,
    width: "third",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "industrySector",
    label: "Branche",
    type: "command" as FieldType,
    options: {
      endpoint: "industrySector.getAll",
      labelField: "industrySector",
      valueField: "id",
      formatLabel: (item: unknown) => {
        const sector = item as { industrySector: string };
        return sector.industrySector;
      },
      multiple: true,
    },
    position: 4,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "parentOrganisation",
    label: "Muttergesellschaft",
    type: "command" as FieldType,
    required: false,
    defaultValue: null,
    options: {
      endpoint: "organisations.all",
      labelField: "name",
      valueField: "id",
      formatLabel: (item: unknown) => {
        const org = item as { name: string };
        return org.name;
      },
    },
    position: 5,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "organisationOrganisationRoles",
    label: "Rollen (Organisation)",
    type: "command" as FieldType,
    options: {
      endpoint: "organisationRole.getAll",
      labelField: "role",
      valueField: "id",
      formatLabel: (item: unknown) => {
        const role = item as { role: string };
        return role.role;
      },
      multiple: true,
    },
    position: 6,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Function to get form fields for organisation
export function getFormFields(section?: string): FormFieldSchema[] {
  const allFields = [...baseFields, ...organisationFields];
  if (section) {
    return allFields.filter(field => field.section.id === section);
  }
  return allFields;
}

// Default values for organisation form
export const defaultValues = {
  name: "",
  abbreviation: "",
  anonymousIdentifier: "",
  website: "",
  location: null,
  employeeNumber: 0,
  anualReturn: 0,
  legalType: "",
  industrySector: [],
  parentOrganisation: null,
  organisationOrganisationRoles: [],
};

// Schema for updating an organisation
export const updateSchema = z.object({
  name: z.string(),
  abbreviation: z.string().optional(),
  anonymousIdentifier: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  employeeNumber: z.number().min(0).optional(),
  anualReturn: z.number().min(0).optional(),
  legalType: z.string().optional(),
  industrySector: z.union([z.string(), z.array(z.string())]).optional(),
  parentOrganisation: z.string().optional().nullable(),
  organisationOrganisationRoles: z.union([z.string(), z.array(z.string())]).optional(),
});
