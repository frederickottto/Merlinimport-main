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
      name: "employee",
      label: "Mitarbeiter",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      transform: (value: unknown) => {
        if (typeof value === 'object' && value !== null && 'foreName' in value && 'lastName' in value) {
          return `${value.foreName} ${value.lastName}`.trim();
        }
        return String(value);
      },
    },
    {
      name: "industrySector",
      label: "Branche",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (typeof value === 'object' && value !== null) {
          if ('industrySector' in value) {
            return String((value as { industrySector: string }).industrySector);
          }
        }
        return "-";
      },
    },
    {
      name: "voccationalTitleShort",
      label: "Berufsbezeichnung (Kurz)",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "voccationalTitleLong",
      label: "Berufsbezeichnung (Lang)",
      type: "text",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "voccationalMINT",
      label: "MINT-Beruf?",
      type: "boolean",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "company",
      label: "Unternehmen",
      type: "text",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "voccationalStart",
      label: "Berufsbeginn",
      type: "date",
      position: 7,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "voccationalEnd",
      label: "Berufsende",
      type: "date",
      position: 8,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
  ],
}; 