import { ColumnDef } from "@tanstack/react-table";
import { Division } from "./schema";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";

export const getDivisionColumns = (
  onView?: (id: string | number) => void,
  viewMode: "navigation" | "modal" = "modal"
): ColumnDef<Division>[] => [
  getSelectionColumn<Division>(),
  {
    accessorKey: "title",
    header: "Titel",
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "abbreviation",
    header: "Abkürzung",
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "managedBy",
    header: "Leiter",
    cell: ({ row }) => {
      const managedBy = row.original.managedBy;
      return managedBy ? `${managedBy.foreName} ${managedBy.lastName}` : "-";
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "parentDivision",
    header: "Übergeordnete Abteilung",
    cell: ({ row }) => {
      const parentDivision = row.original.parentDivision;
      return parentDivision ? parentDivision.title : "-";
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
        pathname="/settings"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 