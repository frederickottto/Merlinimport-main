import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

type LocationTableData = {
  id: string;
  region: string;
  street: string;
  houseNumber: string;
  postCode: string;
  city: string;
  country: string;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
};

export function getLocationColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<LocationTableData>[] {
  return [
    getSelectionColumn<LocationTableData>(),
    {
      id: "street",
      header: "Straße",
      accessorKey: "street",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "houseNumber",
      header: "Hausnummer",
      accessorKey: "houseNumber",
      enableSorting: true,
    },
    {
      id: "postCode",
      header: "PLZ",
      accessorKey: "postCode",
      enableSorting: true,
    },
    {
      id: "city",
      header: "Stadt",
      accessorKey: "city",
      enableSorting: true,
    },
    {
      id: "region",
      header: "Region",
      accessorKey: "region",
      enableSorting: true,
    },
    {
      id: "country",
      header: "Land",
      accessorKey: "country",
      enableSorting: true,
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