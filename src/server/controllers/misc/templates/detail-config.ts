import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Wichtige Informationen",
      position: 1,
    },
    {
      id: "concepts",
      title: "Konzepte",
      position: 2,
    },
    {
      id: "description",
      title: "Beschreibung",
      position: 3,
    },
    {
      id: "keywords",
      title: "Schlagworte",
      position: 4,
    },
    {
      id: "notes",
      title: "Anmerkungen",
      position: 5,
    },
  ],
  fields: [
    {
      name: "type",
      label: "Typ",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Wichtige Informationen",
        position: 1
      },
    },
    {
      name: "filePath",
      label: "Dateipfad",
      type: "link",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Wichtige Informationen",
        position: 1
      },
    },
    {
      name: "conceptIDs",
      label: "Konzepte",
      type: "tags",
      position: 1,
      width: "full",
      section: {
        id: "concepts",
        title: "Konzepte",
        position: 2
      }
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 1,
      width: "full",
      section: {
        id: "description",
        title: "Beschreibung",
        position: 3
      },
    },
    {
      name: "keywords",
      label: "Schlagworte",
      type: "tags",
      position: 1,
      width: "full",
      section: {
        id: "keywords",
        title: "Schlagworte",
        position: 4
      },
    },
    {
      name: "notes",
      label: "Anmerkungen",
      type: "textarea",
      position: 1,
      width: "full",
      section: {
        id: "notes",
        title: "Anmerkungen",
        position: 5
      },
    },
  ],
}; 