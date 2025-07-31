import { DetailSchema } from "@/types/detail";

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Overview",
      position: 1,
    },
  ],
  fields: [
    {
      name: "industrySector",
      label: "Industry Sector",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Overview",
        position: 1
      },
    },
    {
      name: "industrySectorEY",
      label: "Industry Sector EY",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Overview",
        position: 1
      },
    },
  ],
}; 