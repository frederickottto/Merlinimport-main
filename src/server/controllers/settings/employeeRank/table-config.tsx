import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import type { EmployeeRank } from "./schema";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";
import { formatNumber } from "@/lib/utils";

export function getEmployeeRankColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<EmployeeRank>[] {
  return [
    getSelectionColumn<EmployeeRank>(),
    {
      id: "employeePositionShort",
      header: "Kurzbezeichnung",
      accessorKey: "employeePositionShort",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "employeePositionLong",
      header: "Langbezeichnung",
      accessorKey: "employeePositionLong",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "employeeCostStraight",
      header: "Kostensatz in Euro",
      accessorKey: "employeeCostStraight",
      cell: ({ row }) => {
        const cost = row.original.employeeCostStraight;
        return cost ? `${formatNumber(cost)} €` : '-';
      },
      enableSorting: true,
      enableHiding: true,
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