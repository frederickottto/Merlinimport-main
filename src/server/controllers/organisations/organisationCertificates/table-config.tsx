import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

interface OrganisationCertificateRow {
  id: string;
  organisation: { name: string } | null;
  certificate: { title: string } | null;
  certificationObject?: string | null;
  validUntil?: string | Date | null;
}

export function organisationCertificateColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<OrganisationCertificateRow>[] {
  return [
    getSelectionColumn<OrganisationCertificateRow>(),
    {
      id: "organisation",
      header: "Organisation",
      accessorKey: "organisation.name",
      enableSorting: true,
      cell: ({ row }) => row.original.organisation?.name || "-",
    },
    {
      id: "certificate",
      header: "Zertifikat",
      accessorKey: "certificate.title",
      enableSorting: true,
      cell: ({ row }) => row.original.certificate?.title || "-",
    },
    {
      id: "certificationObject",
      header: "Zertifizierungsobjekt",
      accessorKey: "certificationObject",
      enableSorting: false,
      cell: ({ row }) => row.original.certificationObject || "-",
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
          pathname="/organisations/certificates"
          onView={onView}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
} 