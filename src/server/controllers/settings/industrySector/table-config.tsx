import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

type IndustrySectorTableData = {
  id: string;
  industrySector: string;
  industrySectorEY: string | null;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
  conditionsOfParticipationIDs: string[];
  organisationenIDs: string[];
};

export function getIndustrySectorColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<IndustrySectorTableData>[] {
  return [
    getSelectionColumn<IndustrySectorTableData>(),
    {
      id: "industrySector",
      header: "Branchen Bezeichner 1",
      accessorKey: "industrySector",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "industrySectorEY",
      header: "Branchen Bezeichner 2 (EY)",
      accessorKey: "industrySectorEY",
      enableSorting: true,
      cell: ({ row }) => row.getValue("industrySectorEY") || "-",
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