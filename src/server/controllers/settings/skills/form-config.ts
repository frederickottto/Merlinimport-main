import { z } from "zod";
import { FormConfig } from "@/types/form";
import { FormSchema } from "@/types/form";

export const skillTypes = [
  { label: "Technisch", value: "Technisch" },
  { label: "Soft Skills", value: "Soft Skills" },
  { label: "Sprache", value: "Sprache" },
  { label: "Zertifizierung", value: "Zertifizierung" },
] as const;

export type SkillType = typeof skillTypes[number]["value"];

export const skillFormConfig: FormConfig = {
  title: "Fähigkeit",
  description: "Erstellen oder bearbeiten Sie eine Fähigkeit",
  sections: [
    {
      title: "Übersicht",
      fields: [
        {
          name: "title",
          label: "Titel",
          type: "text",
          required: true,
          position: 1,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "type",
          label: "Typ",
          type: "select",
          options: {
            items: skillTypes.map(type => ({
              label: type.label,
              value: type.value
            })),
          },
          position: 2,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "description",
          label: "Beschreibung",
          type: "textarea",
          position: 3,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
      ],
    },
  ],
};

export const skillFormSchema = z.object({
  title: z.string(),
  type: z.enum([
    "Technisch",
    "Soft Skills",
    "Sprache",
    "Zertifizierung"
  ]).optional(),
  description: z.string().optional(),
});

export const formSchema: FormSchema = {
  fields: [
    {
      name: "title",
      label: "Titel",
      type: "text",
      required: true,
      position: 1,
      section: {
        id: "overview",
        title: "Übersicht",
      },
    },
    {
      name: "type",
      label: "Typ",
      type: "select",
      options: {
        items: skillTypes.map(type => ({
          label: type.label,
          value: type.value
        })),
      },
      position: 2,
      section: {
        id: "overview",
        title: "Übersicht",
      },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 3,
      section: {
        id: "overview",
        title: "Übersicht",
      },
    },
  ],
}; 