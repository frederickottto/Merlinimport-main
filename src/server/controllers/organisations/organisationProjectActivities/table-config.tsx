import { ColumnDef } from "@tanstack/react-table";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

interface OrganisationProjectActivityRow {
  id: string;
  organisation: { name: string } | null;
  project: { title: string } | null;
  role?: string | null;
  description?: string | null;
}

export function organisationProjectActivityColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<OrganisationProjectActivityRow>[] {
  return [
    getSelectionColumn<OrganisationProjectActivityRow>(),
    {
      id: "organisation",
      header: "Organisation",
      accessorKey: "organisation.name",
      enableSorting: true,
      cell: ({ row }) => row.original.organisation?.name || "-",
    },
    {
      id: "project",
      header: "Projekt",
      accessorKey: "project.title",
      enableSorting: true,
      cell: ({ row }) => row.original.project?.title || "-",
    },
    {
      id: "role",
      header: "Rolle",
      accessorKey: "role",
      enableSorting: true,
      cell: ({ row }) => row.original.role || "-",
    },
    {
      id: "description",
      header: "Beschreibung",
      accessorKey: "description",
      enableSorting: false,
      cell: ({ row }) => row.original.description || "-",
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/organisations/projects"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 