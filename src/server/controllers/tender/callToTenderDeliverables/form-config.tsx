import { FormFieldSchema, FieldType } from "@/types/form";

export const getFormFields = (): FormFieldSchema[] => [
  {
    name: "callToTenderIDs",
    label: "Ausschreibung",
    type: "command" as FieldType,
    position: 0,
    required: true,
    section: {
      id: "main",
      title: "Main",
    },
    options: {
      endpoint: "tenders.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
  },
  {
    name: "deliverablesIDs",
    label: "Konzept",
    type: "command" as FieldType,
    position: 1,
    required: true,
    section: {
      id: "main",
      title: "Main",
    },
    options: {
      endpoint: "concepts.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
  },
];

export const defaultValues = {
  callToTenderIDs: "",
  deliverablesIDs: "",
}; 