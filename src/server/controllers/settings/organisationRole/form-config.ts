import { FormFieldSchema, FormSchema } from "@/types/form";
import { z } from "zod";

const baseFields: FormFieldSchema[] = [
  {
    name: "role",
    label: "Rolle",
    type: "text",
    position: 1,
    width: "full",
    placeholder: "Rolle eingeben",
    section: {
      id: "overview",
      title: "Übersicht",
      icon: "info"
    },
    validation: z.string().min(1, "Rolle ist erforderlich"),
  },
];

const organisationRoleFields: FormFieldSchema[] = [
  ...baseFields,
];

export const formSchema: FormSchema = {
  fields: organisationRoleFields,
};

export const defaultValues = {
  role: "",
};

export const getFormFields = (): FormFieldSchema[] => {
  return [
    {
      name: "role",
      label: "Rolle",
      type: "text",
      required: true,
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
      },
    },
  ];
}; 