"use client";

import { notFound } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getFormFields, defaultValues as templateDefaultValues } from "@/server/controllers/misc/templates/form-config";
import { detailSchema } from "@/server/controllers/misc/templates/detail-config";
import { type T_Templates } from "@/server/controllers/misc/templates/schema";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = ({ params }: PageProps) => {
  const { id } = use(params);

  const utils = api.useUtils();
  const { data: template, isLoading } = api.templates.getById.useQuery(
    { id },
    {
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const { data: concepts = [] } = api.concepts.all.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const [isEditing, setIsEditing] = useState(false);

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

  const updateTemplate = api.templates.update.useMutation({
    onSuccess: async () => {
      toast.success("Vorlage erfolgreich aktualisiert", {
        position: "top-right",
        duration: 3000,
      });
      setIsEditing(false);
      await utils.templates.getById.invalidate({ id });
      await utils.templates.getById.refetch({ id });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Fehler beim Aktualisieren der Vorlage: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!template) {
    return notFound();
  }

  const handleSubmit = async (formData: Partial<T_Templates>) => {
    try {
      const updateData = {
        title: formData.title || "",
        type: formData.type || "",
        description: formData.description || "",
        filePath: formData.filePath || "",
        keywords: Array.isArray(formData.keywords) ? formData.keywords : [],
        notes: formData.notes || "",
        conceptIDs: Array.isArray(formData.conceptIDs) ? formData.conceptIDs : [],
      };

      await updateTemplate.mutateAsync({
        id,
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating template:", error);
      toast.error("Fehler beim Aktualisieren der Vorlage", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  // Transform concept IDs to titles for display
  const templateWithConceptTitles = {
    ...template,
    conceptIDs: template.conceptIDs.map(id => {
      const concept = concepts.find(c => c.id === id);
      return concept ? { title: concept.title, id: concept.id } : { title: id, id };
    })
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {template.title}
          </h1>
        </div>

        <Card className="border-none shadow-none">
          {isEditing ? (
            <DynamicForm
              schema={{
                fields: formFields,
                onSubmit: (data: unknown) => handleSubmit(data as Partial<T_Templates>),
              }}
              defaultValues={{
                ...templateDefaultValues,
                ...template,
              }}
            />
          ) : (
            <DetailView 
              schema={detailSchema}
              data={templateWithConceptTitles} 
              onEdit={() => setIsEditing(true)} 
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Page; 