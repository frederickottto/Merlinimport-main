import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const academicDegreeFields: FormFieldSchema[] = [
  {
    name: "degreeTitleShort",
    label: "Abschluss (Kurz)",
    type: "text" as FieldType,
    position: 1,
    width: "half",
    placeholder: "Z.B. B.Sc.",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "degreeTitleLong",
    label: "Abschluss (Lang)",
    type: "text" as FieldType,
    position: 2,
    width: "half",
    placeholder: "Z.B. Bachelor of Science",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "completed",
    label: "Abgeschlossen",
    type: "checkbox" as FieldType,
    position: 3,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "study",
    label: "Studiengang",
    type: "text" as FieldType,
    position: 4,
    width: "half",
    placeholder: "Z.B. Informatik",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "studyStart",
    label: "Studienbeginn",
    type: "date" as FieldType,
    position: 5,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "studyEnd",
    label: "Studienende",
    type: "date" as FieldType,
    position: 6,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "university",
    label: "Universität",
    type: "text" as FieldType,
    position: 7,
    width: "half",
    placeholder: "Name der Universität",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "studyMINT",
    label: "MINT-Studiengang",
    type: "checkbox" as FieldType,
    position: 8,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeeIDs: "",
  degreeTitleShort: "",
  degreeTitleLong: "",
  completed: true,
  study: "",
  studyStart: undefined,
  studyEnd: undefined,
  university: "",
  studyMINT: false,
};

export function getFormFields(): FormFieldSchema[] {
  return academicDegreeFields;
}

// Create schema for academic degree form
export const createSchema = z.object({
  employeeIDs: z.string(),
  degreeTitleShort: z.string().optional(),
  degreeTitleLong: z.string().optional(),
  completed: z.boolean().optional().default(true),
  study: z.string().optional(),
  studyStart: z.date().optional(),
  studyEnd: z.date().optional(),
  university: z.string().optional(),
  studyMINT: z.boolean().optional(),
}); 