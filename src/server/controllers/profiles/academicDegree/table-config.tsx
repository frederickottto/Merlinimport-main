"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface TransformedAcademicDegree {
  id: string;
  employeeName: string;
  degreeTitleShort: string | null;
  degreeTitleLong: string | null;
  study: string | null;
  completed: boolean;
  studyStart: Date | null;
  studyEnd: Date | null;
  university: string | null;
  studyMINT: boolean;
}

export function academicDegreeColumns(
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedAcademicDegree>[] {
  return [
  getSelectionColumn<TransformedAcademicDegree>(),
  {
    id: "employeeName",
    header: "Mitarbeiter",
    accessorKey: "employeeName",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "degreeTitleShort",
    header: "Abschluss (Kurz)",
    accessorKey: "degreeTitleShort",
    enableSorting: true,
  },
  {
    id: "study",
    header: "Studiengang",
    accessorKey: "study",
    enableSorting: true,
  },
  {
    id: "university",
    header: "Universität",
    accessorKey: "university",
    enableSorting: true,
  },
  {
    id: "completed",
    header: "Abgeschlossen",
    accessorKey: "completed",
    enableSorting: true,
    cell: ({ row }) => (row.getValue("completed") ? "Ja" : "Nein"),
  },
  {
    id: "studyPeriod",
    header: "Studienzeitraum",
    accessorFn: (row) => {
      const start = row.studyStart ? new Date(row.studyStart).toLocaleDateString("de-DE") : "-";
      const end = row.studyEnd ? new Date(row.studyEnd).toLocaleDateString("de-DE") : "-";
      return `${start} - ${end}`;
    },
    enableSorting: false,
  },
  {
    id: "studyMINT",
    header: "MINT",
    accessorKey: "studyMINT",
    enableSorting: true,
    cell: ({ row }) => (row.getValue("studyMINT") ? "Ja" : "Nein"),
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
          viewMode={viewMode}
          onView={onView}
          pathname={viewMode === 'modal' ? "/profiles/academic-degrees" : "/profiles"}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 
} 