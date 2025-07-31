import { type DetailFieldSchema } from "@/types/detail";

export const conditionsOfParticipationTypeDetailConfig = {
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
      name: "description",
      label: "Beschreibung",
      type: "text",
      position: 2,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
    {
      name: "parentType.title",
      label: "Übergeordneter Typ",
      type: "text",
      position: 3,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
  ] as DetailFieldSchema[],
  sections: [
    {
      id: "basic",
      title: "Grundinformationen",
      position: 1,
    },
  ],
}; 