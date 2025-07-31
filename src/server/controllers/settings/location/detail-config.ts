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
      name: "street",
      label: "Straße",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "houseNumber",
      label: "Hausnummer",
      type: "text",
      position: 2,
      width: "half",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "postCode",
      label: "Postleitzahl",
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
      name: "city",
      label: "Stadt",
      type: "text",
      position: 4,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "country",
      label: "Land",
      type: "text",
      position: 5,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    }
  ],
}; 