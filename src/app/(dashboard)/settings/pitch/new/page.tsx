"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { pitchFormConfig } from "@/server/controllers/misc/pitch/form-config";


const defaultValues = {
  title: "",
  description: "",
  templateVariables: {} as Record<string, string>,
};

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createPitchModule = api.pitch.create.useMutation({
    onSuccess: async () => {
      toast.success("Pitch-Modul erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.pitch.all.invalidate();
      router.push("/settings?tab=pitch");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Pitch-Moduls: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    const data = formData as typeof defaultValues;
    try {
      await createPitchModule.mutateAsync({
        title: data.title,
        description: data.description,
        templateVariables: data.templateVariables,
      });
    } catch (error) {
      console.error("Error creating pitch module:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neues Pitch-Modul</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie ein neues Pitch-Modul
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: pitchFormConfig.sections[0].fields,
              onSubmit: handleSubmit,
            }}
            defaultValues={defaultValues}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 