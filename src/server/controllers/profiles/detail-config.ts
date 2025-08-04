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
    // Personal Information
    {
      name: "pseudonym",
      label: "Nachname",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
    },

    {
      name: "employeerCompany",
      label: "Arbeitgeber",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
    },
    {
      name: "counselor",
      label: "Counselor",
      type: "text",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
    },
    {
      name: "titles",
      label: "Anreden",
      type: "tags",
      position: 0,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (Array.isArray(value)) {
          return value.map((title: { display?: string; salutationShort?: string; salutationLong?: string }) => 
            title.display || `${title.salutationShort}${title.salutationLong ? ` (${title.salutationLong})` : ''}`
          ).join(", ");
        }
        return String(value);
      },
    },
    {
      name: "division",
      label: "Abteilung",
      type: "text",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (typeof value === 'object' && value !== null) {
          const division = value as { title: string; abbreviation?: string };
          return division.abbreviation ? `${division.title} (${division.abbreviation})` : division.title;
        }
        return String(value);
      },
    },

    // Contact Information
    {
      name: "mobile",
      label: "Mobil",
      type: "text",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "contact",
        subsectionTitle: "Kontaktinformationen",
        position: 1
      },
    },
    {
      name: "telephone",
      label: "Telefon",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "contact",
        subsectionTitle: "Kontaktinformationen",
        position: 1
      },
    },
    {
      name: "linkedInURL",
      label: "LinkedIn",
      type: "link",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "contact",
        subsectionTitle: "Kontaktinformationen",
        position: 1
      },
    },
    {
      name: "xingURL",
      label: "Xing",
      type: "link",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "contact",
        subsectionTitle: "Kontaktinformationen",
        position: 1
      },
    },
    {
      name: "discoverURL",
      label: "Discover",
      type: "link",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "contact",
        subsectionTitle: "Kontaktinformationen",
        position: 1
      },
    },

    // Experience Information
    {
      name: "experienceIt",
      label: "IT-Erfahrung",
      type: "number",
      position: 1,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },
    {
      name: "experienceIs",
      label: "IS-Erfahrung",
      type: "number",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },
    {
      name: "experienceItGs",
      label: "IT-GS-Erfahrung",
      type: "number",
      position: 3,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },
    {
      name: "experienceGps",
      label: "GPS-Erfahrung",
      type: "number",
      position: 4,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },
    {
      name: "experienceOther",
      label: "Sonstige Erfahrung",
      type: "number",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },
    {
      name: "experienceAll",
      label: "Gesamterfahrung",
      type: "number",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "experience",
        subsectionTitle: "Erfahrung",
        position: 1
      },
    },

    // Description
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "description",
        subsectionTitle: "Beschreibung",
        position: 1
      },
    },

    // EmployeeRank
    {
      name: "employeeRank",
      label: "Mitarbeiter-Rang",
      type: "text",
      position: 5,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
    },

    {
      name: "location",
      label: "Standort",
      type: "text",
      position: 6,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
      transform: (value: unknown) => {
        if (!value) return "-";
        if (typeof value === 'object' && value !== null) {
          const location = value as { street: string; houseNumber: string; postCode: string; city: string; region: string; country: string };
          return `${location.street} ${location.houseNumber}, ${location.postCode} ${location.city}, ${location.region}, ${location.country}`;
        }
        return String(value);
      },
    },

    {
      name: "contractStartDate",
      label: "Vertragsbeginn",
      type: "date",
      position: 7,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        subsection: "personal",
        subsectionTitle: "Persönliche Informationen",
        position: 1
      },
    },
  ],
};
