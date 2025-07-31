import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "costs",
      title: "Kosten",
      position: 2,
    }
  ],
  fields: [
    {
      name: "employeePositionShort",
      label: "Position (Kurz)",
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
      name: "employeePositionLong",
      label: "Position (Lang)",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "employeeCostStraight",
      label: "Stundensatz",
      type: "currency",
      position: 1,
      width: "half",
      section: {
        id: "costs",
        title: "Kosten",
        position: 2
      },
      format: {
        currencyCode: "EUR"
      }
    }
  ],
}; 