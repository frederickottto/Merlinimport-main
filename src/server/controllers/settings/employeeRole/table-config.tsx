import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { EmployeeRole } from "./schema";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

export function getEmployeeRoleColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<EmployeeRole>[] {
  return [
    getSelectionColumn<EmployeeRole>(),
    {
      id: "role",
      header: "Name",
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