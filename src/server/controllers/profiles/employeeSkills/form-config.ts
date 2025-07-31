import { z } from "zod";
import { FormFieldSchema } from "@/types/form";

export const employeeSkillsFields: FormFieldSchema[] = [
  {
    name: "employeeDisplayName",
    type: "static",
    label: "Mitarbeiter",
    placeholder: "Mitarbeiter",
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "skillIDs",
    type: "command",
    label: "Fähigkeit",
    placeholder: "Fähigkeit auswählen",
    position: 2,
    section: {
      id: "overview",
      title: "Übersicht",
    },
    options: {
      endpoint: "skills.getAll",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
  },
  {
    name: "niveau",
    type: "select",
    label: "Niveau",
    placeholder: "Niveau auswählen",
    position: 3,
    section: {
      id: "overview",
      title: "Übersicht",
    },
    options: {
      items: [
        { label: "Grundkenntnisse", value: "Grundkenntnisse" },
        { label: "Fortgeschritten", value: "Fortgeschritten" },
        { label: "Experte", value: "Experte" },
      ],
    },
  },
];

export const defaultValues = {
  employeeDisplayName: "",
  skillIDs: "",
  niveau: "",
};

export const createSchema = z.object({
  employeeDisplayName: z.string(),
  skillIDs: z.string(),
  niveau: z.string(),
});

export const updateSchema = createSchema.partial();

export function getFormFields(): FormFieldSchema[] {
  return employeeSkillsFields;
} 