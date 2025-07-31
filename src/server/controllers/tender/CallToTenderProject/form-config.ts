import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

export const createCallToTenderProjectSchema = z.object({
  projectId: z.string().min(1, "Projekt ist erforderlich"),
  callToTenderId: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  role: z.string().optional(),
  description: z.string().optional(),
  relevance: z.string().optional(),
});

export type CreateCallToTenderProject = z.infer<typeof createCallToTenderProjectSchema>;

// Custom hook to fetch form data
export const useFormData = () => {
  // Remove hook since this is a server-side file
  return {
    projects: []
  };
};

// Function to get form fields without hooks
export const getFormFields = (callToTenderId: string): FormFieldSchema[] => {
  return [
    {
      name: "callToTenderId",
      label: "Ausschreibungs-ID",
      type: "hidden" as FieldType,
      value: callToTenderId,
      position: 0,
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    },
    {
      name: "projectId",
      label: "Projekt",
      type: "command" as FieldType,
      required: true,
      position: 1,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      },
      options: {
        endpoint: "projects.all",
        valueField: "id",
        formatLabel: (item: unknown) => {
          if (typeof item === "object" && item !== null && "title" in item) {
            return item.title as string;
          }
          return String(item);
        }
      }
    },
    {
      name: "role",
      label: "Rolle",
      type: "text" as FieldType,
      required: false,
      position: 2,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    },
    {
      name: "relevance",
      label: "Relevanz",
      type: "select" as FieldType,
      required: false,
      position: 3,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      },
      options: [
        { value: "HIGH", label: "Hoch" },
        { value: "MEDIUM", label: "Mittel" },
        { value: "LOW", label: "Niedrig" }
      ]
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea" as FieldType,
      required: false,
      position: 4,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    }
  ];
};

export const defaultValues: Omit<CreateCallToTenderProject, "callToTenderId"> = {
  projectId: "",
  role: undefined,
  description: undefined,
  relevance: undefined,
}; 