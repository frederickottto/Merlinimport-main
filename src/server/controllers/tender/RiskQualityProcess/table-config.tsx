"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

export interface TransformedRiskQualityProcess {
  id: string;
  type: string;
  status: string;
  note: string | null;
  createdAt: Date | null;
  callToTenderID: string;
  organisation: {
    id: string;
    name: string;
    abbreviation: string | null;
    legalType: string | null;
  } | null;
}

export function getRiskQualityProcessColumns(
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedRiskQualityProcess>[] {
  const columns: ColumnDef<TransformedRiskQualityProcess>[] = [
    getSelectionColumn<TransformedRiskQualityProcess>(),
    {
      id: "type",
      header: "Typ",
      accessorKey: "type",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "organisation",
      header: "Organisation",
      accessorKey: "organisation.name",
      cell: ({ row }) => row.original.organisation?.name || '-',
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "note",
      header: "Notiz",
      accessorKey: "note",
      cell: ({ row }) => row.original.note || '-',
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: "createdAt",
      header: "Erstellt am",
      accessorKey: "createdAt",
      cell: ({ row }) => row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '-',
      enableSorting: true,
      enableHiding: true,
    },
  ];

  // Add action column at the end
  columns.push({
    id: "actions",
    header: "Aktionen",
    size: 20,
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        onView={onView} 
        viewMode={viewMode}
        pathname={viewMode === 'modal' ? "/tenders/risk-quality-process" : "/tenders"}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  });

  return columns;
} 