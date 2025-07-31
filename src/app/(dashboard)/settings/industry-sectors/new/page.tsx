"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues } from "@/server/controllers/settings/industrySector/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const createIndustrySector = api.industrySector.create.useMutation({
    onSuccess: async () => {
      toast.success("Industry sector successfully created", {
        position: "top-right",
        duration: 3000,
      });
      await utils.industrySector.getAll.invalidate();
      router.push("/settings?tab=industrySectors");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Error creating industry sector: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: unknown) => {
    try {
      const data = formData as typeof defaultValues;
      const createData = {
        industrySector: data.industrySector,
        industrySectorEY: data.industrySectorEY,
      };

      await createIndustrySector.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating industry sector:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Branche</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Branche
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: getFormFields(),
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