import { Row } from "@tanstack/react-table";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTableActions } from "@/hooks/use-table-actions";

interface ActionCellProps<T> {
  row: Row<T>;
  onView?: (id: string | number) => void;
  viewMode?: 'navigation' | 'modal';
  pathname: string;
  hideView?: boolean;
}

export function ActionCell<T extends { id: string }>({ 
  row, 
  onView, 
  viewMode = 'navigation',
  pathname,
  hideView = false
}: ActionCellProps<T>) {
  const item = row.original;
  const { handleView, handleDelete } = useTableActions({
    item,
    pathname,
    viewMode,
    onModalOpen: onView,
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!hideView && <DropdownMenuItem onClick={handleView}>View</DropdownMenuItem>}
        {!hideView && <DropdownMenuSeparator />}
        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 