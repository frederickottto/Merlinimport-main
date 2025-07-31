import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "experience",
      title: "Erfahrung",
      position: 2,
    },
    {
      id: "description",
      title: "Beschreibung",
      position: 3,
    },
  ],
  fields: [
    {
      name: "employee",
      label: "Mitarbeiter",
      type: "text",
      position: 0,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "position",
      label: "Position",
      type: "text",
      position: 1,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "executivePosition",
      label: "Führungsposition",
      type: "boolean",
      position: 2,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "employer",
      label: "Arbeitgeber",
      type: "text",
      position: 3,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "industrySector",
      label: "Branche",
      type: "text",
      position: 4,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (typeof value === 'object' && value !== null) {
          if ('industrySector' in value) {
            const sector = (value as { industrySector: string }).industrySector;
            return sector || "-";
          }
        }
        return "-";
      },
    },
    {
      name: "professionStart",
      label: "Beginn",
      type: "date",
      position: 5,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "professionEnd",
      label: "Ende",
      type: "date",
      position: 6,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "experienceIt",
      label: "IT-Erfahrung",
      type: "number",
      position: 1,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "experienceIs",
      label: "IS-Erfahrung",
      type: "number",
      position: 2,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "experienceItGs",
      label: "IT-GS-Erfahrung",
      type: "number",
      position: 3,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "experienceGps",
      label: "GPS-Erfahrung",
      type: "number",
      position: 4,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "experienceOther",
      label: "Sonstige Erfahrung",
      type: "number",
      position: 5,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "experienceAll",
      label: "Gesamterfahrung",
      type: "number",
      position: 6,
      section: {
        id: "experience",
        title: "Erfahrung",
        position: 2
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      width: "full",
      position: 1,
      section: {
        id: "description",
        title: "Beschreibung",
        position: 3
      },
    },
  ],
}; 