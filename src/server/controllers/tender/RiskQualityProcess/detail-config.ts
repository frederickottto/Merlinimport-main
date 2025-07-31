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
    { name: "type", label: "Typ", type: "text", position: 1, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
    { name: "status", label: "Status", type: "text", position: 2, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
    { name: "note", label: "Notiz", type: "textarea", position: 3, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
    { name: "organisation.name", label: "Organisation", type: "text", position: 4, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
    { name: "createdAt", label: "Erstellt am", type: "date", position: 5, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
    { name: "updatedAt", label: "Aktualisiert am", type: "date", position: 6, width: "full", section: { id: "overview", title: "Übersicht", position: 1 } },
  ],
}; 