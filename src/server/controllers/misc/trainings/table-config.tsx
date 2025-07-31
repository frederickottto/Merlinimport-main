"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface TransformedTraining {
  id: string;
  trainingTitle?: string | null;
  trainingType?: string | null;
  trainingTemplateID?: string | null;
  trainingContent?: string | null;
  trainingTemplate?: {
    id: string;
    title: string;
  } | null;
}

export const trainingColumns: ColumnDef<TransformedTraining>[] = [
  getSelectionColumn<TransformedTraining>(),
  {
    id: "trainingTitle",
    header: "Titel",
    accessorKey: "trainingTitle",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => row.getValue("trainingTitle") || "-",
  },
  {
    id: "trainingType",
    header: "Typ",
    accessorKey: "trainingType",
    enableSorting: true,
    cell: ({ row }) => row.getValue("trainingType") || "-",
  },
  {
    id: "trainingTemplateID",
    header: "Vorlagen-ID",
    accessorKey: "trainingTemplateID",
    enableSorting: false,
    cell: ({ row }) => {
      const template = row.original.trainingTemplate;
      return template?.title || "-";
    },
  },
  {
    id: "trainingContent",
    header: "Inhalt",
    accessorKey: "trainingContent",
    enableSorting: false,
    cell: ({ row }) => {
      const value = row.getValue("trainingContent");
      if (!value) return "-";
      return typeof value === "string" && value.length > 50 ? value.slice(0, 50) + "..." : value;
    },
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="modal"
        pathname="/trainings"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 