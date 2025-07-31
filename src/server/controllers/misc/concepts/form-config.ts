import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

// Base fields that are common to all types
const baseFields: FormFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    placeholder: "Titel eingeben",
    description: "Der Haupttitel",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea" as FieldType,
    position: 2,
    width: "full",
    placeholder: "Beschreibung eingeben",
    description: "Die Hauptbeschreibung",
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Fields specific to tenders and concepts
const descriptionFields: FormFieldSchema[] = [];

// Fields specific to concepts
const conceptFields: FormFieldSchema[] = [
  {
    name: "templateIDs",
    label: "Templates",
    type: "command" as FieldType,
    position: 1,
    width: "full",
    description: "Wählen Sie Templates aus",
    placeholder: "Templates suchen...",
    options: {
      items: [],
      multiple: true
    },
    section: {
      id: "template",
      title: "Template",
    },
  },
  {
    name: "status",
    label: "Status",
    type: "select" as FieldType,
    options: [
      { label: "Entwurf", value: "draft" },
      { label: "In Bearbeitung", value: "in_progress" },
      { label: "Abgeschlossen", value: "completed" },
    ],
    position: 3,
    width: "half",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "textMaturity",
    label: "Textreife",
    type: "checkbox" as FieldType,
    position: 4,
    width: "half",
    description: "Der Text ist ausgereift",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "wordCount",
    label: "Wortanzahl",
    type: "number" as FieldType,
    position: 5,
    width: "half",
    validation: z.number().min(0).optional(),
    placeholder: "0",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "language",
    label: "Sprachen",
    type: "tags" as FieldType,
    position: 6,
    width: "full",
    description: "Verfügbare Sprachen",
    validation: z.array(z.string()).optional(),
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "genderNeutral",
    label: "Gender-neutral",
    type: "checkbox" as FieldType,
    position: 7,
    width: "half",
    description: "Der Text ist gender-neutral formuliert",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "professionalTone",
    label: "Professioneller Ton",
    type: "checkbox" as FieldType,
    position: 8,
    width: "half",
    description: "Der Text ist in professionellem Ton verfasst",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "containsGraphics",
    label: "Enthält Grafiken",
    type: "checkbox" as FieldType,
    position: 9,
    width: "half",
    description: "Der Text enthält Grafiken",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "keywords",
    label: "Schlagworte",
    type: "tags" as FieldType,
    position: 10,
    width: "full",
    description: "Relevante Schlagworte",
    validation: z.array(z.string()).optional(),
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
  {
    name: "notes",
    label: "Anmerkungen",
    type: "textarea" as FieldType,
    position: 11,
    width: "full",
    placeholder: "Allgemeine Anmerkungen",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Navigation schema for concept
export const navigationSchema: FormFieldSchema[] = [
  {
    name: "template",
    label: "Template",
    type: "text" as FieldType,
    position: 1,
    section: {
      id: "template",
      title: "Template",
    },
  },
  {
    name: "overview",
    label: "Übersicht",
    type: "text" as FieldType,
    position: 2,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "text" as FieldType,
    position: 3,
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Function to get form fields for concept
export function getFormFields(): FormFieldSchema[] {
  return [...baseFields, ...descriptionFields, ...conceptFields];
}

// Default values for concept form
export const defaultValues = {
  title: "",
  description: "",
  status: "draft",
  textMaturity: false,
  wordCount: 0,
  language: ["de"],
  genderNeutral: false,
  professionalTone: true,
  containsGraphics: false,
  templateIDs: [],
  keywords: [],
  notes: "",
}; 