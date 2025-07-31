import { z } from "zod";
import { DetailSchema } from "@/types/detail";

export const detailSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      fields: z.array(
        z.object({
          name: z.string(),
          label: z.string(),
        })
      ),
    })
  ),
});

export const certificateDetailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
  ],
  fields: [
    {
      name: "employeeDisplayName",
      label: "Mitarbeiter",
      type: "text",
      width: "full",
      position: 1,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "certificateTitle",
      label: "Zertifikat",
      type: "text",
      width: "full",
      position: 2,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "validUntil",
      label: "Gültig bis",
      type: "date",
      width: "full",
      position: 3,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "issuer",
      label: "Ausstellende Stelle",
      type: "text",
      width: "full",
      position: 4,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "certificateCategory",
      label: "Kategorie",
      type: "text",
      width: "full",
      position: 5,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "certificateDeeplink",
      label: "Deeplink/Pfad",
      type: "text",
      width: "full",
      position: 6,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "certificateSalesCertificate",
      label: "Verkaufszertifikat",
      type: "boolean",
      width: "full",
      position: 7,
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
  ],
}; 