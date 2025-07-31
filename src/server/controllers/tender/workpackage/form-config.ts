import { FormSchema } from "@/types/form";

export const getWorkpackageFormFields = () => {
  const generalSection = {
    id: "general",
    title: "Allgemein",
    position: 1,
  };

  return {
    fields: [
      {
        name: "number",
        label: "Nummer",
        type: "text",
        required: false,
        position: 1,
        section: generalSection,
      },
      {
        name: "title",
        label: "Titel",
        type: "text",
        required: false,
        position: 2,
        section: generalSection,
      },
      {
        name: "description",
        label: "Beschreibung",
        type: "textarea",
        required: true,
        position: 3,
        section: generalSection,
      },
      {
        name: "volumeEuro",
        label: "Volumen (€)",
        type: "currency",
        required: false,
        position: 4,
        section: generalSection,
      },
      {
        name: "volumePT",
        label: "Volumen (PT)",
        type: "currency",
        required: false,
        position: 5,
        section: generalSection,
      },
    
    ],
    sections: [generalSection],
  } as const satisfies FormSchema;
}; 