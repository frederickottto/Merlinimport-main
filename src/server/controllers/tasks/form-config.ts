import { FormFieldSchema } from "@/types/form";
import { z } from "zod";

export const formSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
  assignedToId: z.string().optional().transform(val => val === "" ? undefined : val),
  dueDate: z.date().optional().nullable(),
});

export const getFormFields = (): FormFieldSchema[] => [
  {
    name: "title",
    label: "Titel",
    type: "text",
    required: true,
    position: 0,
    width: "full",
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea",
    required: true,
    position: 1,
    width: "full",
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    position: 2,
    width: "half",
    options: [
      { value: "TODO", label: "Zu erledigen" },
      { value: "IN_PROGRESS", label: "In Bearbeitung" },
      { value: "DONE", label: "Erledigt" },
    ],
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "assignedToId",
    label: "Zugewiesen an",
    type: "command",
    required: false,
    position: 3,
    width: "half",
    options: {
      endpoint: "profiles.all",
      labelField: "foreName",
      valueField: "id",
      multiple: false,
      formatLabel: (item: unknown) => {
        const profile = item as { foreName: string; lastName: string };
        return `${profile.foreName} ${profile.lastName}`;
      },
    },
    section: { id: "overview", title: "Übersicht" },
  },
  {
    name: "dueDate",
    label: "Fälligkeitsdatum",
    type: "date",
    required: false,
    position: 4,
    width: "half",
    section: { id: "overview", title: "Übersicht" },
  },
];

export const defaultValues = {
  title: "",
  description: "",
  status: "TODO" as const,
  assignedToId: "",
  dueDate: null,
}; 