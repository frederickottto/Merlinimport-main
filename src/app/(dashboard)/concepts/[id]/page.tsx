"use client";

import { notFound } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { getFormFields, defaultValues as conceptDefaultValues } from "@/server/controllers/misc/concepts/form-config";
import { detailSchema } from "@/server/controllers/misc/concepts/detail-config";
import { type T_Concept } from "@/server/controllers/misc/concepts/schema";
import { FormFieldSchema } from "@/types/form";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Template {
  id: string;
  type: string;
  title: string;
  description: string | null;
  keywords: string[];
  notes: string | null;
  filePath: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  callToTenderIDs: string[];
  deliverablesIDs: string[];
}

const Page = ({ params }: PageProps) => {
  const { id } = use(params);

  const utils = api.useUtils();
  const { data: concept, isLoading } = api.concepts.getById.useQuery({ id });
  const { data: templates = [] } = api.templates.all.useQuery() ?? { data: [] };

  const [isEditing, setIsEditing] = useState(false);
  
  // Memoize the base fields
  const baseFields = useMemo(() => getFormFields(), []);

  // Memoize the form fields with templates
  const formFields = useMemo(() => {
    if (!templates?.length) {
      return baseFields;
    }

    return baseFields.map((field: FormFieldSchema) => {
      if (field.name === "templateIDs") {
        return {
          ...field,
          options: {
            items: templates.map((template: Template) => ({
              label: template.title,
              value: template.id,
              description: template.description || undefined,
              keywords: template.keywords || [],
              type: template.type,
            })),
            multiple: true
          }
        };
      }
      return field;
    });
  }, [templates, baseFields]);

  const updateConcept = api.concepts.update.useMutation({
    onSuccess: async () => {
      toast.success("Konzept erfolgreich aktualisiert", {
        position: "top-right",
        duration: 3000,
      });
      setIsEditing(false);
      // Invalidate and refetch the concept data
      await utils.concepts.getById.invalidate({ id });
      await utils.concepts.getById.refetch({ id });
    },
    onError: (error) => {
      console.error("Update error:", error);
      toast.error("Fehler beim Aktualisieren des Konzepts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!concept) {
    return notFound();
  }

  const handleSubmit = async (formData: unknown) => {
    try {
      const data = formData as Partial<T_Concept>;
      const updateData = {
        title: data.title || "",
        description: data.description || "",
        type: "concept",
        status: data.status || "draft",
        language: Array.isArray(data.language) ? data.language : [],
        textMaturity: data.textMaturity ?? false,
        wordCount: data.wordCount ? Number(data.wordCount) : undefined,
        genderNeutral: data.genderNeutral ?? false,
        professionalTone: data.professionalTone ?? false,
        containsGraphics: data.containsGraphics ?? false,
        keywords: Array.isArray(data.keywords) ? data.keywords : [],
        notes: data.notes || "",
        templateIDs: Array.isArray(data.templateIDs) ? data.templateIDs : concept.template?.map(t => t.id) || []
      };

      await updateConcept.mutateAsync({
        id,
        data: updateData,
      });
    } catch (error) {
      console.error("Error updating concept:", error);
      toast.error("Fehler beim Aktualisieren des Konzepts", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {concept.title}
          </h1>
        </div>

        <Card className="border-none shadow-none">
          {isEditing ? (
            <DynamicForm
              schema={{
                fields: formFields,
                onSubmit: handleSubmit,
              }}
              defaultValues={{
                ...conceptDefaultValues,
                ...concept,
              }}
            />
          ) : (
            <DetailView 
              schema={detailSchema}
              data={{
                ...concept,
                template: concept.template?.map(t => ({ title: t.title, id: t.id })) || []
              }}
              onEdit={() => setIsEditing(true)} 
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Page; 