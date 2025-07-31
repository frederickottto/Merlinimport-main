"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { formSchema, defaultValues } from "@/server/controllers/settings/location/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createLocation = api.location.create.useMutation({
    onSuccess: async () => {
      toast.success("Location successfully created", {
        position: "top-right",
        duration: 3000,
      });
      await utils.location.getAll.invalidate();
      router.push("/settings?tab=locations");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Error creating location: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      const data = formData as typeof defaultValues;
      const createData = {
        street: data.street,
        houseNumber: data.houseNumber,
        postCode: data.postCode,
        city: data.city,
        region: data.region,
        country: data.country,
      };

      await createLocation.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating location:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neuer Standort</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie einen neuen Standort
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: formSchema.fields,
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