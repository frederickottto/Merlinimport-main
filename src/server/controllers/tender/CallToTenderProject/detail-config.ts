import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "details",
      title: "Details",
      position: 2,
    }
  ],
  fields: [
    {
      name: "project",
      label: "Projekt",
      type: "text",
      position: 1,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown): string => {
        if (typeof value === 'object' && value !== null && 'title' in value) {
          return String(value.title);
        }
        return String(value);
      },
    },
    {
      name: "project.id",
      label: "Projekt Details",
      type: "link",
      position: 2,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown): string => {
        if (typeof value === 'object' && value !== null && 'id' in value) {
          return `/projects/${value.id}`;
        }
        return "#";
      },
    },
    {
      name: "project.type",
      label: "Typ",
      type: "text",
      position: 3,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown): string => {
        if (typeof value === 'object' && value !== null) {
          if ('projectIT' in value && value.projectIT) return "IT";
          if ('projectIS' in value && value.projectIS) return "IS";
          if ('projectGS' in value && value.projectGS) return "GS";
        }
        return String(value);
      },
    },
    {
      name: "role",
      label: "Rolle",
      type: "text",
      position: 4,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "relevance",
      label: "Relevanz",
      type: "text",
      position: 5,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown): string => {
        if (typeof value !== 'string') return String(value);
        const relevanceMap: Record<string, string> = {
          HIGH: "Hoch",
          MEDIUM: "Mittel",
          LOW: "Niedrig",
        };
        return relevanceMap[value] || value;
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 1,
      width: "full",
      section: { id: "details", title: "Details", position: 2 },
    },
    {
      name: "project.description",
      label: "Projektbeschreibung",
      type: "textarea",
      position: 2,
      width: "full",
      section: { id: "details", title: "Details", position: 2 },
      transform: (value: unknown): string => {
        if (typeof value === 'object' && value !== null && 'description' in value) {
          return String(value.description);
        }
        return String(value);
      },
    }
  ],
}; 