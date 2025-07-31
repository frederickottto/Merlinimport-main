"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues as conceptDefaultValues } from "@/server/controllers/misc/concepts/form-config";

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const templates = api.templates.all.useQuery();
  
  const createConcept = api.concepts.create.useMutation({
    onSuccess: async () => {
      toast.success("Konzept erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      await utils.concepts.all.invalidate();
      router.push("/concepts");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Konzepts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: typeof conceptDefaultValues) => {
    try {
      const createData = {
        title: formData.title || "",
        description: formData.description || "",
        type: "concept",
        status: formData.status || "draft",
        textMaturity: formData.textMaturity ?? false,
        wordCount: formData.wordCount ? Number(formData.wordCount) : undefined,
        language: Array.isArray(formData.language) ? formData.language : [],
        genderNeutral: formData.genderNeutral ?? false,
        professionalTone: formData.professionalTone ?? false,
        containsGraphics: formData.containsGraphics ?? false,
        templateIDs: Array.isArray(formData.templateIDs) ? formData.templateIDs : [],
        keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
        notes: formData.notes || "",
      };

      await createConcept.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating concept:", error);
    }
  };

  const formFields = getFormFields();
  const templateField = formFields.find(field => field.name === "templateIDs");
  if (templateField && templateField.type === "command") {
    templateField.options = {
      items: templates.data?.map(template => ({
        label: template.title,
        value: template.id
      })) || [],
      multiple: true
    };
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neues Konzept</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie ein neues Konzept
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: formFields,
              onSubmit: (data: unknown) => handleSubmit(data as typeof conceptDefaultValues),
            }}
            defaultValues={conceptDefaultValues}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 