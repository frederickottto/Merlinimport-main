import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";
import { type CallToTenderProject } from "./schema";

type Project = {
  id: string;
  title: string;
  type?: string;
  description?: string;
};

export function getCallToTenderProjectColumns(
  onView?: (id: string | number) => void,
  viewMode?: 'navigation' | 'modal'
): ColumnDef<CallToTenderProject>[] {
  return [
    getSelectionColumn<CallToTenderProject>(),
    {
      id: "project",
      header: "Projekt",
      accessorKey: "project",
      enableSorting: true,
      cell: ({ row }) => {
        const project = row.original.project;
        return project ? project.title : "-";
      }
    },
    {
      id: "role",
      header: "Rolle",
      accessorKey: "role",
      enableSorting: true,
      cell: ({ row }) => row.original.role ?? "-"
    },
    {
      id: "relevance",
      header: "Relevanz",
      accessorKey: "relevance",
      enableSorting: true,
      cell: ({ row }) => {
        const relevance = row.original.relevance;
        if (!relevance) return "-";
        const relevanceMap: Record<string, string> = {
          HIGH: "Hoch",
          MEDIUM: "Mittel",
          LOW: "Niedrig"
        };
        return relevanceMap[relevance] || relevance;
      }
    },
    {
      id: "description",
      header: "Beschreibung",
      accessorKey: "description",
      enableSorting: true,
      cell: ({ row }) => row.original.description ?? "-"
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
    key: "project",
    label: "Projekt",
    sortable: true,
    render: (value: unknown) => {
      if (typeof value === "object" && value !== null && "title" in value) {
        const project = value as Project;
        return project.title;
      }
      return "-";
    }
  },
  {
    key: "role",
    label: "Rolle",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  },
  {
    key: "relevance",
    label: "Relevanz",
    sortable: true,
    render: (value: unknown) => {
      if (typeof value !== "string") return "-";
      const relevanceMap: Record<string, string> = {
        HIGH: "Hoch",
        MEDIUM: "Mittel",
        LOW: "Niedrig"
      };
      return relevanceMap[value] || value;
    }
  },
  {
    key: "description",
    label: "Beschreibung",
    sortable: true,
    render: (value: unknown) => value ?? "-"
  }
]; 