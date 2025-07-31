"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

interface TransformedEmployeeExternalProject {
  id: string;
  employee: {
    foreName: string;
    lastName: string;
  };
  professionalBackground: {
    position: string;
  } | null;
  projectTitle: string;
  projectStart: Date | null;
  projectEnd: Date | null;
  operationalDays: number | null;
  clientName: string | null;
}

export function employeeExternalProjectsColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<TransformedEmployeeExternalProject>[] {
  return [
    getSelectionColumn<TransformedEmployeeExternalProject>(),
    {
      id: "employee",
      header: "Mitarbeiter",
      accessorFn: (row) => `${row.employee.foreName} ${row.employee.lastName}`,
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "position",
      header: "Position",
      accessorFn: (row) => row.professionalBackground?.position || "-",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "projectTitle",
      header: "Projekttitel",
      accessorKey: "projectTitle",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "projectStart",
      header: "Startdatum",
      accessorKey: "projectStart",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("projectStart") as Date | null;
        return value ? format(value, "dd.MM.yyyy", { locale: de }) : "-";
      },
    },
    {
      id: "projectEnd",
      header: "Enddatum",
      accessorKey: "projectEnd",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("projectEnd") as Date | null;
        return value ? format(value, "dd.MM.yyyy", { locale: de }) : "-";
      },
    },
    {
      id: "operationalDays",
      header: "Operative Tage",
      accessorKey: "operationalDays",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("operationalDays") as number | null;
        return value?.toString() || "-";
      },
    },
    {
      id: "clientName",
      header: "Kunde",
      accessorKey: "clientName",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("clientName") as string | null;
        return value || "-";
      },
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/profiles/external-projects"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 