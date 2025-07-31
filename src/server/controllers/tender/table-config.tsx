"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";
import { formatDate, formatNumber } from "@/lib/utils";
import { T_Tender } from "./schema";

export const tenderColumns: ColumnDef<T_Tender>[] = [
  getSelectionColumn<T_Tender>(),
  {
    id: "title",
    header: "Titel",
    accessorKey: "title",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "offerDeadline",
    header: "Angebotsfrist",
    accessorKey: "offerDeadline",
    cell: ({ row }) => formatDate(row.original.offerDeadline),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "questionDeadline",
    header: "Fragefrist",
    accessorKey: "questionDeadline",
    cell: ({ row }) => formatDate(row.original.questionDeadline),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "volumeEuro",
    header: "Volumen (€)",
    accessorKey: "volumeEuro",
    cell: ({ row }) => formatNumber(row.original.volumeEuro),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="navigation"
        pathname="/tenders"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 