"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

export interface TransformedOrganisation {
  id: string;
  organisation: {
    id: string;
    name: string;
  } | null;
  organisationRole: {
    role: string;
  } | null;
}

export function getOrganisationColumns(
  onView?: (id: string | number) => void,
  viewMode: 'navigation' | 'modal' = 'navigation'
): ColumnDef<TransformedOrganisation>[] {
  return [
    getSelectionColumn<TransformedOrganisation>(),
    {
      id: "organisation",
      header: "Organisation",
      accessorKey: "organisation.name",
      cell: ({ row }) => row.original.organisation?.name || '-',
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "organisationRole",
      header: "Rolle",
      accessorKey: "organisationRole.role",
      cell: ({ row }) => {
        const role = row.original.organisationRole?.role;
        console.log('Role in table cell:', role);
        const roleMap: Record<string, string> = {
          CLIENT: "Auftraggeber",
          CONTRACTOR: "Auftragnehmer",
          PARTNER: "Partner",
          CONSULTANT: "Berater",
        };
        return role ? roleMap[role] || role : '-';
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
          pathname={viewMode === 'modal' ? "/tenders/organisations" : "/tenders"}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
