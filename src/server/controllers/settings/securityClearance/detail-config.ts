import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    }
  ],
  fields: [
    {
      name: "employee",
      label: "Mitarbeiter",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "securityClearanceType",
      label: "Art der Sicherheitsüberprüfung",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "securityClearanceLevel",
      label: "Stufe der Sicherheitsüberprüfung",
      type: "text",
      position: 3,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "applicationDate",
      label: "Antragsdatum",
      type: "date",
      position: 4,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      format: {
        locale: "de-DE"
      },
    },
    {
      name: "approved",
      label: "Genehmigt",
      type: "boolean",
      position: 5,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    }
  ],
}; 