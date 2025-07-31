import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const projectActivityFields: FormFieldSchema[] = [
  {
    name: "organisationIDs",
    label: "Organisation",
    type: "command" as FieldType,
    options: {
      endpoint: "organisations.all",
      labelField: "name",
      valueField: "id",
      multiple: false,
    },
    position: 0,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivitätsdaten",
    },
  },
  {
    name: "projectIDs",
    label: "Projekt",
    type: "command" as FieldType,
    options: {
      endpoint: "projects.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
    position: 1,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivitätsdaten",
    },
  },
  {
    name: "role",
    label: "Rolle",
    type: "text" as FieldType,
    position: 2,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivitätsdaten",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea" as FieldType,
    position: 3,
    required: false,
    section: {
      id: "overview",
      title: "Projektaktivitätsdaten",
    },
  },
];

export const defaultValues = {
  organisationIDs: "",
  projectIDs: "",
  role: "",
  description: "",
};

export const createSchema = z.object({
  organisationIDs: z.string(),
  projectIDs: z.string(),
  role: z.string(),
  description: z.string().optional(),
});

export function getFormFields({ 
  includeOrganisation = true, 
  projectId = ""
} = {}): FormFieldSchema[] {
  let fields = [...projectActivityFields];
  
  // Handle organization field visibility
  if (!includeOrganisation) {
    fields = fields.filter(f => f.name !== "organisationIDs");
  }

  // Remove project field when projectId is provided (both for create and update)
  if (projectId) {
    fields = fields.filter(field => field.name !== "projectIDs");
  }

  return fields;
} 