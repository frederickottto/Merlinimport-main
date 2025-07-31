import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

const projectActivityFields: FormFieldSchema[] = [
  {
    name: "employeeIDs",
    label: "Mitarbeiter",
    type: "command" as FieldType,
    placeholder: "Mitarbeiter auswählen",
    options: {
      endpoint: "profiles.all",
      labelField: "foreName",
      valueField: "id",
      multiple: false,
      formatLabel: (item: unknown) => {
        if (typeof item === "object" && item !== null && "foreName" in item && "lastName" in item) {
          return `${item.foreName} ${item.lastName}`.trim();
        }
        return String(item);
      }
    },
    position: 0,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "projectIDs",
    label: "Projekt",
    type: "command" as FieldType,
    placeholder: "Projekt auswählen",
    options: {
      endpoint: "projects.all",
      labelField: "title",
      valueField: "id",
      multiple: false,
    },
    position: 1,
    required: true,
    disabled: false,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "employeeRoleID",
    label: "Rolle",
    type: "command" as FieldType,
    placeholder: "Rolle auswählen",
    options: {
      endpoint: "employeeRole.getAll",
      labelField: "role",
      valueField: "id",
      multiple: false,
    },
    position: 2,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "description",
    label: "Beschreibung",
    type: "textarea" as FieldType,
    position: 3,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "operationalPeriodStart",
    label: "Startdatum",
    type: "date" as FieldType,
    position: 4,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "operationalPeriodEnd",
    label: "Enddatum",
    type: "date" as FieldType,
    position: 5,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
  {
    name: "operationalDays",
    label: "Operative Tage",
    type: "number" as FieldType,
    position: 6,
    required: true,
    section: {
      id: "overview",
      title: "Projektaktivität Details",
    },
  },
];

export const defaultValues = {
  employeeIDs: "",
  projectIDs: "",
  projectTitle: "",
  employeeRoleID: "",
  description: "",
  operationalPeriodStart: undefined,
  operationalPeriodEnd: undefined,
  operationalDays: 0,
};

export const createSchema = z.object({
  employeeIDs: z.string(),
  projectIDs: z.string(),
  projectTitle: z.string().optional(),
  employeeRoleID: z.string(),
  description: z.string(),
  operationalPeriodStart: z.date(),
  operationalPeriodEnd: z.date(),
  operationalDays: z.number().min(0).default(0),
});

export function getFormFields({ projectId = "", includeEmployee = true } = {}): FormFieldSchema[] {
  let fields = [...projectActivityFields];
  
  // Handle employee field visibility
  if (!includeEmployee) {
    fields = fields.filter(f => f.name !== "employeeIDs");
  }
  
  // Make project field disabled and pre-filled when projectId is provided
  if (projectId) {
    fields = fields.map(field => {
      if (field.name === "projectIDs") {
        return {
          ...field,
          type: "static" as FieldType,
          disabled: true,
          value: projectId,
          label: "Projekt",
          placeholder: "Projekt",
          options: {
            endpoint: "projects.all",
            labelField: "title",
            valueField: "id",
            multiple: false,
            filter: { id: projectId },
            formatLabel: (item: unknown) => (item as { title: string }).title || ""
          }
        };
      }
      return field;
    });
  }

  return fields;
} 