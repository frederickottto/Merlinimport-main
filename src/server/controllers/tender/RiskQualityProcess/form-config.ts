import { FormFieldSchema } from "@/types/form";

type Organisation = {
  id: string;
  name: string;
};

export const getFormFields = (organisations: Organisation[] = []): FormFieldSchema[] => [
  {
    name: "type",
    label: "Typ",
    type: "text",
    description: "Typ des Prozesses",
    placeholder: "Typ eingeben",
    position: 1,
    required: true,
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "status",
    label: "Status",
    type: "text",
    description: "Status des Prozesses",
    placeholder: "Status eingeben",
    position: 2,
    required: true,
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "note",
    label: "Notiz",
    type: "textarea",
    description: "Notiz (optional)",
    placeholder: "Notiz eingeben",
    position: 3,
    required: false,
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "organisationID",
    label: "Organisation",
    type: "select",
    description: "Zugehörige Organisation (optional)",
    placeholder: "Organisation auswählen",
    options: {
      items: organisations.map((org) => ({
        label: org.name,
        value: org.id,
      })),
      multiple: false
    },
    position: 4,
    required: false,
    section: { id: "overview", title: "Übersicht" },
  },
];

export const defaultValues = {
  type: "",
  status: "",
  note: "",
  organisationID: "",
}; 