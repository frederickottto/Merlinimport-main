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
];

// Fields specific to templates
const templateFields: FormFieldSchema[] = [
  {
    name: "type",
    label: "Typ",
    type: "select" as FieldType,
    options: [
      { label: "Technisch", value: "technical" },
      { label: "Organisatorisch", value: "organizational" },
      { label: "Rechtlich", value: "legal" },
    ],
    position: 3,
    width: "half",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "conceptIDs",
    label: "Konzepte",
    type: "command" as FieldType,
    position: 4,
    width: "full",
    description: "Wählen Sie die zugehörigen Konzepte aus",
    placeholder: "Konzepte suchen...",
    required: false,
    options: {
      endpoint: "concepts.all",
      labelField: "title",
      valueField: "id",
      multiple: true,
      formatLabel: (item: unknown) => {
        const concept = item as { title: string; description?: string };
        return concept.description 
          ? `${concept.title} - ${concept.description}`
          : concept.title;
      }
    },
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "filePath",
    label: "Dateipfad",
    type: "text" as FieldType,
    position: 5,
    width: "full",
    placeholder: "Pfad zur Datei eingeben",
    description: "Der Pfad zur Template-Datei",
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
    position: 6,
    width: "full",
    placeholder: "Beschreibung eingeben",
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
  {
    name: "keywords",
    label: "Schlagworte",
    type: "tags" as FieldType,
    position: 7,
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
    position: 8,
    width: "full",
    placeholder: "Allgemeine Anmerkungen",
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Navigation schema for template
export const navigationSchema: FormFieldSchema[] = [
  {
    name: "overview",
    label: "Übersicht",
    type: "text" as FieldType,
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "text" as FieldType,
    position: 2,
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Function to get form fields for template
export function getFormFields(): FormFieldSchema[] {
  return [...baseFields, ...templateFields];
}

// Default values for template form
export const defaultValues = {
  title: "",
  type: "",
  filePath: "",
  description: "",
  keywords: [],
  notes: "",
  conceptIDs: [],
}; 