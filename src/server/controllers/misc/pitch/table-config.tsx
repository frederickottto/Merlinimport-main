import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PitchModule } from "./schema";

export const pitchTableColumns: ColumnDef<PitchModule>[] = [
  {
    accessorKey: "title",
    header: "Titel",
  },
  {
    accessorKey: "description",
    header: "Beschreibung",
  },
  {
    accessorKey: "createdAt",
    header: "Erstellt am",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date | undefined;
      return date ? new Date(date).toLocaleDateString("de-DE") : "-";
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Aktualisiert am",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date | undefined;
      return date ? new Date(date).toLocaleDateString("de-DE") : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const pitchModule = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Menü öffnen</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                // Handle edit action
                console.log("Edit pitch module:", pitchModule.id);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Bearbeiten
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 