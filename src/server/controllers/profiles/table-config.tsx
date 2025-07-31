"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { Employee, EmployeeRank, Location } from "@prisma/client";

interface EmployeeWithRelations extends Employee {
  employeeRank?: EmployeeRank | null;
  location?: Location | null;
}

export const profileColumns: ColumnDef<EmployeeWithRelations>[] = [
  getSelectionColumn<EmployeeWithRelations>(),
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.foreName} ${row.lastName}`,
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "employeeRank",
    header: "Position",
    accessorFn: (row) => row.employeeRank?.employeePositionShort || "-",
    enableSorting: true,
  },
  {
    id: "location",
    header: "Location",
    accessorFn: (row) => row.location?.country || "-",
    enableSorting: true,
  },
  {
    id: "experienceAll",
    header: "Total Experience",
    accessorKey: "experienceAll",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("experienceAll") as number;
      return `${value} years`;
    },
  },
  {
    id: "telephone",
    header: "Phone",
    accessorKey: "telephone",
    enableSorting: true,
  },
  {
    id: "mobile",
    header: "Mobile",
    accessorKey: "mobile",
    enableSorting: true,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="modal"
        pathname="/profiles"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 