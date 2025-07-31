"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { getSelectionColumn } from "@/components/table/columns";
import { ActionCell } from "@/components/table/action-cell";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { de } from "date-fns/locale";

export type TaskTableItem = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedTo: {
    id: string;
    foreName: string;
    lastName: string;
  } | null;
  createdBy: {
    id: string;
    foreName: string;
    lastName: string;
  };
  tender: {
    id: string;
    title: string;
  };
  createdAt: Date | null;
  updatedAt: Date | null;
  dueDate: Date | null;
};

const statusColors = {
  TODO: "bg-yellow-100 text-yellow-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

export const getTaskColumns = (viewMode: 'navigation' | 'modal' = 'navigation', pathname: string = '/tasks'): ColumnDef<TaskTableItem>[] => [
  getSelectionColumn<TaskTableItem>(),
  {
    id: "title",
    header: "Title",
    accessorKey: "title",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row, table }) => {
      const title = row.getValue("title") as string;
      return (
        <button
          onClick={() => {
            const onView = (table.options.meta as { onView?: (id: string) => void })?.onView;
            if (onView) {
              onView(row.original.id);
            }
          }}
          className="text-left hover:underline cursor-pointer"
        >
          {title}
        </button>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const status = row.getValue("status") as keyof typeof statusColors;
      return (
        <Badge className={statusColors[status]}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: "assignedTo",
    header: "Assigned To",
    accessorKey: "assignedTo",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo") as TaskTableItem["assignedTo"];
      return assignedTo ? `${assignedTo.foreName} ${assignedTo.lastName}` : "-";
    },
  },
  {
    id: "dueDate",
    header: "Due Date",
    accessorKey: "dueDate",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as Date | null;
      return date ? format(date, "dd.MM.yyyy", { locale: de }) : "-";
    },
  },
  {
    id: "tender",
    header: "Tender",
    accessorKey: "tender.title",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "createdBy",
    header: "Created By",
    accessorKey: "createdBy",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const createdBy = row.getValue("createdBy") as TaskTableItem["createdBy"];
      return `${createdBy.foreName} ${createdBy.lastName}`;
    },
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    enableSorting: true,
    enableHiding: false,
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | null;
      return date ? format(date, "dd.MM.yyyy") : "-";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      return (
        <ActionCell 
          row={row} 
          viewMode={viewMode}
          pathname={pathname}
          onView={(table.options.meta as { onView?: (id: string | number) => void })?.onView}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// Keep the original columns export for backward compatibility
export const columns = getTaskColumns(); 