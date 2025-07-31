import { FormFieldSchema, FormSchema } from "@/types/form";
import { z } from "zod";

const baseFields: FormFieldSchema[] = [
  {
    name: "street",
    label: "Straße",
    type: "text",
    position: 1,
    width: "full",
    placeholder: "Straße eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Straße ist erforderlich"),
  },
  {
    name: "houseNumber",
    label: "Hausnummer",
    type: "text",
    position: 2,
    width: "half",
    placeholder: "Hausnummer eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Hausnummer ist erforderlich"),
  },
  {
    name: "postCode",
    label: "Postleitzahl",
    type: "text",
    position: 3,
    width: "half",
    placeholder: "Postleitzahl eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Postleitzahl ist erforderlich"),
  },
  {
    name: "city",
    label: "Stadt",
    type: "text",
    position: 4,
    width: "full",
    placeholder: "Stadt eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Stadt ist erforderlich"),
  },
  {
    name: "region",
    label: "Region",
    type: "text",
    position: 5,
    width: "full",
    placeholder: "Region eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Region ist erforderlich"),
  },
  {
    name: "country",
    label: "Land",
    type: "text",
    position: 6,
    width: "full",
    placeholder: "Land eingeben",
    section: {
      id: "address",
      title: "Adresse",
      icon: "map-pin"
    },
    validation: z.string().min(1, "Land ist erforderlich"),
  },
];

const locationFields: FormFieldSchema[] = [
  ...baseFields,
];

export const formSchema: FormSchema = {
  fields: locationFields,
};

export const defaultValues = {
  street: "",
  houseNumber: "",
  postCode: "",
  city: "",
  region: "",
  country: "",
}; 