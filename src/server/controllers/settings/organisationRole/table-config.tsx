import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { OrganisationRole } from "./schema";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export function getOrganisationRoleColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<OrganisationRole>[] {
  return [
    getSelectionColumn<OrganisationRole>(),
    {
      id: "role",
      header: "Beziehungsrolle",
      accessorKey: "role",
      enableSorting: true,
      enableHiding: false,
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