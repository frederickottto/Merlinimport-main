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
      name: "degreeTitleShort",
      label: "Abschluss (Kurz)",
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
      name: "degreeTitleLong",
      label: "Abschluss (Lang)",
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
      name: "completed",
      label: "Abgeschlossen",
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
      name: "study",
      label: "Studiengang",
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
      name: "studyStart",
      label: "Studienbeginn",
      type: "date",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "studyEnd",
      label: "Studienende",
      type: "date",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "university",
      label: "Universität",
      type: "text",
      position: 9,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "studyMINT",
      label: "MINT-Studiengang",
      type: "boolean",
      position: 8,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
  ],
}; 