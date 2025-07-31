"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCreateNavigation } from "@/hooks/use-create-navigation";

interface CreateButtonProps {
  tabValue?: string;
}

export function CreateButton({ tabValue }: CreateButtonProps) {
  const { handleCreate, getCreateLabel } = useCreateNavigation();

  return (
    <Button onClick={() => handleCreate(tabValue)}>
      <Plus className="h-4 w-4 mr-2" />
      {getCreateLabel(tabValue)}
    </Button>
  );
} 