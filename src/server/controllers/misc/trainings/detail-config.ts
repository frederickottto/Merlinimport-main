import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Wichtige Informationen",
      position: 1,
    },
    {
      id: "description",
      title: "Beschreibung",
      position: 2,
    },
  ],
  fields: [
    {
      name: "trainingTitle",
      label: "Titel",
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
      name: "trainingType",
      label: "Typ",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Wichtige Informationen",
        position: 1
      },
    },
    {
      name: "trainingTemplateID",
      label: "Vorlage",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Wichtige Informationen",
        position: 1
      },
    },
    {
      name: "trainingContent",
      label: "Inhalt",
      type: "textarea",
      position: 4,
      width: "full",
      section: {
        id: "description",
        title: "Beschreibung",
        position: 2
      },
    },
  ],
}; 