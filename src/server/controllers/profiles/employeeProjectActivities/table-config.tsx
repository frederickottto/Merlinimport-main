"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export type EmployeeProjectActivityRow = {
  id: string;
  employee: {
    id: string;
    foreName: string;
    lastName: string;
  } | null;
  project: {
    id: string;
    title: string;
  } | null;
  employeeRole: {
    id: string;
    employeeRoleShort: string;
  } | null;
  description: string;
  operationalPeriodStart: Date;
  operationalPeriodEnd: Date;
  operationalDays: number;
};

export const employeeProjectActivitiesColumns = (
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'modal'
): ColumnDef<EmployeeProjectActivityRow>[] => {
  return [
    getSelectionColumn<EmployeeProjectActivityRow>(),
    {
      id: "employee",
      header: "Mitarbeiter",
      accessorKey: "employee",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => {
        const employee = row.original.employee;
        return employee ? `${employee.foreName} ${employee.lastName}` : "-";
      },
    },
    {
      id: "project",
      header: "Projekt",
      accessorKey: "project",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => row.original.project?.title || "-",
    },
    {
      id: "employeeRole",
      header: "Rolle",
      accessorKey: "employeeRole",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => row.original.employeeRole?.employeeRoleShort || "-",
    },
    {
      id: "operationalPeriodStart",
      header: "Startdatum",
      accessorKey: "operationalPeriodStart",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => format(row.original.operationalPeriodStart, "dd.MM.yyyy", { locale: de }),
    },
    {
      id: "operationalPeriodEnd",
      header: "Enddatum",
      accessorKey: "operationalPeriodEnd",
      enableSorting: true,
      enableHiding: true,
      cell: ({ row }) => format(row.original.operationalPeriodEnd, "dd.MM.yyyy", { locale: de }),
    },
    {
      id: "operationalDays",
      header: "Operative Tage",
      accessorKey: "operationalDays",
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/profiles/projects"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
};
