import type { FormFieldSchema } from "@/types/form";

// Section configuration
const overviewSection = {
  id: "overview",
  title: "Übersicht",
};

// Reusable field definitions
const titleField: FormFieldSchema = {
  name: "title",
  label: "Titel",
  type: "text",
  required: true,
  position: 1,
  width: "full",
  section: overviewSection,
};

const descriptionField: FormFieldSchema = {
  name: "description",
  label: "Beschreibung",
  type: "textarea",
  required: true,
  position: 2,
  width: "full",
  section: overviewSection,
};

// Add section to fields
const fieldsWithSection = [titleField, descriptionField].map(field => ({
  ...field,
  section: overviewSection,
}));

export const pitchFormConfig = {
  sections: [
    {
      title: overviewSection.title,
      fields: fieldsWithSection,
    },
  ],
};

// Export individual fields for reuse
export const pitchFields = {
  title: titleField,
  description: descriptionField,
};