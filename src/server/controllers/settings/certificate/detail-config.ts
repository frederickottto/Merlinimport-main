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
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "type",
      label: "Typ",
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
      name: "category",
      label: "Kategorie",
      type: "text",
      position: 4,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "deeplink",
      label: "Deeplink/Pfad",
      type: "text",
      position: 5,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "salesCertificate",
      label: "Verkaufszertifikat",
      type: "boolean",
      position: 6,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
  ],
}; 