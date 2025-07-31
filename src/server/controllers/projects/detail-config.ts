import { DetailFieldSchema, DetailSchema } from "@/types/detail";

const baseFields: DetailFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text",
    position: 1,
    width: "full",
    section: {
      id: "overview",
      title: "Projektübersicht",
      position: 4
    },
  },
  {
    name: "type",
    label: "Projekttyp",
    type: "text",
    position: 1,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
  },
  {
    name: "referenceApproval",
    label: "Referenzgenehmigung",
    type: "boolean",
    position: 2,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea",
    position: 4,
    width: "full",
    section: {
      id: "overview",
      title: "Projektübersicht",
      position: 4
    },
  },
  {
    name: "keywords",
    label: "Schlagwörter",
    type: "tags",
    position: 5,
    width: "full",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
    transform: (value: unknown) => {
      if (!value) return "Keine Schlagwörter vorhanden";
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.join(", ") || "Keine Schlagwörter vorhanden";
          }
        } catch {
          // If parsing fails, treat as string
          return value || "Keine Schlagwörter vorhanden";
        }
      }
      if (Array.isArray(value)) {
        return value.join(", ") || "Keine Schlagwörter vorhanden";
      }
      return "Keine Schlagwörter vorhanden";
    }
  },
  {
    name: "teamSize",
    label: "Teamgröße",
    type: "number",
    position: 2,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
  },
  {
    name: "scopeAuditHours",
    label: "Audit-Stunden",
    type: "number",
    position: 2,
    width: "half",
    section: {
      id: "timeline",
      title: "Zeitplan",
      position: 2
    },
  },
  {
    name: "volumePTTotal",
    label: "Gesamt PT",
    type: "number",
    position: 3,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "volumePTRetrieved",
    label: "Abgerufene PT",
    type: "number",
    position: 4,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "volumeEuroTotal",
    label: "Gesamtvolumen (€)",
    type: "currency",
    position: 1,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "volumeEuroRetrieved",
    label: "Abgerufenes Volumen (€)",
    type: "currency",
    position: 2,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "contractBeginn",
    label: "Vertragsbeginn",
    type: "date",
    position: 1,
    width: "half",
    section: {
      id: "timeline",
      title: "Zeitplan",
      position: 2
    },
  },
  {
    name: "contractEnd",
    label: "Vertragsende",
    type: "date",
    position: 2,
    width: "half",
    section: {
      id: "timeline",
      title: "Zeitplan",
      position: 2
    },
  },
  {
    name: "standards",
    label: "Standards",
    type: "tags",
    position: 6,
    width: "full",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
    transform: (value: unknown) => {
      if (!value) return "Keine Standards vorhanden";
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            return parsed.join(", ") || "Keine Standards vorhanden";
          }
        } catch {
          return value || "Keine Standards vorhanden";
        }
      }
      if (Array.isArray(value)) {
        return value.join(", ") || "Keine Standards vorhanden";
      }
      return "Keine Standards vorhanden";
    }
  },
  {
    name: "volumeHoursTotal",
    label: "Volumen (Stunden)",
    type: "number",
    position: 5,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "approvedMargin",
    label: "Genehmigte Marge",
    type: "number",
    position: 6,
    width: "half",
    section: {
      id: "financial",
      title: "Finanzielle Details",
      position: 1
    },
  },
  {
    name: "firstContactDate",
    label: "Datum Erstkontakt",
    type: "date",
    position: 3,
    width: "half",
    section: {
      id: "timeline",
      title: "Zeitplan",
      position: 2
    },
  },
  {
    name: "serviceDate",
    label: "Leistungszeitpunkt",
    type: "date",
    position: 4,
    width: "half",
    section: {
      id: "timeline",
      title: "Zeitplan",
      position: 2
    },
  },
  {
    name: "evbItContractNumber",
    label: "EVB-IT-Vertragsnummer",
    type: "text",
    position: 4,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
  },
  {
    name: "evbItContractLocation",
    label: "EVB-IT-Vertragsspeicherort",
    type: "text",
    position: 5,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
  },
  {
    name: "frameworkContractProject",
    label: "Rahmenvertrag",
    type: "text",
    position: 3,
    width: "third",
    section: {
      id: "misc",
      title: "Sonstiges",
      position: 3
    },
    transform: (value: unknown) => {
      if (!value) return "-";
      if (typeof value === 'string') {
        return value || "-";
      }
      if (typeof value === 'object' && value !== null) {
        // Handle both possible structures
        if ('title' in value) {
          return (value as { title?: string | null }).title || "-";
        }
        if ('id' in value) {
          return (value as { id?: string | null }).id || "-";
        }
      }
      return "-";
    }
  },
];

const sections = [
  {
    id: "overview",
    title: "Projektübersicht",
    position: 4,
  },
  {
    id: "financial",
    title: "Finanzielle Details",
    position: 1,
  },
  {
    id: "timeline",
    title: "Zeitplan",
    position: 2,
  },
  {
    id: "misc",
    title: "Sonstiges",
    position: 3,
  }
];

export const detailSchema: DetailSchema = {
  fields: baseFields,
  sections,
};
