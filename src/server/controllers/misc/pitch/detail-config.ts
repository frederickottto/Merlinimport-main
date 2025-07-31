import type { DetailFieldSchema } from "@/types/detail";

const overviewSection = {
  id: "overview",
  title: "Übersicht",
  position: 1
};

export const pitchDetailConfig: DetailFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text",
    position: 1,
    section: overviewSection
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "text",
    position: 2,
    section: overviewSection
  },
  {
    name: "templateVariables",
    label: "Template Variablen",
    type: "text",
    position: 3,
    section: overviewSection
  },
  {
    name: "createdAt",
    label: "Erstellt am",
    type: "date",
    position: 4,
    section: overviewSection
  },
  {
    name: "updatedAt",
    label: "Aktualisiert am",
    type: "date",
    position: 5,
    section: overviewSection
  },
]; 