import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { Salutation } from "./schema";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export function getSalutationColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<Salutation>[] {
  return [
    getSelectionColumn<Salutation>(),
    {
      id: "salutationShort",
      header: "Kurzform",
      accessorKey: "salutationShort",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "salutationLong",
      header: "Langform",
      accessorKey: "salutationLong",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("salutationLong") as string | null;
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
          pathname="/settings"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 