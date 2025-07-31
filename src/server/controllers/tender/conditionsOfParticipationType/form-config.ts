import { type FormFieldSchema } from "@/types/form";
import type { ConditionsOfParticipationType } from "./schema";

export const conditionsOfParticipationTypeDefaultValues: Partial<ConditionsOfParticipationType> = {
  title: "",
  description: null,
  parentTypeIDs: "none",
};

export function getConditionsOfParticipationTypeFormFields(
  availableTypes: ConditionsOfParticipationType[] = []
): FormFieldSchema[] {
  return [
    {
      name: "title",
      label: "Titel",
      type: "text",
      required: true,
      position: 1,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      required: false,
      position: 2,
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
    {
      name: "parentTypeIDs",
      label: "Übergeordneter Typ",
      type: "select",
      required: false,
      position: 3,
      defaultValue: "none",
      options: [
        { label: "Kein übergeordneter Typ", value: "none" },
        ...availableTypes.map(type => ({
          label: type.title,
          value: type.id,
        }))
      ],
      section: {
        id: "basic",
        title: "Grundinformationen",
      },
    },
  ];
} 