"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues as templateDefaultValues } from "@/server/controllers/misc/templates/form-config";
import { templatesSchema } from "@/server/controllers/misc/templates/schema";
import { z } from "zod";
import { useMemo } from "react";

type TemplateFormData = z.infer<typeof templatesSchema>;

const Page = () => {
  const router = useRouter();
  const utils = api.useUtils();
  
  const { data: concepts = [] } = api.concepts.all.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Memoize the form fields with concepts
  const formFields = useMemo(() => {
    const fields = getFormFields();
    if (!concepts?.length) return fields;

    return fields.map(field => {
      if (field.name === "conceptIDs") {
        return {
          ...field,
          options: {
            items: concepts.map(concept => ({
              label: concept.title,
              value: concept.id,
              description: concept.description,
              keywords: concept.keywords || [],
            })),
            multiple: true
          }
        };
      }
      return field;
    });
  }, [concepts]);
  
  const createTemplate = api.templates.create.useMutation({
    onSuccess: async () => {
      toast.success("Vorlage erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      // Invalidate and refetch all relevant queries
      await Promise.all([
        utils.templates.all.invalidate(),
      ]);
      // Redirect to templates list
      router.push("/templates");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Vorlage: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: TemplateFormData) => {
    try {
      // Transform the form data for template creation
      const createData = {
        title: formData.title,
        type: formData.type,
        description: formData.description || undefined,
        filePath: formData.filePath,
        keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
        notes: formData.notes || undefined,
        conceptIDs: Array.isArray(formData.conceptIDs) ? formData.conceptIDs : [],
      };

      console.log("Create template data:", createData);
      await createTemplate.mutateAsync(createData);
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Neue Vorlage</h1>
          <p className="text-muted-foreground mt-2">
            Erstellen Sie eine neue Vorlage
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: formFields,
              onSubmit: (data: unknown) => handleSubmit(data as TemplateFormData),
            }}
            defaultValues={templateDefaultValues}
          />
        </Card>
      </div>
    </div>
  );
};

export default Page; 