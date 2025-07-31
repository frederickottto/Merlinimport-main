"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues, updateSchema } from "@/server/controllers/organisations/form-config";
import { z } from "zod";

type OrganisationFormData = z.infer<typeof updateSchema>;

const Page = () => {
	const router = useRouter();
	const utils = api.useUtils();
	
	const createOrganisation = api.organisations.create.useMutation({
		onSuccess: async () => {
			toast.success("Organisation erfolgreich erstellt", {
				position: "top-right",
				duration: 3000,
			});
			await utils.organisations.all.invalidate();
			router.push("/organisations");
		},
		onError: (error) => {
			console.error("Create error:", error);
			toast.error("Fehler beim Erstellen der Organisation: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const handleSubmit = async (data: unknown) => {
		try {
			const formData = data as OrganisationFormData;
			// Normalize industrySector to array
			const normalisedFormData = {
				...formData,
				industrySector: formData.industrySector
					? Array.isArray(formData.industrySector)
						? formData.industrySector
						: [formData.industrySector]
					: [],
				organisationOrganisationRoles: formData.organisationOrganisationRoles
					? Array.isArray(formData.organisationOrganisationRoles)
						? formData.organisationOrganisationRoles
						: [formData.organisationOrganisationRoles]
					: [],
				parentOrganisation: formData.parentOrganisation || undefined,
			};
			// Validate the form data against the update schema
			const validatedData = updateSchema.parse(normalisedFormData);
			await createOrganisation.mutateAsync(validatedData);
		} catch (error) {
			console.error("Error creating organisation:", error);
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
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
					<h1 className="text-3xl font-bold tracking-tight">Neue Organisation</h1>
					<p className="text-muted-foreground mt-2">
						Erstellen Sie eine neue Organisation
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
