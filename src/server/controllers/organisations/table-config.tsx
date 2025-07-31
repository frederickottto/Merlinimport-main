"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { formatNumber, formatCurrency } from "@/lib/utils";

interface TransformedOrganisation {
  id: string;
  name: string;
  abbreviation?: string | null;
  website?: string | null;
  employeeNumber?: number | null;
  anualReturn?: number | null;
  legalType?: string | null;
  locationCountry: string;
  parentCompanyName: string;
  industrySectors: string;
}

export const organisationColumns: ColumnDef<TransformedOrganisation>[] = [
  getSelectionColumn<TransformedOrganisation>(),
  {
    id: "name",
    header: "Organization Name",
    accessorKey: "name",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "abbreviation",
    header: "Abkürzung",
    accessorKey: "abbreviation",
    enableSorting: true,
  },
  {
    id: "legalType",
    header: "Rechtsform",
    accessorKey: "legalType",
    enableSorting: true,
  },
  {
    id: "locationCountry",
    header: "Land",
    accessorKey: "locationCountry",
    enableSorting: true,
  },
  {
    id: "parentCompanyName",
    header: "Muttergesellschaft",
    accessorKey: "parentCompanyName",
    enableSorting: true,
  },
  {
    id: "industrySectors",
    header: "Branchen",
    accessorKey: "industrySectors",
    enableSorting: true,
  },
  {
    id: "employeeNumber",
    header: "Mitarbeiter",
    accessorKey: "employeeNumber",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("employeeNumber") as number | null;
      return formatNumber(value);
    },
  },
  {
    id: "anualReturn",
    header: "Jahresumsatz",
    accessorKey: "anualReturn",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("anualReturn") as number | null;
      return formatCurrency(value);
    },
  },
  {
    id: "website",
    header: "Website",
    accessorKey: "website",
    enableSorting: true,
    cell: ({ row }) => {
      const value = row.getValue("website") as string | null;
      return value ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ) : "-";
    },
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="modal"
        pathname="/organisations"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 