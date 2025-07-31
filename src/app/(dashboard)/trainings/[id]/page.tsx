"use client";

import { notFound } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { getFormFields, defaultValues as trainingDefaultValues } from "@/server/controllers/misc/trainings/form-config";
import { detailSchema } from "@/server/controllers/misc/trainings/detail-config";
import { type T_Trainings } from "@/server/controllers/misc/trainings/schema";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = ({ params }: PageProps) => {
  const { id } = use(params);

  const utils = api.useUtils();
  const { data: training, isLoading } = api.trainings.getById.useQuery(
    { id },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const [isEditing, setIsEditing] = useState(false);

  const updateTraining = api.trainings.update.useMutation({
    onSuccess: async () => {
      toast.success("Training erfolgreich aktualisiert", {
        position: "top-right",
        duration: 3000,
      });
      setIsEditing(false);
      await utils.trainings.getById.invalidate({ id });
      await utils.trainings.getById.refetch({ id });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Fehler beim Aktualisieren des Trainings: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!training) {
    return notFound();
  }

  const handleSubmit = async (formData: Partial<T_Trainings>) => {
    try {
      const updateData = {
        trainingTitle: formData.trainingTitle || "",
        trainingContent: formData.trainingContent || "",
        trainingType: formData.trainingType,
      };
      await updateTraining.mutateAsync({
        id,
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating training:", error);
      toast.error("Fehler beim Aktualisieren des Trainings", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {training.trainingTitle}
          </h1>
        </div>

        <Card className="border-none shadow-none">
          {isEditing ? (
            <DynamicForm
              schema={{
                fields: getFormFields(),
                onSubmit: (data: unknown) => handleSubmit(data as Partial<T_Trainings>),
              }}
              defaultValues={{
                ...trainingDefaultValues,
                ...training,
              }}
            />
          ) : (
            <DetailView
              schema={detailSchema}
              data={training}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Page; 