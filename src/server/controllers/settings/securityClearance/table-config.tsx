import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { SecurityClearance } from "./schema";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { BooleanBadge } from "@/components/table/boolean-badge";

export function getSecurityClearanceColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<SecurityClearance>[] {
  return [
    getSelectionColumn<SecurityClearance>(),
    {
      id: "securityClearanceType",
      header: "Art der Sicherheitsüberprüfung",
      accessorKey: "securityClearanceType",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("securityClearanceType") as string | null;
        return value || "-";
      },
    },
    {
      id: "securityClearanceLevel",
      header: "Stufe",
      accessorKey: "securityClearanceLevel",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("securityClearanceLevel") as string | null;
        return value || "-";
      },
    },
    {
      id: "approved",
      header: "Genehmigt",
      accessorKey: "approved",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("approved") as boolean;
        return <BooleanBadge value={value} />;
      },
    },
    {
      id: "applicationDate",
      header: "Antragsdatum",
      accessorKey: "applicationDate",
      enableSorting: true,
      cell: ({ row }) => {
        const date = row.getValue("applicationDate") as Date | null;
        if (!date) return "-";
        return new Date(date).toLocaleDateString("de-DE");
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
          pathname="/settings"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 