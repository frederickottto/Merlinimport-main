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
      label: "Typ",
      type: "text",
      position: 2,
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
          [TenderStatus.PRAEQUALIFIKATION]: "Präqualifikation",
          [TenderStatus.TEILNAHMEANTRAG]: "Teilnahmeantrag",
          [TenderStatus.ANGEBOTSPHASE]: "Angebotsphase",
          [TenderStatus.WARTEN_AUF_ENTSCHEIDUNG]: "Warten auf Entscheidung",
          [TenderStatus.GEWONNEN]: "Gewonnen",
          [TenderStatus.VERLOREN]: "Verloren",
          [TenderStatus.NICHT_ANGEBOTEN]: "Nicht angeboten",
        };
        
        return statusMap[value as string] || String(value);
      },
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
    {
      name: "shortDescription",
      label: "Kurzbeschreibung",
      type: "text",
      position: 1,
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
      position: 4,
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
      position: 5,
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
      position: 6,
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
      position: 7,
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
      position: 8,
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
      position: 9,
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
      position: 10,
      transform: (value: unknown): ReactNode => `${value}%`,
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
      label: "Anmerkungen",
      type: "text",
      position: 11,
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
      position: 12,
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
      position: 13,
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
      position: 14,
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
      position: 15,
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
      position: 16,
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
      position: 17,
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
      position: 18,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1,
      },
    },
  ],
}; 