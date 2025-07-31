"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { getFormFields, defaultValues, updateContactSchema } from "@/server/controllers/organisations/organisationContacts/form-config";
import { detailSchema } from "@/server/controllers/organisations/organisationContacts/detail-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { detailSchema as organisationDetailSchema } from "@/server/controllers/organisations/detail-config";
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from "@/components/ui/command";
import { projectColumns, TransformedProject } from "@/server/controllers/projects/table-config";
import { organisationTenderColumns, OrganisationTenderRow } from "@/server/controllers/organisations/organisationTender/table-config";
import { DataTable } from "@/components/table/table";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

type ContactFormData = z.infer<typeof updateContactSchema>;

const Page = ({ params }: PageProps) => {
	const { id } = use(params);
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const [isEditing, setIsEditing] = useState(false);

	const utils = api.useUtils();
	const { data: contact, isLoading } = api.organisationContacts.getById.useQuery({ id });
	const { data: organisation } = api.organisations.getById.useQuery(
		contact?.organisation?.[0]?.id ? { id: contact.organisation[0].id } : { id: "" },
		{ enabled: !!contact?.organisation?.[0]?.id }
	);
	const { data: allOrganisations } = api.organisations.all.useQuery();
	const { data: contactTenders } = api.organisationTender.getByContactId.useQuery(
		{ contactId: id },
		{ enabled: !!id }
	);

	const updateContact = api.organisationContacts.update.useMutation({
		onSuccess: async () => {
			toast.success("Kontakt erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsEditing(false);
			await utils.organisationContacts.getById.invalidate({ id });
			await utils.organisationContacts.getById.refetch({ id });
		},
		onError: (error) => {
			console.error("Update error:", error);
			toast.error("Fehler beim Aktualisieren des Kontakts: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const handleTabChange = (value: string) => {
		router.push(`/organisations/contacts/${id}?tab=${value}`);
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!contact) {
		return notFound();
	}

	const handleSubmit = async (formData: ContactFormData) => {
		try {
			const cleanUpdateData: ContactFormData = {
				foreName: formData.foreName,
				lastName: formData.lastName,
				position: formData.position,
				department: formData.department,
				email: formData.email,
				mobile: formData.mobile,
				telephone: formData.telephone,
				organisationIDs: formData.organisationIDs,
				salutationIDs: formData.salutationIDs,
			};

			await updateContact.mutateAsync({
				id,
				data: cleanUpdateData,
			});
		} catch (error) {
			console.error("Error updating contact:", error);
		}
	};

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold tracking-tight">
						{contact.foreName} {contact.lastName}
					</h1>
				</div>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Übersicht</TabsTrigger>
						<TabsTrigger value="organisation">Organisation</TabsTrigger>
						<TabsTrigger value="tender">Ausschreibungen</TabsTrigger>
						<TabsTrigger value="projects">Projekte</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<Card className="border-none shadow-none">
							{isEditing ? (
								<DynamicForm
									schema={{
										fields: getFormFields(),
										onSubmit: (data: unknown) => handleSubmit(data as ContactFormData),
									}}
									defaultValues={{
										...defaultValues,
										...contact,
									}}
								/>
							) : (
								<DetailView 
									schema={detailSchema}
									data={contact} 
									onEdit={() => setIsEditing(true)}
									className="py-4"
								/>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="organisation">
						<Card className="border-none shadow-none">
							{organisation ? (
								<DetailView
									schema={organisationDetailSchema}
									data={organisation}
								/>
							) : (
								<div>
									<p>Keine Organisation zugeordnet.</p>
									<Command>
										<CommandInput placeholder="Organisation suchen..." />
										<CommandList>
											<CommandEmpty>Keine Organisation gefunden.</CommandEmpty>
											<CommandGroup>
												{(allOrganisations || []).map((org) => (
													<CommandItem
														key={org.id}
														value={org.name}
														onSelect={async () => {
															await updateContact.mutateAsync({
																id,
																data: {
																	foreName: contact.foreName ?? "",
																	lastName: contact.lastName ?? "",
																	position: contact.position ?? undefined,
																	department: contact.department ?? undefined,
																	email: contact.email ?? undefined,
																	mobile: contact.mobile ?? undefined,
																	telephone: contact.telephone ?? undefined,
																	organisationIDs: org.id,
																	salutationIDs: (contact.salutationIDs ?? []).filter(Boolean)[0],
																},
															});
															toast.success("Organisation zugewiesen", { position: "top-right", duration: 3000 });
															await utils.organisationContacts.getById.invalidate({ id });
															await utils.organisationContacts.getById.refetch({ id });
														}}
													>
														{org.name}
													</CommandItem>
												))}
											</CommandGroup>
										</CommandList>
									</Command>
								</div>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="tender">
						<Card className="border-none shadow-none">
							{contactTenders && contactTenders.length > 0 ? (
								<DataTable<OrganisationTenderRow>
									data={contactTenders as OrganisationTenderRow[]}
									columns={organisationTenderColumns(undefined, "modal")}
									tabValue="tender"
									viewMode="modal"
								/>
							) : (
								<p>Keine Ausschreibungen zugeordnet.</p>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="projects">
						<Card className="border-none shadow-none">
							{contact.projectContacts && contact.projectContacts.length > 0 ? (
								<DataTable<TransformedProject>
									data={contact.projectContacts as TransformedProject[]}
									columns={projectColumns}
									tabValue="projects"
									viewMode="modal"
								/>
							) : (
								<div>Keine Projekte zugeordnet.</div>
							)}
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default Page;
