"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export interface EmployeeCertificateRow {
  id: string;
  employee: { foreName: string; lastName: string } | null;
  certificate: { title: string } | null;
  validUntil: Date | null;
}

export function employeeCertificatesColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<EmployeeCertificateRow>[] {
  return [
    getSelectionColumn<EmployeeCertificateRow>(),
    {
      id: "employee",
      header: "Mitarbeiter",
      accessorFn: (row) => row.employee ? `${row.employee.foreName} ${row.employee.lastName}` : "-",
      enableSorting: true,
      enableHiding: false,
    },
    {
      id: "certificate",
      header: "Zertifikat",
      accessorKey: "certificate.title",
      enableSorting: true,
      cell: ({ row }) => row.original.certificate?.title || "-",
    },
    {
      id: "validUntil",
      header: "Gültig bis",
      accessorKey: "validUntil",
      enableSorting: true,
      cell: ({ row }) => row.original.validUntil ? format(new Date(row.original.validUntil), "dd.MM.yyyy") : "-",
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/profiles/certificates"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 