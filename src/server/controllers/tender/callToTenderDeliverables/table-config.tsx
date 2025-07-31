import { ColumnDef } from "@tanstack/react-table";
import { CallToTenderDeliverables } from "./schema";

import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";

export const getTableColumns = (onView?: (id: string | number) => void, viewMode?: 'navigation' | 'modal'): ColumnDef<CallToTenderDeliverables>[] => [
  getSelectionColumn<CallToTenderDeliverables>(),
  {
    accessorKey: "callToTenderIDs",
    header: "Ausschreibung",
    cell: ({ row }) => {
      const tender = row.original.callToTender;
      return tender?.title || "-";
    },
  },
  {
    accessorKey: "deliverablesIDs",
    header: "Konzept",
    cell: ({ row }) => {
      const deliverable = row.original.deliverables;
      return deliverable?.title || "-";
    },
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
        pathname="/tenders/[id]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
];
