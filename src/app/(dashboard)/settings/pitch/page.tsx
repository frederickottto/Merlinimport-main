"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { DataTable } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus } from "lucide-react";
import { pitchFormConfig } from "@/server/controllers/misc/pitch/form-config";
import { pitchTableColumns } from "@/server/controllers/misc/pitch/table-config";
import type { PitchModule } from "@/server/controllers/misc/pitch/schema";

const Page = () => {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { data: pitchModules } = api.pitch.all.useQuery();
  const selectedPitchModule = pitchModules?.find((module: PitchModule) => module.id === selectedItemId);

  const createPitchModule = api.pitch.create.useMutation({
    onSuccess: async () => {
      toast.success("Pitch-Modul erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.pitch.all.invalidate();
      setIsDialogOpen(false);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Pitch-Moduls: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const updatePitchModule = api.pitch.update.useMutation({
    onSuccess: async () => {
      toast.success("Pitch-Modul erfolgreich aktualisiert", {
        position: "top-right",
        duration: 3000,
      });
      await utils.pitch.all.invalidate();
      setIsEditing(false);
      setSelectedItemId(null);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Update error:", error);
      toast.error("Fehler beim Aktualisieren des Pitch-Moduls: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleCreate = async (data: unknown) => {
    try {
      await createPitchModule.mutateAsync(data as PitchModule);
    } catch (error) {
      console.error("Error creating pitch module:", error);
    }
  };

  const handleUpdate = async (data: unknown) => {
    try {
      const formData = data as PitchModule;
      await updatePitchModule.mutateAsync({
        ...formData,
      });
    } catch (error) {
      console.error("Error updating pitch module:", error);
    }
  };

  const handleModalOpen = (id: string | number) => {
    setSelectedItemId(String(id));
  };

  const handleModalClose = () => {
    setSelectedItemId(null);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Pitch-Module</h1>
              <p className="text-muted-foreground mt-2">
                Verwalten Sie Ihre Pitch-Module
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </div>

        <DataTable
          data={(pitchModules || []).map((module: PitchModule) => ({
            ...module,
            createdAt: module.createdAt ?? undefined,
            updatedAt: module.updatedAt ?? undefined,
          }))}
          columns={pitchTableColumns}
          onView={handleModalOpen}
          viewMode="modal"
          hideCreateButton={true}
        />

        {/* Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Neues Pitch-Modul</DialogTitle>
            </DialogHeader>
            <DynamicForm
              schema={{
                fields: pitchFormConfig.sections[0].fields,
                onSubmit: handleCreate,
              }}
              defaultValues={{
                title: "",
                description: "",
                templateVariables: {},
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!selectedItemId} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Pitch-Modul bearbeiten</DialogTitle>
            </DialogHeader>
            {selectedPitchModule && (
              isEditing ? (
                <DynamicForm
                  schema={{
                    fields: pitchFormConfig.sections[0].fields,
                    onSubmit: handleUpdate,
                  }}
                  defaultValues={{
                    title: selectedPitchModule.title,
                    description: selectedPitchModule.description,
                    templateVariables: selectedPitchModule.templateVariables || {},
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Titel</h3>
                    <p className="text-muted-foreground">{selectedPitchModule.title}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Beschreibung</h3>
                    <p className="text-muted-foreground">{selectedPitchModule.description}</p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleEdit}>Bearbeiten</Button>
                  </div>
                </div>
              )
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Page;
