import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Ausschreibungsorganisationsdaten",
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
        title: "Ausschreibungsorganisationsdaten",
        position: 1
      },
    },
    {
      name: "callToTenderIDs",
      label: "Ausschreibung",
      type: "text",
      position: 2,
      section: {
        id: "overview",
        title: "Ausschreibungsorganisationsdaten",
        position: 1
      },
    },
    {
      name: "organisationRole",
      label: "Rolle der Organisation",
      type: "text",
      position: 3,
      section: {
        id: "overview",
        title: "Ausschreibungsorganisationsdaten",
        position: 1
      },
    },
  ],
}; 