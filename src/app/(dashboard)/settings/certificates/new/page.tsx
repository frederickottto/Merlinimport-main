"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues } from "@/server/controllers/settings/certificate/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createCertificate = api.certificate.create.useMutation({
    onSuccess: async () => {
      toast.success("Zertifikat erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.certificate.getAll.invalidate();
      router.push("/settings?tab=certificates");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Zertifikats: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    const data = formData as typeof defaultValues;
    try {
      const createData = {
        data: {
          title: data.title || "",
          description: data.description || "",
          type: data.type || undefined,
          category: data.category,
          deeplink: data.deeplink || undefined,
          salesCertificate: data.salesCertificate,
        }
      };
      await createCertificate.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating certificate:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neues Zertifikat</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie ein neues Zertifikat
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