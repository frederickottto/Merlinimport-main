"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { skillFormConfig } from "@/server/controllers/settings/skills/form-config";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";


type FormData = {
  title: string;
  type?: string;
  description?: string;
};

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createSkill = api.skills.create.useMutation({
    onSuccess: async () => {
      toast.success("Fähigkeit erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.skills.getAll.invalidate();
      router.push("/settings?tab=skills");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Fähigkeit: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      await createSkill.mutateAsync(formData as FormData);
    } catch (error) {
      console.error("Error creating skill:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Fähigkeit</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Fähigkeit
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: skillFormConfig.sections[0].fields,
              onSubmit: handleSubmit,
            }}
            defaultValues={{
              title: "",
              type: "",
              description: "",
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 