"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface TransformedEmployeeTraining {
  id: string;
  employeeName: string;
  trainingTitle: string;
  passed: boolean;
  passedDate: Date | null;
}

export const employeeTrainingColumns = (
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedEmployeeTraining>[] => [
  getSelectionColumn<TransformedEmployeeTraining>(),
  {
    id: "employeeName",
    header: "Mitarbeiter",
    accessorKey: "employeeName",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "trainingTitle",
    header: "Training",
    accessorKey: "trainingTitle",
    enableSorting: true,
  },
  {
    id: "passed",
    header: "Bestanden",
    accessorKey: "passed",
    enableSorting: true,
    cell: ({ row }) => (row.getValue("passed") ? "Ja" : "Nein"),
  },
  {
    id: "passedDate",
    header: "Abgeschlossen am",
    accessorKey: "passedDate",
    enableSorting: true,
    cell: ({ row }) =>
      row.getValue("passedDate")
        ? new Date(row.getValue("passedDate")).toLocaleDateString("de-DE")
        : "-",
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        onView={onView}
        viewMode={viewMode}
        pathname="/profiles/employee-training"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 