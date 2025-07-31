"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues as tenderDefaultValues } from "@/server/controllers/tender/form-config";
import { getFormFields as getConceptFormFields, defaultValues as conceptDefaultValues } from "@/server/controllers/misc/concepts/form-config";
import { getFormFields as getTemplateFormFields, defaultValues as templateDefaultValues } from "@/server/controllers/misc/templates/form-config";
import { Suspense } from "react";

function NewTenderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formType = searchParams.get('type') || 'overview';
  const utils = api.useUtils();
  
  const createTender = api.tenders.create.useMutation({
    onSuccess: async (data) => {
      toast.success("Ausschreibung erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      // Invalidate and refetch all relevant queries
      await Promise.all([
        utils.tenders.all.invalidate(),
      ]);
      // Redirect to tender detail page
      router.push(`/tenders/${data.id}`);
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Ausschreibung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

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
      router.push("/tender/templates");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen der Vorlage: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const createConcept = api.concepts.create.useMutation({
    onSuccess: () => {
      toast.success("Konzept erfolgreich erstellt", {
        position: "top-right",
        duration: 3000,
      });
      router.push("/tender/concepts");
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast.error("Fehler beim Erstellen des Konzepts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleSubmit = async (formData: typeof tenderDefaultValues | typeof conceptDefaultValues | typeof templateDefaultValues) => {
    try {
      if (formType === 'template') {
        const templateData = formData as typeof templateDefaultValues;
        const createData = {
          title: templateData.title,
          type: "template",
          description: templateData.description || undefined,
          filePath: templateData.filePath,
        };

        console.log("Create template data:", createData);
        await createTemplate.mutateAsync(createData);
      } else if (formType === 'concept') {
        const conceptData = formData as typeof conceptDefaultValues;
        const createData = {
          title: conceptData.title || "",
          description: conceptData.description || "",
          type: "concept",
          status: conceptData.status || "draft",
          textMaturity: conceptData.textMaturity ?? false,
          wordCount: conceptData.wordCount ? Number(conceptData.wordCount) : undefined,
          language: Array.isArray(conceptData.language) ? conceptData.language : [],
          genderNeutral: conceptData.genderNeutral ?? false,
          professionalTone: conceptData.professionalTone ?? false,
          containsGraphics: conceptData.containsGraphics ?? false,
          templateIDs: Array.isArray(conceptData.templateIDs) ? conceptData.templateIDs : [],
          keywords: Array.isArray(conceptData.keywords) ? conceptData.keywords : [],
          notes: conceptData.notes || "",
        };

        console.log("Create concept data:", createData);
        await createConcept.mutateAsync(createData);
      } else {
        const tenderData = formData as typeof tenderDefaultValues;
        // Transform the form data for tender creation
        const createData = {
          title: tenderData.title || "",
          type: formType,
          shortDescription: tenderData.shortDescription || undefined,
          awardCriteria: tenderData.awardCriteria || undefined,
          offerDeadline: tenderData.offerDeadline ? new Date(tenderData.offerDeadline) : undefined,
          questionDeadline: tenderData.questionDeadline ? new Date(tenderData.questionDeadline) : undefined,
          bindingDeadline: tenderData.bindingDeadline ? new Date(tenderData.bindingDeadline) : undefined,
          volumeEuro: tenderData.volumeEuro ? Number(tenderData.volumeEuro) : undefined,
          volumePT: tenderData.volumePT ? Number(tenderData.volumePT) : undefined,
          successChance: tenderData.successChance ? Number(tenderData.successChance) : undefined,
          keywords: Array.isArray(tenderData.keywords) ? tenderData.keywords : [],
          status: tenderData.status || undefined,
          notes: tenderData.notes || undefined,
          websiteTenderPlattform: tenderData.websiteTenderPlattform || undefined,
          standards: tenderData.standards || undefined,
        };

        console.log("Create tender data:", createData);
        await createTender.mutateAsync(createData);
      }
    } catch (error) {
      console.error("Error creating:", error);
    }
  };

  // Get the appropriate title based on the form type
  const getTitle = () => {
    switch (formType) {
      case 'concept':
        return "Neues Konzept";
      case 'template':
        return "Neue Vorlage";
      default:
        return "Neue Ausschreibung";
    }
  };

  // Get the appropriate description based on the form type
  const getDescription = () => {
    switch (formType) {
      case 'concept':
        return "Erstellen Sie ein neues Konzept";
      case 'template':
        return "Erstellen Sie eine neue Vorlage";
      default:
        return "Erstellen Sie eine neue Ausschreibung";
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
          <p className="text-muted-foreground mt-2">
            {getDescription()}
          </p>
        </div>

        <Card className="border-none shadow-none">
          <DynamicForm
            schema={{
              fields: formType === 'concept' ? getConceptFormFields() : formType === 'template' ? getTemplateFormFields() : getFormFields(),
              onSubmit: (data: unknown) => handleSubmit(data as typeof tenderDefaultValues | typeof conceptDefaultValues | typeof templateDefaultValues),
            }}
            defaultValues={formType === 'concept' ? conceptDefaultValues : formType === 'template' ? templateDefaultValues : tenderDefaultValues}
          />
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewTenderContent />
    </Suspense>
  );
} 