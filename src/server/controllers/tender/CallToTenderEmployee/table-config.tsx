import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

interface Employee {
  foreName: string;
  lastName: string;
}

interface CallToTenderEmployee {
  id: string;
  employee: Employee;
  employeeCallToTenderRole: string;
  role: string | null;
  profileTitle: string | null;
  description: string | null;
  costCenter: number | null;
  profilePrice: number | null;
  travelCost: number | null;
  autoSelected: boolean | null;
}

const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR"
  }).format(value);
};

export function getCallToTenderEmployeeColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<CallToTenderEmployee>[] {
  return [
    getSelectionColumn<CallToTenderEmployee>(),
    {
      id: "employee",
      header: "Mitarbeiter",
      accessorKey: "employee",
      enableSorting: true,
      cell: ({ row }) => {
        const employee = row.original.employee;
        return employee ? `${employee.foreName} ${employee.lastName}`.trim() : "-";
      }
    },
    {
      id: "employeeCallToTenderRole",
      header: "Rolle",
      accessorKey: "employeeCallToTenderRole",
      enableSorting: true,
      cell: ({ row }) => row.original.employeeCallToTenderRole ?? "-"
    },
    {
      id: "role",
      header: "Position",
      accessorKey: "role",
      enableSorting: true,
      cell: ({ row }) => row.original.role ?? "-"
    },
    {
      id: "profileTitle",
      header: "Profilbezeichnung",
      accessorKey: "profileTitle",
      enableSorting: true,
      cell: ({ row }) => row.original.profileTitle ?? "-"
    },
    {
      id: "costCenter",
      header: "Kostenstelle",
      accessorKey: "costCenter",
      enableSorting: true,
      cell: ({ row }) => row.original.costCenter ?? "-"
    },
    {
      id: "profilePrice",
      header: "Profilpreis",
      accessorKey: "profilePrice",
      enableSorting: true,
      cell: ({ row }) => formatCurrency(row.original.profilePrice)
    },
    {
      id: "travelCost",
      header: "Reisekosten",
      accessorKey: "travelCost",
      enableSorting: true,
      cell: ({ row }) => formatCurrency(row.original.travelCost)
    },
    {
      id: "autoSelected",
      header: "Auto-Match",
      accessorKey: "autoSelected",
      enableSorting: true,
      cell: ({ row }) => row.original.autoSelected ? "Ja" : "Nein"
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          onView={onView} 
          viewMode={viewMode}
          pathname="/tenders"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    }
  ];
}

export const columns = [
  {
    key: "employee",
    label: "Mitarbeiter",
    sortable: true,
    render: (value: unknown) => {
      if (typeof value === "object" && value !== null && "foreName" in value && "lastName" in value) {
        const employee = value as Employee;
        return `${employee.foreName} ${employee.lastName}`.trim();
      }
      return "-";
    }
  },
  {
    key: "employeeCallToTenderRole",
    label: "Rolle",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  },
  {
    key: "role",
    label: "Position",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  },
  {
    key: "profileTitle",
    label: "Profilbezeichnung",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  },
  {
    key: "costCenter",
    label: "Kostenstelle",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  },
  {
    key: "profilePrice",
    label: "Profilpreis",
    sortable: true,
    render: (value: unknown) => formatCurrency(value as number)
  },
  {
    key: "travelCost",
    label: "Reisekosten",
    sortable: true,
    render: (value: unknown) => formatCurrency(value as number)
  }
];
