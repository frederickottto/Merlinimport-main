"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

interface TransformedOrganisationContact {
  id: string;
  foreName: string;
  lastName: string;
  email?: string | null;
  mobile?: string | null;
  telephone?: string | null;
  position?: string | null;
  department?: string | null;
}

export const organisationContactColumns: ColumnDef<TransformedOrganisationContact>[] = [
  getSelectionColumn<TransformedOrganisationContact>(),
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.foreName} ${row.lastName}`,
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "position",
    header: "Position",
    accessorKey: "position",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("position") as string | null;
      return value || "-";
    },
  },
  {
    id: "department",
    header: "Abteilung",
    accessorKey: "department",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("department") as string | null;
      return value || "-";
    },
  },
  {
    id: "email",
    header: "E-Mail",
    accessorKey: "email",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("email") as string | null;
      return value ? (
        <a 
          href={`mailto:${value}`}
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : "-";
    },
  },
  {
    id: "telephone",
    header: "Telefon",
    accessorKey: "telephone",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("telephone") as string | null;
      return value || "-";
    },
  },
  {
    id: "mobile",
    header: "Mobil",
    accessorKey: "mobile",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("mobile") as string | null;
      return value || "-";
    },
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="modal"
        pathname="/organisations/contacts"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 