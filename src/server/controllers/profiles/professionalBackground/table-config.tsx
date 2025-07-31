"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { formatNumber } from "@/lib/utils";

export interface TransformedProfessionalBackground {
  id: string;
  position: string | null;
  executivePosition: boolean;
  employer: string | null;
  description: string | null;
  professionStart: Date | null;
  professionEnd: Date | null;
  experienceIt: number;
  experienceIs: number;
  experienceItGs: number;
  experienceGps: number;
  experienceOther: number;
  experienceAll: number;
  employeeName: string;
  industrySectorName: string | null;
}

export const professionalBackgroundColumns = (
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedProfessionalBackground>[] => [
  getSelectionColumn<TransformedProfessionalBackground>(),
  {
    id: "position",
    header: "Position",
    accessorKey: "position",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const value = row.getValue("position") as string | null;
      return value || "-";
    },
  },
  {
    id: "executivePosition",
    header: "Führungsposition",
    accessorKey: "executivePosition",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("executivePosition") as boolean;
      return value ? "Ja" : "Nein";
    },
  },
  {
    id: "employer",
    header: "Arbeitgeber",
    accessorKey: "employer",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("employer") as string | null;
      return value || "-";
    },
  },
  {
    id: "professionStart",
    header: "Beginn",
    accessorKey: "professionStart",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("professionStart") as Date | null;
      return value ? new Date(value).toLocaleDateString("de-DE") : "-";
    },
  },
  {
    id: "professionEnd",
    header: "Ende",
    accessorKey: "professionEnd",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("professionEnd") as Date | null;
      return value ? new Date(value).toLocaleDateString("de-DE") : "-";
    },
  },
  {
    id: "experienceIt",
    header: "IT-Erfahrung",
    accessorKey: "experienceIt",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceIt") as number;
      return value.toLocaleString("de-DE");
    },
  },
  {
    id: "experienceIs",
    header: "IS-Erfahrung",
    accessorKey: "experienceIs",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceIs") as number;
      return formatNumber(value);
    },
  },
  {
    id: "experienceItGs",
    header: "IT-GS-Erfahrung",
    accessorKey: "experienceItGs",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceItGs") as number;
      return formatNumber(value);
    },
  },
  {
    id: "experienceGps",
    header: "GPS-Erfahrung",
    accessorKey: "experienceGps",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceGps") as number;
      return formatNumber(value);
    },
  },
  {
    id: "experienceOther",
    header: "Sonstige Erfahrung",
    accessorKey: "experienceOther",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceOther") as number;
      return formatNumber(value);
    },
  },
  {
    id: "experienceAll",
    header: "Gesamterfahrung",
    accessorKey: "experienceAll",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceAll") as number;
      return formatNumber(value);
    },
  },
  {
    id: "employeeName",
    header: "Mitarbeiter",
    accessorKey: "employeeName",
    enableSorting: true,
  },
  {
    id: "industrySectorName",
    header: "Branche",
    accessorKey: "industrySectorName",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("industrySectorName") as string | null;
      return value || "-";
    },
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        onView={onView}
        viewMode={viewMode}
        pathname="/profiles/professional-background"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 