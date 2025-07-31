import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Projektaktivitätsdaten",
      position: 1,
    },
  ],
  fields: [
    {
      name: "organisationIDs",
      label: "Organisation",
      type: "text",
      position: 1,
      section: {
        id: "overview",
        title: "Projektaktivitätsdaten",
        position: 1
      },
    },
    {
      name: "projectIDs",
      label: "Projekt",
      type: "text",
      position: 2,
      section: {
        id: "overview",
        title: "Projektaktivitätsdaten",
        position: 1
      },
    },
    {
      name: "role",
      label: "Rolle",
      type: "text",
      position: 3,
      section: {
        id: "overview",
        title: "Projektaktivitätsdaten",
        position: 1
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "text",
      position: 4,
      section: {
        id: "overview",
        title: "Projektaktivitätsdaten",
        position: 1
      },
    },
  ],
}; 