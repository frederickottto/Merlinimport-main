import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

export const formFields: FormFieldSchema[] = [
  {
    name: "industrySector",
    label: "Industry Sector",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    placeholder: "Enter industry sector name",
    required: true,
    validation: z.string().min(1, "Industry sector name is required"),
    section: {
      id: "overview",
      title: "Overview",
    },
  },
  {
    name: "industrySectorEY",
    label: "Industry Sector EY",
    type: "text" as FieldType,
    position: 2,
    width: "full",
    placeholder: "Enter industry sector EY name",
    required: false,
    section: {
      id: "overview",
      title: "Overview",
    },
  },
];

export const navigationSchema: FormFieldSchema[] = [
  {
    name: "overview",
    label: "Overview",
    type: "text" as FieldType,
    position: 1,
    section: {
      id: "overview",
      title: "Overview",
    },
  },
];

export function getFormFields(): FormFieldSchema[] {
  return formFields;
}

export const defaultValues = {
  industrySector: "",
  industrySectorEY: "",
}; 