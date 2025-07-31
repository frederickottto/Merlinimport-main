import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const certificateFields: FormFieldSchema[] = [
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
      title: "Zertifikatsdaten",
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
      filter: { type: "organisation" },
    } satisfies NonNullable<FormFieldSchema['options']>,
    position: 1,
    required: true,
    section: {
      id: "overview",
      title: "Zertifikatsdaten",
    },
  },
  {
    name: "certificationObject",
    label: "Zertifizierungsobjekt",
    type: "text" as FieldType,
    position: 2,
    required: false,
    section: {
      id: "overview",
      title: "Zertifikatsdaten",
    },
  },
  {
    name: "validUntil",
    label: "Gültig bis",
    type: "date" as FieldType,
    position: 3,
    required: false,
    section: {
      id: "overview",
      title: "Zertifikatsdaten",
    },
  },
];

export const defaultValues = {
  organisationIDs: "",
  certificateIDs: "",
  certificationObject: "",
  validUntil: undefined,
};

export const createSchema = z.object({
  organisationIDs: z.string(),
  certificateIDs: z.string(),
  certificationObject: z.string().optional(),
  validUntil: z.date().optional(),
});

export function getFormFields({ includeOrganisation = true } = {}): FormFieldSchema[] {
  if (includeOrganisation) {
    return certificateFields;
  }
  return certificateFields.filter(f => f.name !== "organisationIDs");
} 