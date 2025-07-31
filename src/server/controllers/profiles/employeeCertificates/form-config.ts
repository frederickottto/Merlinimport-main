import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const certificateFields: FormFieldSchema[] = [
  {
    name: "employeeDisplayName",
    label: "Mitarbeiter",
    type: "static" as FieldType,
    position: 0,
    required: true,
    disabled: true,
    section: {
      id: "overview",
      title: "Zertifikat Details",
    },
  },
  {
    name: "certificateIDs",
    label: "Zertifikat",
    type: "command" as FieldType,
    options: {
      endpoint: "certificate.getAll",
      labelField: "title",
      valueField: "id",
      multiple: false,
      filter: { type: "employee" },
    },
    position: 2,
    width: "full",
    placeholder: "Zertifikat auswählen",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "validUntil",
    label: "Gültig bis",
    type: "date" as FieldType,
    position: 3,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "issuer",
    label: "Ausstellende Stelle",
    type: "text" as FieldType,
    required: false,
    position: 4,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeeDisplayName: "",
  certificateIDs: "",
  validUntil: undefined,
  issuer: "",
};

export function getFormFields(): FormFieldSchema[] {
  return certificateFields;
}

// Create schema for employee certificates form
export const createSchema = z.object({
  employeeDisplayName: z.string(),
  certificateIDs: z.string(),
  validUntil: z.date().optional(),
  issuer: z.string().optional(),
}); 