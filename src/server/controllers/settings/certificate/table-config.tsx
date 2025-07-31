import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CertificateTableData = {
  id: string;
  title: string;
  description?: string | null;
  type?: string | null;
  category?: string | null;
  deeplink?: string | null;
  salesCertificate?: boolean;
  createdAt: Date;
  updatedAt: Date;
  conditionsOfParticipationIDs: string[];
};

function CertificateTypeCell({ type }: { type: string | null | undefined }) {
  const isEmployee = type?.toLowerCase() === 'employee';
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "font-medium",
        isEmployee 
          ? "border-blue-200 bg-blue-300 text-blue-800" 
          : "border-purple-200 bg-purple-300 text-purple-800"
      )}
    >
      {isEmployee ? 'Personenzertifizierung' : 'Organisationszertifizierung'}
    </Badge>
  );
}

export function getCertificateColumns(onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<CertificateTableData>[] {
  return [
    getSelectionColumn<CertificateTableData>(),
    {
      id: "title",
      header: "Titel",
      accessorKey: "title",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "description",
      header: "Beschreibung",
      accessorKey: "description",
      cell: ({ row }) => row.original.description || '-',
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "category",
      header: "Kategorie",
      accessorKey: "category",
      cell: ({ row }) => row.original.category || '-',
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "type",
      header: "Typ",
      accessorKey: "type",
      cell: ({ row }) => <CertificateTypeCell type={row.original.type} />,
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "salesCertificate",
      header: "Verkaufszertifikat",
      accessorKey: "salesCertificate",
      cell: ({ row }) => row.original.salesCertificate ? "Ja" : "Nein",
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