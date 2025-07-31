import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { Skill } from "./schema";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export function getSkillColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<Skill>[] {
  return [
    getSelectionColumn<Skill>(),
    {
      id: "title",
      header: "Bezeichnung",
      accessorKey: "title",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "type",
      header: "Typ",
      accessorKey: "type",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("type") as string | null;
        return value || "-";
      },
    },
    {
      id: "description",
      header: "Beschreibung",
      accessorKey: "description",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("description") as string | null;
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