import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
  ],
  fields: [
    {
      name: "employeeIDs",
      label: "Mitarbeiter",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "professionalBackgroundIDs",
      label: "Beruflicher Hintergrund",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "employeeProjectRole",
      label: "Rolle",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "projectTitle",
      label: "Projekttitel",
      type: "text",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 5,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "projectStart",
      label: "Startdatum",
      type: "date",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "projectEnd",
      label: "Enddatum",
      type: "date",
      position: 7,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "operationalDays",
      label: "Operative Tage",
      type: "number",
      position: 8,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "keywords",
      label: "Schlagworte",
      type: "tags",
      position: 9,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "clientName",
      label: "Kundenname",
      type: "text",
      position: 10,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceIt",
      label: "IT-Erfahrung",
      type: "number",
      position: 11,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceIs",
      label: "IS-Erfahrung",
      type: "number",
      position: 12,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceItGs",
      label: "IT/GS-Erfahrung",
      type: "number",
      position: 13,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceGps",
      label: "GPS-Erfahrung",
      type: "number",
      position: 14,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceOther",
      label: "Sonstige Erfahrung",
      type: "number",
      position: 15,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
  ],
}; 