"use client";

import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import { ActionCell } from "@/components/table/action-cell";
import { getSelectionColumn } from "@/components/table/columns";
import { formatDate, formatNumber } from "@/lib/utils";
import { T_Tender } from "./schema";

export const tenderColumns: ColumnDef<T_Tender>[] = [
  getSelectionColumn<T_Tender>(),
  {
    id: "title",
    header: "Titel",
    accessorKey: "title",
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "offerDeadline",
    header: "Angebotsfrist",
    accessorKey: "offerDeadline",
    cell: ({ row }) => formatDate(row.original.offerDeadline),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "questionDeadline",
    header: "Fragefrist",
    accessorKey: "questionDeadline",
    cell: ({ row }) => formatDate(row.original.questionDeadline),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "volumeEuro",
    header: "Volumen (€)",
    accessorKey: "volumeEuro",
    cell: ({ row }) => formatNumber(row.original.volumeEuro),
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const statusValue = row.original.status;
      if (!statusValue) return "-";
      
      const statusMap: Record<string, string> = {
        // Schema values
        "praequalifikation": "Präqualifikation",
        "teilnahmeantrag": "Teilnahmeantrag",
        "angebotsphase": "Angebotsphase",
        "warten_auf_entscheidung": "Warten auf Entscheidung",
        "gewonnen": "Gewonnen",
        "verloren": "Verloren",
        "nicht angeboten": "Nicht angeboten",
        
        // Imported values (from Excel)
        "Präqualifizierung": "Präqualifizierung",
        "Warten auf Entscheidung": "Warten auf Entscheidung",
        "In Erstellung TNA": "In Erstellung TNA",
        "In Erstellung Angebot": "In Erstellung Angebot",
        "Anderer im Lead": "Anderer im Lead",
        "nicht_angeboten": "Nicht angeboten",
        "in_erstellung_angebot": "In Erstellung Angebot",
        
        // Corrected status values
        "Gewonnen": "Gewonnen",
        "Verloren": "Verloren",
        "Nicht angeboten": "Nicht angeboten",
        "Versendet": "Versendet",
        "Angebotsphase": "Angebotsphase",
        "Verhandlungsphase": "Verhandlungsphase",
        "Warten auf Veröffentlichen": " ",
        "00 Warten auf Veröffentlichen": " ",
        "00 Warten auf Veröffentlichung": " ",
        "01 Lead": " ",
        "Zurückgezogen": "Zurückgezogen",
        "Lead": "Lead",
        "Teilnahmeantrag": "Teilnahmeantrag",
      };
      
      // Handle empty or space values
      if (statusValue === " " || statusValue === "" || statusValue === "null") {
        return "-";
      }
      
      return statusMap[statusValue] || statusValue;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "actions",
    header: "Aktionen",
    cell: ({ row }) => (
      <ActionCell 
        row={row} 
        viewMode="navigation"
        pathname="/tenders"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
]; 