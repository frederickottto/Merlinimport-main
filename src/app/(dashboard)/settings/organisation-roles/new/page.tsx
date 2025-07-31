"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { formSchema, defaultValues } from "@/server/controllers/settings/organisationRole/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createOrganisationRole = api.organisationRole.create.useMutation({
    onSuccess: async () => {
      toast.success("Organisationsrolle erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.organisationRole.getAll.invalidate();
      router.push("/settings?tab=organisationRoles");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Organisationsrolle: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      const data = formData as typeof defaultValues;
      const createData = {
        role: data.role,
      };

      await createOrganisationRole.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating organisation role:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Organisationsrolle</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Organisationsrolle
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: formSchema.fields,
              onSubmit: (data: unknown) => handleSubmit(data as typeof defaultValues),
            }}
            defaultValues={defaultValues}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 