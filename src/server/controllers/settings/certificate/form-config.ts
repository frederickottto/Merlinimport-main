import { FormFieldSchema } from "@/types/form";

export const getFormFields = (): FormFieldSchema[] => [
  {
    name: "title",
    label: "Title",
    type: "text",
    required: true,
    position: 1,
    section: {
      id: "overview",
      title: "Certificate Information",
    },
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    position: 2,
    section: {
      id: "overview",
      title: "Certificate Information",
    },
  },
  {
    name: "type",
    label: "Typ",
    type: "select",
    description: "Typ des Zertifikats",
    options: [
      { value: "employee", label: "Personenzertifizierung" },
      { value: "organization", label: "Organisationszertifizierung" }
    ],
    position: 3,
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "deeplink",
    label: "Deeplink/Path",
    type: "text",
    description: "Optional URL or path to certificate details",
    position: 4,
    section: {
      id: "overview",
      title: "Certificate Information",
    },
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    position: 5,
    section: {
      id: "overview",
      title: "Certificate Information",
    },
    options: [
      { value: "Projektmanagement", label: "Projektmanagement" },
      { value: "Cloud", label: "Cloud" },
      { value: "Security", label: "Security" },
      { value: "Datenschutz", label: "Datenschutz" },
      { value: "Architektur", label: "Architektur" },
      { value: "Entwicklung", label: "Entwicklung" },
      { value: "DevOps", label: "DevOps" },
      { value: "Agile", label: "Agile" },
      { value: "Sonstiges", label: "Sonstiges" },
    ],
  },
  {
    name: "salesCertificate",
    label: "Sales Certificate",
    type: "checkbox",
    description: "Indicates if this is a sales-related certificate",
    position: 6,
    section: {
      id: "overview",
      title: "Certificate Information",
    },
  },
];

export const defaultValues = {
  title: "",
  description: "",
  type: "",
  deeplink: "",
  category: undefined,
  salesCertificate: false,
  conditionsOfParticipationIDs: [],
}; 