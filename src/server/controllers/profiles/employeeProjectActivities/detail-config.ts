import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Projektaktivität Details",
      position: 1,
    },
  ],
  fields: [
    {
      name: "employeeName",
      label: "Mitarbeiter",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "projectTitle",
      label: "Projekt",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "employeeRole",
      label: "Rolle",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 4,
      width: "full",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "operationalPeriodStart",
      label: "Startdatum",
      type: "date",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "operationalPeriodEnd",
      label: "Enddatum",
      type: "date",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
    {
      name: "operationalDays",
      label: "Operative Tage",
      type: "number",
      position: 7,
      width: "half",
      section: {
        id: "overview",
        title: "Projektaktivität Details",
        position: 1
      },
    },
  ],
}; 