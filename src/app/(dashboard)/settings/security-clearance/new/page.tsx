"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { securityClearanceFormConfig } from "@/server/controllers/settings/securityClearance/form-config";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";
import { z } from "zod";
import type { FormFieldSchema } from "@/types/form";

type FormData = {
  employeeIDs: string;
  securityClearanceType: string;
  securityClearanceLevel: string;
  applicationDate: Date;
  approved?: boolean;
};

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createSecurityClearance = api.securityClearance.create.useMutation({
    onSuccess: async () => {
      toast.success("Sicherheitscheck erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.securityClearance.getAll.invalidate();
      router.push("/settings?tab=securityClearance");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Sicherheitschecks: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      await createSecurityClearance.mutateAsync(formData as FormData);
    } catch (error) {
      console.error("Error creating security clearance:", error);
    }
  };

  const fields = securityClearanceFormConfig.sections[0].fields.map((field: FormFieldSchema) => ({
    ...field,
    validation: field.name === "applicationDate" ? z.coerce.date() : undefined,
  }));

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neuer Sicherheitscheck</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie einen neuen Sicherheitscheck
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields,
              onSubmit: handleSubmit,
            }}
            defaultValues={{
              employeeIDs: "",
              securityClearanceType: "",
              securityClearanceLevel: "",
              applicationDate: new Date(),
              approved: false,
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 