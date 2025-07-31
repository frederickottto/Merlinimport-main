"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { 
	getFormFields, 
	defaultValues as organisationDefaultValues, 
	updateSchema 
} from "@/server/controllers/organisations/form-config";
import { detailSchema } from "@/server/controllers/organisations/detail-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { getFormFields as getContactFormFields, defaultValues as contactDefaultValues, updateContactSchema } from "@/server/controllers/organisations/organisationContacts/form-config";
import { organisationContactColumns } from "@/server/controllers/organisations/organisationContacts/table-config";
import { DataTable } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { organisationCertificateColumns } from "@/server/controllers/organisations/organisationCertificates/table-config";
import { getFormFields as getCertificateFormFields, defaultValues as certificateDefaultValues, createSchema as createCertificateSchema } from "@/server/controllers/organisations/organisationCertificates/form-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { detailSchema as organisationCertificateDetailSchema } from "@/server/controllers/organisations/organisationCertificates/detail-config";
import { organisationTenderColumns } from "@/server/controllers/organisations/organisationTender/table-config";
import type { OrganisationTenderRow } from "@/server/controllers/organisations/organisationTender/table-config";
import { getFormFields as getTenderFormFields, defaultValues as tenderDefaultValues, createSchema as createTenderSchema } from "@/server/controllers/organisations/organisationTender/form-config";
import { detailSchema as organisationTenderDetailSchema } from "@/server/controllers/organisations/organisationTender/detail-config";
import { organisationProjectActivityColumns } from "@/server/controllers/organisations/organisationProjectActivities/table-config";
import { getFormFields as getProjectActivityFormFields, defaultValues as projectActivityDefaultValues, createSchema as createProjectActivitySchema } from "@/server/controllers/organisations/organisationProjectActivities/form-config";
import { detailSchema as organisationProjectActivityDetailSchema } from "@/server/controllers/organisations/organisationProjectActivities/detail-config";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

type UpdateOrganisationData = z.infer<typeof updateSchema>;

function createTypedSubmitHandler<T>(handler: (data: T) => Promise<void>) {
	return (data: unknown) => handler(data as T);
}

const Page = ({ params }: PageProps) => {
	const { id } = use(params);
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const [isEditing, setIsEditing] = useState(false);
	const [addingContact, setAddingContact] = useState(false);
	const [addingCertificate, setAddingCertificate] = useState(false);
	const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
	const [isCertificateEditing, setIsCertificateEditing] = useState(false);
	const [addingTender, setAddingTender] = useState(false);
	const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
	const [isTenderEditing, setIsTenderEditing] = useState(false);
	const [addingProjectActivity, setAddingProjectActivity] = useState(false);
	const [selectedProjectActivityId, setSelectedProjectActivityId] = useState<string | null>(null);
	const [isProjectActivityEditing, setIsProjectActivityEditing] = useState(false);

	const utils = api.useUtils();
	const { data: organisation, isLoading } = api.organisations.getById.useQuery({ id });
	const { data: contacts, refetch: refetchContacts } = api.organisationContacts.getByOrganisationId.useQuery({ organisationId: id });
	const { data: organisationCertificates, refetch: refetchOrganisationCertificates } = api.organisationCertificates.getAll.useQuery();
	const { data: organisationTenders } = api.organisationTender.getAll.useQuery();
	const { data: organisationProjectActivities, refetch: refetchOrganisationProjectActivities } = api.organisationProjectActivities.getAll.useQuery();
	
	const updateOrganisation = api.organisations.update.useMutation({
		onSuccess: async () => {
			toast.success("Organisation erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsEditing(false);
			await utils.organisations.getById.invalidate({ id });
			await utils.organisations.getById.refetch({ id });
		},
		onError: (error) => {
			console.error("Update error:", error);
			toast.error("Fehler beim Aktualisieren der Organisation: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const createContact = api.organisationContacts.create.useMutation({
		onSuccess: async () => {
			toast.success("Kontakt erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingContact(false);
			await refetchContacts();
		},
		onError: (error) => {
			console.error("Create contact error:", error);
			toast.error("Fehler beim Hinzufügen des Kontakts: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const createOrganisationCertificate = api.organisationCertificates.create.useMutation({
		onSuccess: async () => {
			toast.success("Zertifikat erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingCertificate(false);
			await refetchOrganisationCertificates();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen des Zertifikats: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateOrganisationCertificate = api.organisationCertificates.update.useMutation({
		onSuccess: async () => {
			toast.success("Zertifikat erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsCertificateEditing(false);
			await refetchOrganisationCertificates();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren des Zertifikats: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const createOrganisationTender = api.organisationTender.create.useMutation({
		onSuccess: async () => {
			toast.success("Ausschreibungsorganisation erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingTender(false);
			await utils.organisationTender.getAll.invalidate();
			await utils.organisationTender.getAll.refetch();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Ausschreibungsorganisation: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateOrganisationTender = api.organisationTender.update.useMutation({
		onSuccess: async () => {
			toast.success("Ausschreibungsorganisation erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsTenderEditing(false);
			await utils.organisationTender.getAll.invalidate();
			await utils.organisationTender.getAll.refetch();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Ausschreibungsorganisation: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const createOrganisationProjectActivity = api.organisationProjectActivities.create.useMutation({
		onSuccess: async () => {
			toast.success("Projektaktivität erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingProjectActivity(false);
			await refetchOrganisationProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateOrganisationProjectActivity = api.organisationProjectActivities.update.useMutation({
		onSuccess: async () => {
			toast.success("Projektaktivität erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsProjectActivityEditing(false);
			await refetchOrganisationProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!organisation) {
		return notFound();
	}

	// Specify types for org and s
	type OrganisationForForm = typeof organisation;
	const transformOrganisationForForm = (org: OrganisationForForm) => ({
		...org,
		location: org.location?.id || null,
		industrySector: Array.isArray(org.industrySector)
			? org.industrySector.map((s: { id: string }) => s.id)
			: [],
		parentOrganisation: org.parentOrganisation?.id || null,
	});

	// Map industrySector to have a 'name' property for DetailView
	const detailViewData = {
		...organisation,
		industrySector: Array.isArray(organisation?.industrySector)
			? organisation.industrySector.map((s: { id: string; industrySector?: string; name?: string }) => ({
				...s,
				name: s.industrySector || s.name,
			}))
			: [],
	};

	const handleSubmit = async (formData: UpdateOrganisationData) => {
		try {
			// Remove any undefined values to avoid type issues
			const cleanUpdateData = Object.fromEntries(
				Object.entries(formData).filter(([, value]) => value !== undefined)
			) as UpdateOrganisationData;

			await updateOrganisation.mutateAsync({
				id,
				data: cleanUpdateData,
			});
		} catch (error) {
			console.error("Error updating organisation:", error);
		}
	};

	const handleTabChange = (value: string) => {
		router.push(`/organisations/${id}?tab=${value}`);
	};

	const handleAddContact = async (formData: z.infer<typeof updateContactSchema>) => {
		try {
			const data = {
				...formData,
				organisationIDs: id,
			};
			await createContact.mutateAsync(data);
		} catch (error) {
			console.error("Error creating contact:", error);
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
					position: "top-right",
					duration: 3000,
				});
			} else {
				toast.error("Fehler beim Erstellen des Kontakts", {
					position: "top-right",
					duration: 3000,
				});
			}
		}
	};

	const handleAddCertificate = async (formData: z.infer<typeof createCertificateSchema>) => {
		try {
			const validated = createCertificateSchema.parse({ ...formData, organisationIDs: id });
			await createOrganisationCertificate.mutateAsync(validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
					position: "top-right",
					duration: 3000,
				});
			}
		}
	};

	const handleCertificateModalOpen = (id: string | number) => {
		setSelectedCertificateId(String(id));
	};
	const handleCertificateModalClose = () => {
		setSelectedCertificateId(null);
		setIsCertificateEditing(false);
	};

	const selectedCertificate = organisationCertificates?.find(
		(c) => c.id === selectedCertificateId
	);

	const handleAddTender = async (formData: z.infer<typeof createTenderSchema>) => {
		try {
			const validated = createTenderSchema.parse({ ...formData, organisationIDs: id });
			await createOrganisationTender.mutateAsync(validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
					position: "top-right",
					duration: 3000,
				});
			}
		}
	};

	const handleTenderModalOpen = (id: string | number) => {
		setSelectedTenderId(String(id));
	};
	const handleTenderModalClose = () => {
		setSelectedTenderId(null);
		setIsTenderEditing(false);
	};
	const selectedTender = organisationTenders?.find((t) => t.id === selectedTenderId);

	const handleAddProjectActivity = async (formData: z.infer<typeof createProjectActivitySchema>) => {
		try {
			const validated = createProjectActivitySchema.parse({
				...formData,
				organisationIDs: id,
				projectIDs: formData.projectIDs,
			});
			await createOrganisationProjectActivity.mutateAsync(validated);
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error("Validierungsfehler: " + error.errors.map(e => e.message).join(", "), {
					position: "top-right",
					duration: 3000,
				});
			}
		}
	};

	const handleProjectActivityModalOpen = (id: string | number) => {
		setSelectedProjectActivityId(String(id));
	};

	const handleProjectActivityModalClose = () => {
		setSelectedProjectActivityId(null);
		setIsProjectActivityEditing(false);
	};

	const selectedProjectActivity = organisationProjectActivities?.find((a) => a.id === selectedProjectActivityId);

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold tracking-tight">
						{organisation.name}
					</h1>
				</div>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="overview">Übersicht</TabsTrigger>
						<TabsTrigger value="contact">Mitarbeiter</TabsTrigger>
						<TabsTrigger value="tender">Ausschreibungen</TabsTrigger>
						<TabsTrigger value="projects">Projekte</TabsTrigger>
						<TabsTrigger value="certificates">Zertifikate</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<Card className="border-none shadow-none">
							{isEditing ? (
								<DynamicForm
									schema={{
										fields: getFormFields("overview"),
										onSubmit: createTypedSubmitHandler<UpdateOrganisationData>(handleSubmit),
									}}
									defaultValues={{
										...organisationDefaultValues,
										...transformOrganisationForForm(organisation),
									}}
								/>
							) : (
								<DetailView 
									schema={detailSchema}
									data={detailViewData}
									onEdit={() => setIsEditing(true)}
									className="py-4"
								/>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="contact">
						<Card className="border-none shadow-none">
							{isEditing ? (
								<DynamicForm
									schema={{
										fields: getFormFields("contact"),
										onSubmit: createTypedSubmitHandler<UpdateOrganisationData>(handleSubmit),
									}}
									defaultValues={{
										...organisationDefaultValues,
										...transformOrganisationForForm(organisation),
									}}
								/>
							) : (
								<div className="space-y-6">
									<div className="flex items-center justify-between mb-4">
										<h2 className="text-xl font-semibold">Kontakte</h2>
										<Button
											className="btn btn-primary"
											onClick={() => setAddingContact((v) => !v)}
										>
											{addingContact ? "Abbrechen" : "Hinzufügen"}
										</Button>
									</div>
									{addingContact && (
										<Card className="mb-6 p-4">
											<DynamicForm
												schema={{
													fields: getContactFormFields(),
													onSubmit: createTypedSubmitHandler<z.infer<typeof updateContactSchema>>(handleAddContact),
												}}
												defaultValues={{
													...contactDefaultValues,
													organisationIDs: [id],
												}}
											/>
										</Card>
									)}
									<DataTable
										data={contacts || []}
										columns={organisationContactColumns}
										viewMode="modal"
										hideCreateButton={true}
									/>
								</div>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="tender">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Ausschreibungen</h2>
									<Button
										className="btn btn-primary"
										onClick={() => setAddingTender((v) => !v)}
									>
										{addingTender ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingTender && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getTenderFormFields({ includeOrganisation: false }),
												onSubmit: createTypedSubmitHandler<z.infer<typeof createTenderSchema>>(handleAddTender),
											}}
											defaultValues={{
												...tenderDefaultValues,
												organisationIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable
									data={
										(organisationTenders?.filter((t) => t.organisation?.id === id).map(t => ({
											...t,
											callToTender: t.callToTender ? {
												...t.callToTender,
												shortDescription: t.callToTender.shortDescription || "",
												offerDeadline: t.callToTender.offerDeadline || null,
											} : null,
										})) as OrganisationTenderRow[]) || []
									}
									columns={organisationTenderColumns(handleTenderModalOpen, "modal")}
									viewMode="modal"
									onView={handleTenderModalOpen}
									hideCreateButton={true}
								/>
								<Dialog open={!!selectedTenderId} onOpenChange={handleTenderModalClose}>
									<DialogContent className="sm:max-w-[800px]">
										<DialogHeader>
											<DialogTitle>Ausschreibungsorganisation Details</DialogTitle>
										</DialogHeader>
										{selectedTender && (
											isTenderEditing ? (
												<DynamicForm
													schema={{
														fields: getTenderFormFields({ includeOrganisation: false }),
														onSubmit: createTypedSubmitHandler<z.infer<typeof createTenderSchema>>(async (formData) => {
															await updateOrganisationTender.mutateAsync({
																id: selectedTenderId!,
																callToTenderIDs: formData.callToTenderIDs,
																organisationRole: formData.organisationRole,
															});
															setIsTenderEditing(false);
															await utils.organisationTender.getAll.refetch();
														}),
													}}
													defaultValues={{
														callToTenderIDs: selectedTender.callToTender?.id || selectedTender.callToTenderIDs,
														organisationRole: selectedTender.organisationRoleID || "",
													}}
												/>
											) : (
												<DetailView
													schema={organisationTenderDetailSchema}
													data={{
														...selectedTender,
														organisationIDs: selectedTender?.organisation?.name || selectedTender?.organisationIDs,
														callToTenderIDs: selectedTender?.callToTender?.title || selectedTender?.callToTenderIDs,
													}}
													onEdit={() => setIsTenderEditing(true)}
													className="py-4"
												/>
											)
										)}
									</DialogContent>
								</Dialog>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="projects">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Projektaktivitäten</h2>
									<Button
										className="btn btn-primary"
										onClick={() => setAddingProjectActivity((v) => !v)}
									>
										{addingProjectActivity ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingProjectActivity && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getProjectActivityFormFields({ includeOrganisation: false }),
												onSubmit: createTypedSubmitHandler<z.infer<typeof createProjectActivitySchema>>(handleAddProjectActivity),
											}}
											defaultValues={{
												...projectActivityDefaultValues,
												organisationIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable
									data={organisationProjectActivities?.filter((a) => a.organisation?.id === id).map(activity => ({
										id: activity.id,
										organisation: activity.organisation ? { name: activity.organisation.name } : null,
										project: activity.project ? { title: activity.project.title || "" } : null,
										role: activity.role,
										description: activity.description
									})) || []}
									columns={organisationProjectActivityColumns(handleProjectActivityModalOpen, "modal")}
									viewMode="modal"
									onView={handleProjectActivityModalOpen}
									hideCreateButton={true}
								/>
								<Dialog open={!!selectedProjectActivityId} onOpenChange={handleProjectActivityModalClose}>
									<DialogContent className="sm:max-w-[800px]">
										<DialogHeader>
											<DialogTitle>Projektaktivität Details</DialogTitle>
										</DialogHeader>
										{selectedProjectActivity && (
											isProjectActivityEditing ? (
												<DynamicForm
													schema={{
														fields: getProjectActivityFormFields({ includeOrganisation: false }),
														onSubmit: createTypedSubmitHandler<z.infer<typeof createProjectActivitySchema>>(async (formData) => {
															await updateOrganisationProjectActivity.mutateAsync({
																id: selectedProjectActivityId!,
																organisationIDs: id,
																projectIDs: formData.projectIDs,
																role: formData.role,
																description: formData.description,
															});
															setIsProjectActivityEditing(false);
															await refetchOrganisationProjectActivities();
														}),
													}}
													defaultValues={{
														projectIDs: selectedProjectActivity.project?.id || "",
														role: selectedProjectActivity.role || "",
														description: selectedProjectActivity.description || "",
													}}
												/>
											) : (
												<DetailView
													schema={organisationProjectActivityDetailSchema}
													data={{
														...selectedProjectActivity,
														organisationIDs: selectedProjectActivity?.organisation?.name || "",
														projectIDs: selectedProjectActivity?.project?.title || "",
													}}
													onEdit={() => setIsProjectActivityEditing(true)}
													className="py-4"
												/>
											)
										)}
									</DialogContent>
								</Dialog>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="certificates">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Zertifikate</h2>
									<Button
										className="btn btn-primary"
										onClick={() => setAddingCertificate((v) => !v)}
									>
										{addingCertificate ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingCertificate && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getCertificateFormFields({ includeOrganisation: false }),
												onSubmit: createTypedSubmitHandler<z.infer<typeof createCertificateSchema>>(handleAddCertificate),
											}}
											defaultValues={{
												...certificateDefaultValues,
												organisationIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable
									data={organisationCertificates?.filter((c) => c.organisation?.id === id) || []}
									columns={organisationCertificateColumns(handleCertificateModalOpen, "modal")}
									viewMode="modal"
									onView={handleCertificateModalOpen}
									hideCreateButton={true}
								/>
								<Dialog open={!!selectedCertificateId} onOpenChange={handleCertificateModalClose}>
									<DialogContent className="sm:max-w-[800px]">
										<DialogHeader>
											<DialogTitle>Zertifikat Details</DialogTitle>
										</DialogHeader>
										{selectedCertificate && (
											isCertificateEditing ? (
												<DynamicForm
													schema={{
														fields: getCertificateFormFields({ includeOrganisation: false }),
														onSubmit: createTypedSubmitHandler<z.infer<typeof createCertificateSchema>>(async (formData) => {
															await updateOrganisationCertificate.mutateAsync({
																id: selectedCertificateId!,
																organisationIDs: selectedCertificate.organisation?.id || selectedCertificate.organisationIDs,
																certificateIDs: formData.certificateIDs,
																certificationObject: formData.certificationObject,
																validUntil: formData.validUntil,
															});
															setIsCertificateEditing(false);
															await refetchOrganisationCertificates();
														}),
													}}
													defaultValues={{
														certificateIDs: selectedCertificate.certificate?.id || selectedCertificate.certificateIDs,
														certificationObject: selectedCertificate.certificationObject || "",
														validUntil: selectedCertificate.validUntil || undefined,
													}}
												/>
											) : (
												<DetailView
													schema={organisationCertificateDetailSchema}
													data={{
														organisationIDs: selectedCertificate?.organisation?.name || selectedCertificate?.organisationIDs,
														certificateIDs: selectedCertificate?.certificate?.title || selectedCertificate?.certificateIDs,
														certificationObject: selectedCertificate?.certificationObject || "",
														validUntil: selectedCertificate?.validUntil || undefined
													}}
													onEdit={() => setIsCertificateEditing(true)}
													className="py-4"
												/>
											)
										)}
									</DialogContent>
								</Dialog>
							</div>
						</Card>
					</TabsContent>

					
				</Tabs>
			</div>
		</div>
	);
};

export default Page;
