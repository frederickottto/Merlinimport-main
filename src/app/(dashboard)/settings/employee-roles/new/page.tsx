"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues } from "@/server/controllers/settings/employeeRole/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createEmployeeRole = api.employeeRole.create.useMutation({
    onSuccess: async () => {
      toast.success("Employee role successfully created", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeRole.getAll.invalidate();
      router.push("/settings?tab=employeeRoles");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Error creating employee role: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    const data = formData as typeof defaultValues;
    try {
      const createData = {
        role: data.role,
      };

      await createEmployeeRole.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating employee role:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Mitarbeiterrolle</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Mitarbeiterrolle
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: getFormFields(),
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