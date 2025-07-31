import { FormFieldSchema } from "@/types/form";

export const getFormFields = (): FormFieldSchema[] => [
  {
    name: "role",
    label: "Rolle",
    type: "text",
    required: true,
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  role: "",
}; 