"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface TransformedVoccational {
  id: string;
  employeeName: string;
  industrySectorName: string | null;
  voccationalTitleShort: string | null;
  voccationalTitleLong: string | null;
  voccationalMINT: boolean;
  company: string | null;
  voccationalStart: Date | null;
  voccationalEnd: Date | null;
}

export const voccationalColumns = (
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedVoccational>[] => [
  getSelectionColumn<TransformedVoccational>(),
  {
    id: "employeeName",
    header: "Mitarbeiter",
    accessorKey: "employeeName",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "industrySectorName",
    header: "Branche",
    accessorKey: "industrySectorName",
    enableSorting: true,
  },
  {
    id: "voccationalTitleShort",
    header: "Berufsbezeichnung (Kurz)",
    accessorKey: "voccationalTitleShort",
    enableSorting: true,
  },
  {
    id: "voccationalTitleLong",
    header: "Berufsbezeichnung (Lang)",
    accessorKey: "voccationalTitleLong",
    enableSorting: true,
  },
  {
    id: "company",
    header: "Unternehmen",
    accessorKey: "company",
    enableSorting: true,
  },
  {
    id: "voccationalMINT",
    header: "MINT?",
    accessorKey: "voccationalMINT",
    enableSorting: true,
    cell: ({ row }) => (row.getValue("voccationalMINT") ? "Ja" : "Nein"),
  },
  {
    id: "voccationalPeriod",
    header: "Berufszeitraum",
    accessorFn: (row) => {
      const start = row.voccationalStart ? new Date(row.voccationalStart).toLocaleDateString("de-DE") : "-";
      const end = row.voccationalEnd ? new Date(row.voccationalEnd).toLocaleDateString("de-DE") : "-";
      return `${start} - ${end}`;
    },
    enableSorting: false,
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        onView={onView}
        viewMode={viewMode}
        pathname="/profiles/voccational"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 