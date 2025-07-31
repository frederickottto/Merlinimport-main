"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { divisionFormConfig } from "@/server/controllers/settings/division/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createDivision = api.division.create.useMutation({
    onSuccess: async () => {
      toast.success("Abteilung erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.division.getAll.invalidate();
      router.push("/settings?tab=divisions");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Abteilung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      const data = formData as {
        title: string;
        abbreviation?: string;
        managedById?: string;
        parentDivisionId?: string;
      };

      await createDivision.mutateAsync(data);
    } catch (error) {
      console.error("Error creating division:", error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Neue Abteilung</h1>
        <DynamicForm
          schema={{
            fields: divisionFormConfig,
            onSubmit: handleSubmit,
          }}
          defaultValues={{}}
        />
      </Card>
    </div>
  );
};

export default Page; 