import { DetailSchema } from "@/types/detail";

const generalSection = {
  id: "general",
  title: "Allgemein",
  position: 0,
};

export const workpackageDetailConfig = {
  sections: [generalSection],
  fields: [
    {
      name: "number",
      label: "Nummer",
      type: "text",
      position: 0,
      section: generalSection,
    },
    {
      name: "title",
      label: "Titel",
      type: "text",
      position: 1,
      section: generalSection,
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "text",
      position: 2,
      section: generalSection,
    },
    {
      name: "volumeEuro",
      label: "Volumen (€)",
      type: "number",
      position: 3,
      section: generalSection,
    },
    {
      name: "volumePT",
      label: "Volumen (PT)",
      type: "number",
      position: 4,
      section: generalSection,
    },
  ],
} as const satisfies DetailSchema; 