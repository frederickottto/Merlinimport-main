import { type DetailFieldSchema } from "@/types/detail";

export const conditionsOfParticipationDetailConfig = {
  fields: [
    {
      name: "title",
      label: "Titel",
      type: "text",
      position: 1,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
    {
      name: "duration",
      label: "Dauer (in Monaten)",
      type: "number",
      position: 2,
      section: {
        id: "requirements",
        title: "Anforderungen",
      },
    },
    {
      name: "volumeEuro",
      label: "Volumen (in Euro)",
      type: "currency",
      position: 3,
      section: {
        id: "requirements",
        title: "Anforderungen",
      },
    },
    {
      name: "requirements",
      label: "Anforderungen",
      type: "textarea",
      position: 4,
      section: {
        id: "requirements",
        title: "Anforderungen",
      },
    },
    {
      name: "experienceIt",
      label: "IT-Erfahrung (in Jahren)",
      type: "number",
      position: 5,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "experienceIs",
      label: "IS-Erfahrung (in Jahren)",
      type: "number",
      position: 6,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "experienceItGs",
      label: "IT-GS-Erfahrung (in Jahren)",
      type: "number",
      position: 7,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "experienceGPS",
      label: "GPS-Erfahrung (in Jahren)",
      type: "number",
      position: 8,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "experienceOther",
      label: "Sonstige Erfahrung (in Jahren)",
      type: "number",
      position: 9,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "experienceAll",
      label: "Gesamterfahrung (in Jahren)",
      type: "number",
      position: 10,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "executivePosition",
      label: "Führungsposition",
      type: "boolean",
      position: 11,
      section: {
        id: "experience",
        title: "Erfahrung",
      },
    },
    {
      name: "academicDegree",
      label: "Akademische Abschlüsse",
      type: "tags",
      position: 12,
      section: {
        id: "education",
        title: "Ausbildung",
      },
    },
    {
      name: "academicStudy",
      label: "Studiengänge",
      type: "tags",
      position: 13,
      section: {
        id: "education",
        title: "Ausbildung",
      },
    },
    {
      name: "certificate",
      label: "Zertifikate",
      type: "tags",
      position: 14,
      section: {
        id: "certificates",
        title: "Zertifikate",
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (Array.isArray(value)) {
          return value.map((cert: { id: string; title: string }) => 
            cert.title || cert.id
          ).join(", ");
        }
        return String(value);
      },
    },
    {
      name: "industrySector",
      label: "Branchen",
      type: "tags",
      position: 15,
      section: {
        id: "certificates",
        title: "Zertifikate",
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (Array.isArray(value)) {
          return value.map((sector: { id: string; industrySector: string }) => 
            sector.industrySector || sector.id
          ).join(", ");
        }
        return String(value);
      },
    },
    {
      name: "criterionType",
      label: "Kriterientyp",
      type: "select",
      position: 16,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
      options: [
        { value: "MUST", label: "Muss-Kriterium" },
        { value: "SHOULD", label: "Soll-Kriterium" },
        { value: "CAN", label: "Kann-Kriterium" },
      ],
    },
  ] as DetailFieldSchema[],
  sections: [
    {
      id: "basic",
      title: "Grundinformationen",
      position: 1,
    },
    {
      id: "requirements",
      title: "Anforderungen",
      position: 2,
    },
    {
      id: "experience",
      title: "Erfahrung",
      position: 3,
    },
    {
      id: "education",
      title: "Ausbildung",
      position: 4,
    },
    {
      id: "certificates",
      title: "Zertifikate",
      position: 5,
    },
  ],
}; 