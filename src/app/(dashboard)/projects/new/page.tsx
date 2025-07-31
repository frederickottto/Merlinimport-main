"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues, updateProjectSchema } from "@/server/controllers/projects/form-config";
import { z } from "zod";

export default function Page() {
	const router = useRouter();
	const utils = api.useUtils();
	
	const createProject = api.projects.create.useMutation({
		onSuccess: async () => {
			toast.success("Projekt erfolgreich erstellt", {
				position: "top-right",
				duration: 3000,
			});
			await utils.projects.all.invalidate();
			router.push("/projects");
		},
		onError: (error) => {
			console.error("Create error:", error);
			toast.error("Fehler beim Erstellen des Projekts: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const handleSubmit = async (formData: unknown) => {
		try {
			// First cast to Record<string, unknown> to ensure basic object structure
			const recordData = formData as Record<string, unknown>;
			
			// Clean up the data
			const cleanedData = {
				title: recordData.title as string, // title is required
				type: recordData.type as string | undefined,
				referenceApproval: recordData.referenceApproval as boolean | undefined,
				description: recordData.description as string | undefined,
				keywords: recordData.keywords
					? Array.isArray(recordData.keywords)
						? recordData.keywords
						: [recordData.keywords]
					: [],
				teamSize: recordData.teamSize ? Number(recordData.teamSize) : undefined,
				scopeAuditHours: recordData.scopeAuditHours ? Number(recordData.scopeAuditHours) : undefined,
				volumePTTotal: recordData.volumePTTotal ? Number(recordData.volumePTTotal) : undefined,
				volumePTRetrieved: recordData.volumePTRetrieved ? Number(recordData.volumePTRetrieved) : undefined,
				volumeEuroTotal: recordData.volumeEuroTotal ? Number(recordData.volumeEuroTotal) : undefined,
				volumeEuroRetrieved: recordData.volumeEuroRetrieved ? Number(recordData.volumeEuroRetrieved) : undefined,
				frameworkContractProjectIDs: (recordData.frameworkContractProjectIDs as string) || null,
				contractBeginn: recordData.contractBeginn 
					? new Date(recordData.contractBeginn as string | number | Date) 
					: undefined,
				contractEnd: recordData.contractEnd 
					? new Date(recordData.contractEnd as string | number | Date) 
					: undefined,
			};

			// Remove undefined values
			const normalizedData = Object.fromEntries(
				Object.entries(cleanedData).filter(([, value]) => value !== undefined)
			);
			
			// Validate the cleaned data
			const validatedData = updateProjectSchema.parse(normalizedData);
			
			await createProject.mutateAsync(validatedData);
		} catch (error) {
			console.error("Error creating project:", error);
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
					position: "top-right",
					duration: 3000,
				});
			} else {
				toast.error("Ein Fehler ist aufgetreten beim Erstellen des Projekts", {
					position: "top-right",
					duration: 3000,
				});
			}
		}
	};

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold tracking-tight">Neues Projekt</h1>
					<p className="text-muted-foreground mt-2">
						Erstellen Sie ein neues Projekt
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
}
