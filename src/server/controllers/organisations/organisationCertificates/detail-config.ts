import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Zertifikatsdaten",
      position: 1,
    },
  ],
  fields: [
    {
      name: "organisationIDs",
      label: "Organisation",
      type: "text",
      position: 1,
      section: {
        id: "overview",
        title: "Zertifikatsdaten",
        position: 1
      },
    },
    {
      name: "certificateIDs",
      label: "Zertifikat",
      type: "text",
      position: 2,
      section: {
        id: "overview",
        title: "Zertifikatsdaten",
        position: 1
      },
    },
    {
      name: "certificationObject",
      label: "Zertifizierungsobjekt",
      type: "text",
      position: 3,
      section: {
        id: "overview",
        title: "Zertifikatsdaten",
        position: 1
      },
    },
    {
      name: "validUntil",
      label: "Gültig bis",
      type: "date",
      position: 4,
      section: {
        id: "overview",
        title: "Zertifikatsdaten",
        position: 1
      },
    },
  ],
}; 