"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues as trainingDefaultValues } from "@/server/controllers/misc/trainings/form-config";
import { trainingsSchema } from "@/server/controllers/misc/trainings/schema";
import { z } from "zod";

type TrainingFormData = z.infer<typeof trainingsSchema>;

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();

  const createTraining = api.trainings.create.useMutation({
    onSuccess: async () => {
      toast.success("Training erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([
        utils.trainings.getAll.invalidate(),
      ]);
      router.push("/trainings");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Trainings: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: TrainingFormData) => {
    try {
      const createData = {
        trainingTitle: formData.trainingTitle,
        trainingContent: formData.trainingContent || undefined,
        trainingType: formData.trainingType || undefined,
        trainingTemplateID: formData.trainingTemplateID || undefined,
      };
      await createTraining.mutateAsync({ data: createData });
    } catch (error) {
      console.error("Error creating training:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Schulung</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Schulung
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: getFormFields(),
              onSubmit: (data: unknown) => handleSubmit(data as TrainingFormData),
            }}
            defaultValues={trainingDefaultValues}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 