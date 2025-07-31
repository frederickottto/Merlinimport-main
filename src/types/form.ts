import { z } from "zod";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "textarea"
  | "checkbox"
  | "radio"
  | "tags"
  | "currency"
  | "command"
  | "static";

export interface CommandFieldConfig {
  type: "location" | "industry-sector" | "organisation" | "template" | "project";
  label: string;
  placeholder: string;
  createLabel: string;
  createPath: string;
  multiple?: boolean;
}

export interface FormFieldSchema {
  name: string;
  label: string;
  type: FieldType;
  description?: string;
  placeholder?: string;
  validation?: z.ZodType<unknown>;
  options?: { label: string; value: string | number }[] | {
    endpoint?: string;
    labelField?: string;
    valueField?: string;
    items?: { label: string; value: string | number }[];
    formatLabel?: (item: unknown) => string;
    multiple?: boolean;
    filter?: Record<string, unknown>;
    allowCustomValues?: boolean;
  };
  command?: CommandFieldConfig;
  position: number;
  defaultValue?: unknown;
  value?: unknown;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  width?: "full" | "half" | "third";
  section: {
    id: string;
    title: string;
    icon?: string;
  };
}

export interface FormSection {
  id: string;
  title: string;
  position: number;
}

export interface FormSchema {
  fields: FormFieldSchema[];
  sections?: FormSection[];
  onSubmit?: (data: unknown) => Promise<void> | void;
}

export interface FormConfig {
  title: string;
  description: string;
  sections: {
    title: string;
    fields: FormFieldSchema[];
  }[];
}

export const createFormValidationSchema = (fields: FormFieldSchema[]) => {
  const schemaObject: { [key: string]: z.ZodType<unknown> } = {};

  fields.forEach((field) => {
    let fieldSchema: z.ZodType<unknown>;

    switch (field.type) {
      case "number":
      case "currency":
        fieldSchema = z.number();
        break;
      case "date":
        fieldSchema = z.coerce.date();
        break;
      case "checkbox":
        fieldSchema = z.boolean();
        break;
      case "tags":
        fieldSchema = z.array(z.string());
        break;
      case "command":
        fieldSchema = (!Array.isArray(field.options) && field.options?.multiple)
          ? z.array(z.string())
          : z.string();
        break;
      default:
        fieldSchema = z.string();
    }

    if (field.required) {
      if (field.type === "tags" || (field.type === "command" && !Array.isArray(field.options) && field.options?.multiple)) {
        fieldSchema = (fieldSchema as z.ZodArray<z.ZodString>).min(1, `${field.label} is required`);
      } else if (field.type === "text" || field.type === "textarea") {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `${field.label} is required`);
      } else if (field.type === "select" || field.type === "command") {
        fieldSchema = (fieldSchema as z.ZodString).min(1, `Please select a ${field.label.toLowerCase()}`);
      } else if (field.type === "date") {
        fieldSchema = fieldSchema.refine((val) => val instanceof Date && !isNaN(val.getTime()), {
          message: `Please select a valid date for ${field.label.toLowerCase()}`,
        });
      } else {
        fieldSchema = fieldSchema.refine((val) => val !== undefined && val !== null, {
          message: `${field.label} is required`,
        });
      }
    } else {
      fieldSchema = fieldSchema.optional();
      if (field.defaultValue === null) {
        fieldSchema = fieldSchema.nullable();
      }
    }

    if (field.validation) {
      fieldSchema = field.validation;
    }

    schemaObject[field.name] = fieldSchema;
  });

  return z.object(schemaObject);
}; 