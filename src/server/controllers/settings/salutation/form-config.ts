import { FormFieldSchema, FormSchema } from "@/types/form";
import { z } from "zod";

const baseFields: FormFieldSchema[] = [
  {
    name: "salutationShort",
    label: "Kurzform",
    type: "text",
    position: 1,
    width: "full",
    placeholder: "Kurzform eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
      icon: "info"
    },
    validation: z.string().min(1, "Kurzform ist erforderlich"),
  },
  {
    name: "salutationLong",
    label: "Langform",
    type: "text",
    position: 2,
    width: "full",
    placeholder: "Langform eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
      icon: "info"
    },
    validation: z.string().optional(),
  },
];

const salutationFields: FormFieldSchema[] = [
  ...baseFields,
];

export const formSchema: FormSchema = {
  fields: salutationFields,
};

export const defaultValues = {
  salutationShort: "",
  salutationLong: "",
}; 