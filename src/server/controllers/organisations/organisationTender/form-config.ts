import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const tenderOrganisationFields: FormFieldSchema[] = [
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
      title: "Ausschreibungsorganisationsdaten",
    },
  },
  {
    name: "callToTenderIDs",
    label: "Ausschreibung",
    type: "command" as FieldType,
    options: {
      endpoint: "tender.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
    position: 1,
    required: true,
    section: {
      id: "overview",
      title: "Ausschreibungsorganisationsdaten",
    },
  },
  {
    name: "organisationRole",
    label: "Rolle der Organisation",
    type: "text" as FieldType,
    position: 2,
    required: true,
    section: {
      id: "overview",
      title: "Ausschreibungsorganisationsdaten",
    },
  },
];

export const defaultValues = {
  organisationIDs: "",
  callToTenderIDs: "",
  organisationRole: "",
};

export const createSchema = z.object({
  organisationIDs: z.string(),
  callToTenderIDs: z.string(),
  organisationRole: z.string(),
});

export function getFormFields({ includeOrganisation = true } = {}): FormFieldSchema[] {
  if (includeOrganisation) {
    return tenderOrganisationFields;
  }
  return tenderOrganisationFields.filter(f => f.name !== "organisationIDs");
} 