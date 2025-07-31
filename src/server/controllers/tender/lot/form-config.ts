import { FormSchema } from "@/types/form";

interface LotOption {
  id: string;
  number: string;
  title: string;
}

export const getLotFormFields = (
  callToTenderId: string,
  parentLotId?: string,
  availableLots: LotOption[] = []
) => {
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
      {
        name: "parentLotID",
        label: "Übergeordnetes Los",
        type: "command",
        required: false,
        position: 6,
        section: generalSection,
        options: availableLots.map(lot => ({
          label: `${lot.number ? `${lot.number} - ` : ""}${lot.title || "Unbenannt"}`,
          value: lot.id
        })),
        defaultValue: parentLotId || null,
      },
    ],
    sections: [generalSection],
  } as const satisfies FormSchema;
}; 