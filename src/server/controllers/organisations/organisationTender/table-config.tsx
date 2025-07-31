import { ColumnDef } from "@tanstack/react-table";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { formatDate } from "@/lib/utils";

export interface OrganisationTenderRow {
  id: string;
  organisation: { name: string } | null;
  callToTender: { title: string; shortDescription?: string | null; offerDeadline?: string | Date | null } | null;
  organisationRole?: string | null;
}

export function organisationTenderColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<OrganisationTenderRow>[] {
  return [
    getSelectionColumn<OrganisationTenderRow>(),
    {
      id: "organisation",
      header: "Organisation",
      accessorKey: "organisation.name",
      enableSorting: true,
      cell: ({ row }) => row.original.organisation?.name || "-",
    },
    {
      id: "callToTender",
      header: "Ausschreibung",
      accessorKey: "callToTender.title",
      enableSorting: true,
      cell: ({ row }) => row.original.callToTender?.title || "-",
    },
    {
      id: "shortDescription",
      header: "Kurzbeschreibung",
      accessorKey: "callToTender.shortDescription",
      enableSorting: false,
      cell: ({ row }) => row.original.callToTender?.shortDescription || "-",
    },
    {
      id: "offerDeadline",
      header: "Angebotsfrist",
      accessorKey: "callToTender.offerDeadline",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.callToTender?.offerDeadline),
    },
    {
      id: "organisationRole",
      header: "Rolle der Organisation",
      accessorKey: "organisationRole",
      enableSorting: true,
      cell: ({ row }) => row.original.organisationRole || "-",
    },
    {
      id: "actions",
      header: "Aktionen",
      cell: ({ row }) => (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname="/organisations/tender"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 