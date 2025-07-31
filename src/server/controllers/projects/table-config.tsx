"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface TransformedProject {
  id: string;
  title?: string | null;
  type?: string | null;
  referenceApproval?: boolean | null;
  teamSize?: number | null;
  contractBeginn?: string | Date | null;
  contractEnd?: string | Date | null;
}

export const projectColumns: ColumnDef<TransformedProject>[] = [
  getSelectionColumn<TransformedProject>(),
  {
    id: "title",
    header: "Titel",
    accessorKey: "title",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => row.getValue("title") || "-",
  },
  {
    id: "type",
    header: "Typ",
    accessorKey: "type",
    enableSorting: true,
    cell: ({ row }) => row.getValue("type") || "-",
  },
  {
    id: "referenceApproval",
    header: "Referenzgenehmigung",
    accessorKey: "referenceApproval",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("referenceApproval");
      return value ? "Ja" : "Nein";
    },
  },
  {
    id: "teamSize",
    header: "Teamgröße",
    accessorKey: "teamSize",
    enableSorting: true,
    cell: ({ row }) => row.getValue("teamSize") ?? "-",
  },
  {
    id: "contractBeginn",
    header: "Vertragsbeginn",
    accessorKey: "contractBeginn",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("contractBeginn");
      if (!value) return "-";
      const date = typeof value === "string" ? new Date(value) : value;
      // Use deterministic format: YYYY-MM-DD
      return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "-";
    },
  },
  {
    id: "contractEnd",
    header: "Vertragsende",
    accessorKey: "contractEnd",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("contractEnd");
      if (!value) return "-";
      const date = typeof value === "string" ? new Date(value) : value;
      // Use deterministic format: YYYY-MM-DD
      return date instanceof Date && !isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "-";
    },
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="modal"
        pathname="/projects"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 