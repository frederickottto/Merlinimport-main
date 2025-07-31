import { DetailSchema } from "@/types/detail";

const roleMap: Record<string, string> = {
  CLIENT: "Auftraggeber",
  CONTRACTOR: "Auftragnehmer",
  PARTNER: "Partner",
  CONSULTANT: "Berater",
};

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
      name: "organisation.name",
      label: "Organisation",
      type: "text",
      position: 1,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 }
    },
    {
      name: "organisationRole.role",
      label: "Rolle",
      type: "text",
      position: 2,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        const role = value as string;
        return roleMap[role] || role;
      }
    }
  ],
};
