import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const employeeTrainingFields: FormFieldSchema[] = [
  {
    name: "trainingID",
    label: "Training",
    type: "command" as FieldType,
    position: 1,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "passed",
    label: "Bestanden",
    type: "checkbox" as FieldType,
    position: 2,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "passedDate",
    label: "Abgeschlossen am",
    type: "date" as FieldType,
    position: 3,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeeID: "",
  trainingID: "",
  passed: false,
  passedDate: undefined,
};

export function getFormFields(): FormFieldSchema[] {
  return employeeTrainingFields;
}

export const createSchema = z.object({
  employeeID: z.string(),
  trainingID: z.string(),
  passed: z.boolean().optional().default(false),
  passedDate: z.date().optional(),
}); 