import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "costs",
      title: "Kosten",
      position: 2,
    }
  ],
  fields: [
    {
      name: "employee",
      label: "Mitarbeiter",
      type: "text",
      position: 1,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        if (typeof value === 'object' && value !== null && 'foreName' in value && 'lastName' in value) {
          return `${value.foreName} ${value.lastName}`.trim();
        }
        return String(value);
      },
    },
    {
      name: "employeeCallToTenderRole",
      label: "Rolle",
      type: "text",
      position: 2,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        if (typeof value !== 'string') return String(value);
        const roleMap: Record<string, string> = {
          PROJECT_MANAGER: "Projektmanager",
          TECHNICAL_LEAD: "Technischer Leiter",
          BUSINESS_ANALYST: "Business Analyst",
          DEVELOPER: "Entwickler",
          TESTER: "Tester",
          OTHER: "Sonstiges",
        };
        return roleMap[value] || value;
      },
    },
    {
      name: "role",
      label: "Position",
      type: "text",
      position: 3,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "profileTitle",
      label: "Profilbezeichnung",
      type: "text",
      position: 4,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 5,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "costCenter",
      label: "Kostenstelle",
      type: "currency",
      position: 1,
      width: "full",
      section: { id: "costs", title: "Kosten", position: 2 },
      format: {
        currencyCode: "EUR"
      }
    },
    {
      name: "profilePrice",
      label: "Profilpreis",
      type: "currency",
      position: 2,
      width: "full",
      section: { id: "costs", title: "Kosten", position: 2 },
      format: {
        currencyCode: "EUR"
      }
    },
    {
      name: "travelCost",
      label: "Reisekosten",
      type: "currency",
      position: 3,
      width: "full",
      section: { id: "costs", title: "Kosten", position: 2 },
      format: {
        currencyCode: "EUR"
      }
    }
  ],
};
