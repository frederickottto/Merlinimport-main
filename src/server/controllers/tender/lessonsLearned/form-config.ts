import { FormFieldSchema } from "@/types/form";
import { z } from "zod";

export const formSchema = z.object({
  submissionDate: z.date().optional(),
  decisionDate: z.date().optional(),
  rejectionReasons: z.string().optional(),
  lessonsLearned: z.string().min(1, "Lessons learned is required"),
  wonByOrganisationId: z.string().optional().transform(val => val === "" ? undefined : val),
  wonByOrganisationName: z.string().optional(),
  relatedProfiles: z.array(z.string()).optional(),
  relatedTasks: z.array(z.string()).optional(),
});

export const getFormFields = (organisations?: { id: string; name: string }[]): FormFieldSchema[] => [
  {
    name: "submissionDate",
    label: "Einreichungsdatum",
    type: "date",
    required: false,
    position: 0,
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "decisionDate",
    label: "Entscheidungsdatum",
    type: "date",
    required: false,
    position: 1,
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "rejectionReasons",
    label: "Ablehnungsgründe",
    type: "textarea",
    required: false,
    position: 2,
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "lessonsLearned",
    label: "Lessons Learned",
    type: "textarea",
    required: true,
    position: 3,
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "wonByOrganisationId",
    label: "Gewonnen durch",
    type: "command",
    required: false,
    position: 4,
    options: {
      multiple: false,
      items: organisations?.map(org => ({ value: org.id, label: org.name })) || []
    },
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "wonByOrganisationName",
    label: "Gewonnen durch (Name)",
    type: "text",
    required: false,
    position: 5,
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "relatedProfiles",
    label: "Verwandte Profile",
    type: "command",
    required: false,
    position: 6,
    options: {
      multiple: true
    },
    section: { id: "main", title: "Hauptinformationen" },
  },
  {
    name: "relatedTasks",
    label: "Verwandte Aufgaben",
    type: "command",
    required: false,
    position: 7,
    options: {
      multiple: true
    },
    section: { id: "main", title: "Hauptinformationen" },
  },
];

export const defaultValues = {
  submissionDate: undefined,
  decisionDate: undefined,
  rejectionReasons: "",
  lessonsLearned: "",
  wonByOrganisationId: "",
  wonByOrganisationName: "",
  relatedProfiles: [],
  relatedTasks: [],
}; 