"use client";

import { DynamicForm } from "@/components/form/dynamic-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { getFormFields, defaultValues as profileDefaultValues, type FormProfileData } from "@/server/controllers/profiles/form-config";
import type { TRPCClientErrorLike } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

const Page = () => {
	const router = useRouter();
	const utils = api.useUtils();
	
	const createProfile = api.profiles.create.useMutation({
		onSuccess: async () => {
			toast.success("Profil erfolgreich erstellt", {
				position: "top-right",
				duration: 3000,
			});
			// Invalidate and refetch all relevant queries
			await Promise.all([
				utils.profiles.all.invalidate(),
			]);
			// Redirect to profiles list
			router.push("/profiles");
		},
		onError: (error: TRPCClientErrorLike<AppRouter>) => {
			console.error("Create error:", error);
			toast.error("Fehler beim Erstellen des Profils: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const handleSubmit = async (data: unknown) => {
		try {
			// Transform the form data for profile creation
			const formData = data as FormProfileData;
			const createData = {
				foreName: formData.foreName,
				lastName: formData.lastName,
				pseudonym: formData.pseudonym || undefined,
				employeerCompany: formData.employeerCompany || undefined,
				mobile: formData.mobile || undefined,
				telephone: formData.telephone || undefined,
				linkedInURL: formData.linkedInURL || undefined,
				xingURL: formData.xingURL || undefined,
				discoverURL: formData.discoverURL || undefined,
				experienceIt: formData.experienceIt,
				experienceIs: formData.experienceIs,
				experienceItGs: formData.experienceItGs,
				experienceGps: formData.experienceGps,
				experienceOther: formData.experienceOther,
				experienceAll: formData.experienceAll,
				description: formData.description || undefined,
			};

			console.log("Create profile data:", createData);
			await createProfile.mutateAsync(createData);
		} catch (error) {
			console.error("Error creating profile:", error);
		}
	};

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="mb-6">
					<h1 className="text-3xl font-bold tracking-tight">Neues Profil</h1>
					<p className="text-muted-foreground mt-2">
						Erstellen Sie ein neues Profil
					</p>
				</div>

				<Card className="border-none shadow-none">
					<DynamicForm
						schema={{
							fields: getFormFields(),
							onSubmit: handleSubmit,
						}}
						defaultValues={profileDefaultValues}
					/>
				</Card>
			</div>
		</div>
	);
};

export default Page;
