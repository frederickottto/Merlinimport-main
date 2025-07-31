import { FormFieldSchema, FieldType } from "@/types/form";


// Base fields for trainings
const baseFields: FormFieldSchema[] = [
  {
    name: "trainingTitle",
    label: "Titel",
    type: "text" as FieldType,
    position: 1,
    width: "full",
    placeholder: "Titel des Trainings eingeben",
    description: "Der Haupttitel des Trainings",
    required: true,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "trainingType",
    label: "Typ",
    type: "text" as FieldType,
    position: 2,
    width: "full",
    placeholder: "Typ des Trainings eingeben",
    description: "Art oder Kategorie des Trainings (optional)",
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "trainingTemplateID",
    label: "Vorlage",
    type: "command" as FieldType,
    position: 3,
    width: "full",
    description: "Verknüpfte Vorlage für das Training (optional)",
    placeholder: "Vorlage suchen...",
    command: {
      type: "template",
      label: "Vorlage",
      placeholder: "Vorlage suchen...",
      createLabel: "Neue Vorlage",
      createPath: "/templates/new",
      multiple: false
    },
    options: {
      endpoint: "templates.all",
      labelField: "title",
      valueField: "id",
      multiple: false
    },
    required: false,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

// Fields specific to trainings
const trainingFields: FormFieldSchema[] = [
  {
    name: "trainingContent",
    label: "Inhalt",
    type: "textarea" as FieldType,
    position: 4,
    width: "full",
    placeholder: "Inhalt des Trainings eingeben",
    section: {
      id: "description",
      title: "Beschreibung",
    },
  },
];

// Navigation schema for training
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

// Function to get form fields for training
export function getFormFields(): FormFieldSchema[] {
  return [...baseFields, ...trainingFields];
}

// Default values for training form
export const defaultValues = {
  trainingTitle: "",
  trainingContent: "",
  trainingType: "",
  trainingTemplateID: "",
}; 