import { FormFieldSchema } from "@/types/form";

export const getFormFields = (organisations: Array<{ id: string; name: string }> = []): FormFieldSchema[] => {
  return [
    {
      name: "organisationIDs",
      label: "Organisation",
      type: "select",
      description: "Organisation auswählen",
      options: {
        items: organisations.map((org) => ({
          label: org.name,
          value: org.id,
        })),
        multiple: false
      },
      position: 1,
      required: true,
      section: { id: "overview", title: "Übersicht" },
    },
    {
      name: "organisationRole",
      label: "Rolle",
      type: "select",
      description: "Rolle der Organisation",
      options: {
        items: [
          { label: "Auftraggeber", value: "CLIENT" },
          { label: "Auftragnehmer", value: "CONTRACTOR" },
          { label: "Partner", value: "PARTNER" },
          { label: "Berater", value: "CONSULTANT" },
        ],
        multiple: false
      },
      position: 2,
      required: true,
      section: { id: "overview", title: "Übersicht" },
    }
  ];
};

export const defaultValues = {
  organisationIDs: "",
  organisationRole: "",
};
