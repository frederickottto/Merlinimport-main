"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues, updateContactSchema } from "@/server/controllers/organisations/organisationContacts/form-config";
import { z } from "zod";

type ContactFormData = z.infer<typeof updateContactSchema>;

const Page = () => {
	const router = useRouter();
	const utils = api.useUtils();

	const createContact = api.organisationContacts.create.useMutation({
		onSuccess: async () => {
			toast.success("Kontakt erfolgreich erstellt", {
				position: "top-right",
				duration: 3000,
			});
			await utils.organisationContacts.all.invalidate();
			router.push("/organisations/contacts");
		},
		onError: (error) => {
			console.error("Create error:", error);
			toast.error("Fehler beim Erstellen des Kontakts: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const handleSubmit = async (formData: ContactFormData) => {
		try {
			const validatedData = updateContactSchema.parse(formData);
			await createContact.mutateAsync(validatedData);
		} catch (error) {
			console.error("Error creating contact:", error);
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
					<h1 className="text-3xl font-bold tracking-tight">Neuer Kontakt</h1>
					<p className="text-muted-foreground mt-2">
						Erstellen Sie einen neuen Kontakt
					</p>
				</div>

				<Card className="border-none shadow-none">
					<DynamicForm
						schema={{
							fields: getFormFields(),
							onSubmit: (data: unknown) => handleSubmit(data as ContactFormData),
						}}
						defaultValues={defaultValues}
					/>
				</Card>
			</div>
		</div>
	);
};

export default Page;
