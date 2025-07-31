import { z } from "zod";
import { FormConfig } from "@/types/form";
import type { SecurityClearance } from "@prisma/client";

export type SecurityClearanceWithEmployee = SecurityClearance & {
  employee: {
    id: string;
    foreName: string;
    lastName: string;
  } | null;
};

export const securityClearanceFormConfig: FormConfig = {
  title: "Sicherheitsüberprüfung",
  description: "Erstellen oder bearbeiten Sie eine Sicherheitsüberprüfung",
  sections: [
    {
      title: "Übersicht",
      fields: [
        {
          name: "employeeIDs",
          label: "Mitarbeiter",
          type: "command",
          required: true,
          options: {
            endpoint: "profiles.all",
            labelField: "foreName",
            valueField: "id",
            formatLabel: (item: unknown) => {
              const employee = item as { foreName: string; lastName: string };
              return `${employee.foreName} ${employee.lastName}`;
            },
          },
          defaultValue: (data: SecurityClearanceWithEmployee) => data?.employee?.id || "",
          position: 1,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "securityClearanceType",
          label: "Art der Sicherheitsüberprüfung",
          type: "select",
          required: true,
          options: {
            items: [
              { label: "Ü1", value: "Ü1" },
              { label: "Ü2", value: "Ü2" },
              { label: "Ü3", value: "Ü3" },
            ],
          },
          defaultValue: (data: SecurityClearanceWithEmployee) => data?.securityClearanceType || "",
          position: 2,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "securityClearanceLevel",
          label: "Stufe der Sicherheitsüberprüfung",
          type: "select",
          required: true,
          options: {
            items: [
              { label: "Einfach", value: "EINFACH" },
              { label: "Erweitert", value: "ERWEITERT" },
              { label: "Höchst", value: "HÖCHST" },
            ],
          },
          defaultValue: (data: SecurityClearanceWithEmployee) => data?.securityClearanceLevel || "",
          position: 3,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "applicationDate",
          label: "Antragsdatum",
          type: "date",
          required: true,
          defaultValue: (data: SecurityClearanceWithEmployee) => data?.applicationDate ? new Date(data.applicationDate) : undefined,
          position: 4,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
        {
          name: "approved",
          label: "Genehmigt",
          type: "checkbox",
          defaultValue: (data: SecurityClearanceWithEmployee) => data?.approved || false,
          position: 5,
          section: {
            id: "overview",
            title: "Übersicht",
          },
        },
      ],
    },
  ],
};

export const securityClearanceFormSchema = z.object({
  employeeIDs: z.string(),
  securityClearanceType: z.string(),
  securityClearanceLevel: z.string(),
  applicationDate: z.date(),
  approved: z.boolean().optional(),
}); 