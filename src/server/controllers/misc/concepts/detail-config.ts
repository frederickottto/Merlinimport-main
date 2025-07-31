import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "template",
      title: "Template",
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
      name: "title",
      label: "Titel",
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
      name: "status",
      label: "Status",
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
      name: "textMaturity",
      label: "Textreife",
      type: "boolean",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "wordCount",
      label: "Wortanzahl",
      type: "number",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "language",
      label: "Sprachen",
      type: "tags",
      position: 5,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "genderNeutral",
      label: "Gender-neutral",
      type: "boolean",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "professionalTone",
      label: "Professioneller Ton",
      type: "boolean",
      position: 7,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "containsGraphics",
      label: "Enthält Grafiken",
      type: "boolean",
      position: 8,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "template",
      label: "Templates",
      type: "tags",
      position: 1,
      width: "full",
      section: {
        id: "template",
        title: "Template",
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