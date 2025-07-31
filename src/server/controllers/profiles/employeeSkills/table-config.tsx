"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

interface TransformedEmployeeSkill {
  id: string;
  niveau: string | null;
  employee: {
    foreName: string;
    lastName: string;
  };
  skillName: string;
}

export function employeeSkillsColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<TransformedEmployeeSkill>[] {
  return [
    getSelectionColumn<TransformedEmployeeSkill>(),
    {
      id: "niveau",
      header: "Niveau",
      accessorKey: "niveau",
      enableSorting: true,
      enableHiding: false,
      cell: ({ row }) => {
        const value = row.getValue("niveau") as string | null;
        return value || "-";
      },
    },
    {
      id: "employee",
      header: "Mitarbeiter",
      accessorKey: "employee",
      enableSorting: true,
      cell: ({ row }) => {
        const employee = row.original.employee;
        return employee ? `${employee.foreName} ${employee.lastName}` : "-";
      },
    },
    {
      id: "skillName",
      header: "Fähigkeit",
      accessorKey: "skillName",
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue("skillName") as string;
        return value || "-";
      },
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/profiles/employee-skills"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 