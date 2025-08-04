import { DetailSchema } from "@/types/detail";
import { TenderStatus } from "./schema";
import { ReactNode } from "react";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "description",
      title: "Beschreibung",
      position: 2,
    },
    {
      id: "conditions",
      title: "Teilnahmebedinungen",
      position: 3,
    },
  ],
  fields: [
    {
      name: "title",
      label: "Titel",
      type: "text",
      position: 1,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "type",
      label: "Verfahrenstyp",
      type: "text",
      position: 2,
      transform: (value: unknown): ReactNode => {
        if (!value) return "-";
        return String(value);
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "status",
      label: "Status",
      type: "text",
      position: 3,
      transform: (value: unknown): ReactNode => {
        const statusMap: Record<string, string> = {
          // Schema values
          [TenderStatus.PRAEQUALIFIKATION]: "Präqualifikation",
          [TenderStatus.TEILNAHMEANTRAG]: "Teilnahmeantrag",
          [TenderStatus.ANGEBOTSPHASE]: "Angebotsphase",
          [TenderStatus.WARTEN_AUF_ENTSCHEIDUNG]: "Warten auf Entscheidung",
          [TenderStatus.GEWONNEN]: "Gewonnen",
          [TenderStatus.VERLOREN]: "Verloren",
          [TenderStatus.NICHT_ANGEBOTEN]: "Nicht angeboten",
          
          // Imported values (from Excel) - different from schema values
          "Warten auf Entscheidung": "Warten auf Entscheidung",
          "In Erstellung TNA": "In Erstellung TNA",
          "In Erstellung Angebot": "In Erstellung Angebot",
          "Anderer im Lead": "Anderer im Lead",
          "nicht_angeboten": "Nicht angeboten",
          "in_erstellung_angebot": "In Erstellung Angebot",
          
          // Corrected status values (after fixStatusValues.js)
          "Gewonnen": "Gewonnen",
          "Verloren": "Verloren",
          "Nicht angeboten": "Nicht angeboten",
          "Versendet": "Versendet",
          "Angebotsphase": "Angebotsphase",
          "Verhandlungsphase": "Verhandlungsphase",
          "Warten auf Veröffentlichen": " ",
          "00 Warten auf Veröffentlichen": " ",
          "00 Warten auf Veröffentlichung": " ",
          "01 Lead": " ",
          "Zurückgezogen": "Zurückgezogen",
          "Lead": "Lead",
          "Teilnahmeantrag": "Teilnahmeantrag",
          "Präqualifizierung": "Präqualifizierung",
          "Decliend": "Nicht angeboten",
          "Anderer im Lead - gewonnen": "Anderer im Lead",
          "Anderer im Lead - verloren": "Anderer im Lead",
        };
        
        const statusValue = value as string;
        
        if (!statusValue) {
          return "-";
        }
        
        // Handle empty or space values
        if (statusValue === " " || statusValue === "" || statusValue === "null" || statusValue === null || statusValue === undefined) {
          console.log("Empty status value, returning '-'");
          return "-";
        }
        
        // Return the mapped value or the original value if not found
        const mappedValue = statusMap[statusValue];
        
        return mappedValue || statusValue;
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "organisations",
      label: "Auftraggeber",
      type: "text",
      position: 4,
      transform: (value: unknown): ReactNode => {
        console.log("🔍 Organisations transform called with:", value);
        
        if (!value || !Array.isArray(value)) {
          console.log("❌ No organisations data or not an array");
          return "-";
        }
        
        const organisations = value as any[];
        console.log("🔍 Organisations array length:", organisations.length);
        
        // Show all organisations, not just 'Client' ones
        if (organisations.length === 0) {
          console.log("❌ Organisations array is empty");
          return "-";
        }
        
        // Log each organisation for debugging
        organisations.forEach((org, index) => {
          console.log(`🔍 Organisation ${index + 1}:`, {
            id: org.id,
            name: org.organisation?.name,
            role: org.organisationRole,
            fullOrg: org
          });
        });
        
        // Filter for "Auftraggeber" role if available, otherwise show all
        const clientOrganisations = organisations.filter(org => {
          const role = typeof org.organisationRole === 'string' 
            ? org.organisationRole 
            : org.organisationRole?.role;
          console.log(`🔍 Checking role: "${role}" for org: ${org.organisation?.name}`);
          return !role || role === 'Auftraggeber';
        });
        
        console.log("🔍 Client organisations found:", clientOrganisations.length);
        
        const orgsToShow = clientOrganisations.length > 0 ? clientOrganisations : organisations;
        const result = orgsToShow.map(org => org.organisation?.name || org.name || 'Unbekannt').join(", ");
        
        console.log("🎯 Final result:", result);
        
        return result || "-";
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },

    {
      name: "shortDescription",
      label: "Opp-ID",
      type: "text",
      position: 1,
      transform: (value: unknown): ReactNode => {
        if (!value) return "-";
        return String(value);
      },
      section: {
        id: "description",
        title: "Beschreibung",
        position: 2,
      },
    },
    {
      name: "awardCriteria",
      label: "Zuschlagskriterien",
      type: "text",
      position: 5,
      transform: (value: unknown): ReactNode => {
        if (!value) return "-";
        return String(value);
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "offerDeadline",
      label: "Angebotsfrist",
      type: "date",
      position: 6,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "questionDeadline",
      label: "Fragefrist",
      type: "date",
      position: 7,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "bindingDeadline",
      label: "Bindefrist",
      type: "date",
      position: 8,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "volumeEuro",
      label: "Volumen (Euro)",
      type: "currency",
      position: 9,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "volumePT",
      label: "Volumen (Personentage)",
      type: "number",
      position: 10,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "successChance",
      label: "Zuschlagswahrscheinlichkeit",
      type: "number",
      position: 12,
      transform: (value: unknown): ReactNode => {
        if (!value) return "-";
        return `${value}%`;
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "keywords",
      label: "Schlagworte",
      type: "tags",
      position: 2,
      section: {
        id: "description",
        title: "Beschreibung",
        position: 2,
      },
    },
    {
      name: "websiteTenderPlattform",
      label: "Link Vergabeplattform",
      type: "link",
      position: 1,
      section: {
        id: "conditions",
        title: "Teilnahmebedinungen",
        position: 3,
      },
    },
    {
      name: "notes",
      label: "Weitere Details",
      type: "text",
      position: 11,
      transform: (value: unknown): ReactNode => {
        if (!value) return "-";
        return String(value);
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "standards",
      label: "Standards",
      type: "tags",
      position: 13,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "volumeHoursTotal",
      label: "Volumen (Stunden)",
      type: "number",
      position: 14,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "approvedMargin",
      label: "Genehmigte Marge",
      type: "number",
      position: 15,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "firstContactDate",
      label: "Datum Erstkontakt",
      type: "date",
      position: 16,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "serviceDate",
      label: "Leistungszeitpunkt",
      type: "date",
      position: 17,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "evbItContractNumber",
      label: "EVB-IT-Vertragsnummer",
      type: "text",
      position: 18,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "evbItContractLocation",
      label: "EVB-IT-Vertragsspeicherort",
      type: "text",
      position: 19,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
  ],
}; 