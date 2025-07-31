import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

// Contact fields
const contactFields: FormFieldSchema[] = [
  {
    name: "salutationIDs",
    label: "Anrede",
    type: "command" as FieldType,
    options: {
      endpoint: "salutation.getAll",
      labelField: "salutationShort",
      valueField: "id",
      multiple: false,
    },
    position: 0,
    width: "half",
    placeholder: "Anrede auswählen",
    section: {
      id: "overview",
      title: "Kontaktübersicht",
    },
  },
  {
    name: "foreName",
    label: "Vorname",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    placeholder: "Vorname eingeben",
    description: "Der Vorname des Kontakts",
    required: true,
    section: {
      id: "overview",
      title: "Kontaktübersicht",
    },
  },
  {
    name: "lastName",
    label: "Nachname",
    type: "text" as FieldType,
    position: 2,
    width: "full",
    placeholder: "Nachname eingeben",
    description: "Der Nachname des Kontakts",
    required: true,
    section: {
      id: "overview",
      title: "Kontaktübersicht",
    },
  },
  {
    name: "position",
    label: "Position",
    type: "text" as FieldType,
    position: 3,
    width: "half",
    placeholder: "Position eingeben",
    section: {
      id: "overview",
      title: "Kontaktübersicht",
    },
  },
  {
    name: "department",
    label: "Abteilung",
    type: "text" as FieldType,
    position: 4,
    width: "half",
    placeholder: "Abteilung eingeben",
    section: {
      id: "overview",
      title: "Kontaktübersicht",
    },
  },
  {
    name: "email",
    label: "E-Mail",
    type: "text" as FieldType,
    position: 5,
    width: "full",
    placeholder: "E-Mail eingeben",
    validation: z.string().email("Ungültige E-Mail-Adresse").optional(),
    section: {
      id: "contact",
      title: "Kontaktinformationen",
    },
  },
  {
    name: "mobile",
    label: "Mobil",
    type: "text" as FieldType,
    position: 6,
    width: "half",
    placeholder: "Mobilnummer eingeben",
    section: {
      id: "contact",
      title: "Kontaktinformationen",
    },
  },
  {
    name: "telephone",
    label: "Telefon",
    type: "text" as FieldType,
    position: 7,
    width: "half",
    placeholder: "Telefonnummer eingeben",
    section: {
      id: "contact",
      title: "Kontaktinformationen",
    },
  },
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
    position: 8,
    width: "full",
    placeholder: "Organisation auswählen",
    section: {
      id: "organisation",
      title: "Organisation",
    },
  },
];

// Default values for contact form
export const defaultValues = {
  salutationIDs: "",
  foreName: "",
  lastName: "",
  position: "",
  department: "",
  email: "",
  mobile: "",
  telephone: "",
  organisationIDs: "",
};

// Schema for updating a contact
export const updateContactSchema = z.object({
  salutationIDs: z.string().optional(),
  foreName: z.string().min(1, "Vorname ist erforderlich"),
  lastName: z.string().min(1, "Nachname ist erforderlich"),
  position: z.string().optional(),
  department: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional(),
  mobile: z.string().optional(),
  telephone: z.string().optional(),
  organisationIDs: z.string().min(1, "Organisation ist erforderlich"),
});

// Get form fields for the contact form
export function getFormFields(hideOrganisation?: boolean): FormFieldSchema[] {
  if (hideOrganisation) {
    return contactFields.filter(field => field.name !== "organisationIDs");
  }
  return contactFields;
}
