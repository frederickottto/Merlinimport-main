import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";
import { api } from "@/trpc/react";

interface EmployeeRole {
  id: string;
  role: string | null;
}

export const createCallToTenderEmployeeSchema = z.object({
  employeeId: z.string().min(1, "Mitarbeiter ist erforderlich"),
  callToTenderId: z.string().min(1, "Ausschreibungs-ID ist erforderlich"),
  employeeCallToTenderRole: z.string().min(1, "Rolle ist erforderlich"),
  role: z.string().optional(),
  description: z.string().optional(),
  profileTitle: z.string().optional(),
  costCenter: z.number().optional(),
  profilePrice: z.number().optional(),
  travelCost: z.number().optional(),
});

export type CreateCallToTenderEmployee = z.infer<typeof createCallToTenderEmployeeSchema>;

// Custom hook to fetch form data
export const useFormData = () => {
  const { data: employeeRoles } = api.employeeRole.getAll.useQuery();
  const { data: employees } = api.profiles.all.useQuery();

  return {
    employeeRoles: employeeRoles as EmployeeRole[] | undefined,
    employees
  };
};

// Function to get form fields without hooks
export const getFormFields = (callToTenderId: string, employeeRoles?: EmployeeRole[]): FormFieldSchema[] => {
  return [
    {
      name: "employeeId",
      label: "Mitarbeiter",
      type: "command" as FieldType,
      required: true,
      position: 1,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      },
      options: {
        endpoint: "profiles.all",
        valueField: "id",
        formatLabel: (item: unknown) => {
          if (typeof item === "object" && item !== null && "foreName" in item && "lastName" in item) {
            return `${item.foreName} ${item.lastName}`.trim();
          }
          return String(item);
        }
      }
    },
    {
      name: "employeeCallToTenderRole",
      label: "Rolle",
      type: "select" as FieldType,
      required: true,
      position: 2,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      },
      options: employeeRoles?.map((role: EmployeeRole) => ({
        value: role.id,
        label: role.role ?? "Unbekannte Rolle"
      })) ?? []
    },
    {
      name: "role",
      label: "Position",
      type: "text" as FieldType,
      required: false,
      position: 3,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    },
    {
      name: "profileTitle",
      label: "Profilbezeichnung",
      type: "text" as FieldType,
      required: false,
      position: 4,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea" as FieldType,
      required: false,
      position: 5,
      width: "full",
      section: {
        id: "main",
        title: "Hauptinformationen"
      }
    },
    {
      name: "costCenter",
      label: "Kostenstelle",
      type: "number" as FieldType,
      required: false,
      position: 6,
      width: "full",
      section: {
        id: "costs",
        title: "Kosten"
      }
    },
    {
      name: "profilePrice",
      label: "Profilpreis",
      type: "number" as FieldType,
      required: false,
      position: 7,
      width: "full",
      section: {
        id: "costs",
        title: "Kosten"
      }
    },
    {
      name: "travelCost",
      label: "Reisekosten",
      type: "number" as FieldType,
      required: false,
      position: 8,
      width: "full",
      section: {
        id: "costs",
        title: "Kosten"
      }
    }
  ];
};

export const getDefaultValues = (callToTenderId: string): CreateCallToTenderEmployee => ({
  employeeId: "",
  callToTenderId,
  employeeCallToTenderRole: "",
  role: undefined,
  description: undefined,
  profileTitle: undefined,
  costCenter: undefined,
  profilePrice: undefined,
  travelCost: undefined,
});

// Export default values for use in components that don't need to pass callToTenderId
export const defaultValues: Omit<CreateCallToTenderEmployee, "callToTenderId"> = {
  employeeId: "",
  employeeCallToTenderRole: "",
  role: undefined,
  description: undefined,
  profileTitle: undefined,
  costCenter: undefined,
  profilePrice: undefined,
  travelCost: undefined,
};
