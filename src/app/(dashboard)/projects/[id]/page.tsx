"use client";

import { notFound, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { Card } from "@/components/ui/card";
import { use } from "react";
import { useState } from "react";
import { toast } from "sonner";
import { getFormFields, defaultValues as projectDefaultValues, updateProjectSchema } from "@/server/controllers/projects/form-config";
import { detailSchema } from "@/server/controllers/projects/detail-config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { DataTable } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColumnDef } from "@tanstack/react-table";
import { detailSchema as tenderDetailSchema } from "@/server/controllers/tender/detail-config";

// Import organization project activities related modules
import { organisationProjectActivityColumns } from "@/server/controllers/organisations/organisationProjectActivities/table-config";
import { getFormFields as getOrgProjectActivityFormFields, defaultValues as orgProjectActivityDefaultValues, createSchema as createOrgProjectActivitySchema } from "@/server/controllers/organisations/organisationProjectActivities/form-config";
import { detailSchema as orgProjectActivityDetailSchema } from "@/server/controllers/organisations/organisationProjectActivities/detail-config";

// Import employee project activities related modules
import { employeeProjectActivitiesColumns } from "@/server/controllers/profiles/employeeProjectActivities/table-config";
import { getFormFields as getEmployeeProjectActivityFormFields, defaultValues as employeeProjectActivityDefaultValues, createSchema as createEmployeeProjectActivitySchema } from "@/server/controllers/profiles/employeeProjectActivities/form-config";
import { detailSchema as employeeProjectActivityDetailSchema } from "@/server/controllers/profiles/employeeProjectActivities/detail-config";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

type UpdateProjectData = z.infer<typeof updateProjectSchema>;

interface ApiOrganisationProjectActivity {
	id: string;
	organisation: {
		id: string;
		name: string;
		organisationContactsIDs: string[];
		projectIDs: string[];
	} | null;
	project: {
		id: string;
		title: string | null;
	} | null;
	role: string | null;
	description: string | null;
}

interface ApiEmployeeProjectActivity {
	id: string;
	employee: {
		id: string;
		foreName: string;
		lastName: string;
		description: string | null;
	};
	project: {
		id: string;
		title: string;
	};
	employeeRole: {
		id: string;
		employeeRoleShort: string;
	} | null;
	description: string;
	operationalPeriodStart: string;
	operationalPeriodEnd: string;
	operationalDays: number;
}

interface OrganisationProjectActivity {
	id: string;
	organisation: { name: string } | null;
	project: { title: string } | null;
	role: string | null;
	description: string | null;
}

type EmployeeProjectActivityRow = {
	id: string;
	employee: {
		id: string;
		foreName: string;
		lastName: string;
	};
	project: {
		id: string;
		title: string;
	};
	employeeRole: {
		id: string;
		employeeRoleShort: string;
	} | null;
	description: string;
	operationalPeriodStart: Date;
	operationalPeriodEnd: Date;
	operationalDays: number;
};

const transformOrgProjectActivity = (data: ApiOrganisationProjectActivity): OrganisationProjectActivity => ({
	id: data.id,
	organisation: data.organisation ? { name: data.organisation.name } : null,
	project: data.project && data.project.title ? { title: data.project.title } : null,
	role: data.role,
	description: data.description,
});

const transformEmployeeProjectActivity = (data: ApiEmployeeProjectActivity): EmployeeProjectActivityRow => ({
	id: data.id,
	employee: {
		id: data.employee.id,
		foreName: data.employee.foreName,
		lastName: data.employee.lastName,
	},
	project: {
		id: data.project.id,
		title: data.project.title,
	},
	employeeRole: data.employeeRole,
	description: data.description,
	operationalPeriodStart: new Date(data.operationalPeriodStart),
	operationalPeriodEnd: new Date(data.operationalPeriodEnd),
	operationalDays: data.operationalDays,
});

const Page = ({ params }: PageProps) => {
	const { id } = use(params);
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const [isEditing, setIsEditing] = useState(false);

	// Organization project activity states
	const [addingOrgProjectActivity, setAddingOrgProjectActivity] = useState(false);
	const [selectedOrgProjectActivityId, setSelectedOrgProjectActivityId] = useState<string | null>(null);
	const [isOrgProjectActivityEditing, setIsOrgProjectActivityEditing] = useState(false);

	// Employee project activity states
	const [addingEmployeeProjectActivity, setAddingEmployeeProjectActivity] = useState(false);
	const [selectedEmployeeProjectActivityId, setSelectedEmployeeProjectActivityId] = useState<string | null>(null);
	const [isEmployeeProjectActivityEditing, setIsEmployeeProjectActivityEditing] = useState(false);

	const utils = api.useUtils();
	const { data: project, isLoading } = api.projects.getById.useQuery({ id });
	const { data: apiOrgProjectActivities, refetch: refetchOrgProjectActivities } = api.organisationProjectActivities.getAll.useQuery();
	const { data: apiEmployeeProjectActivities, refetch: refetchEmployeeProjectActivities } = api.employeeProjectActivities.getAll.useQuery({
		projectId: id,
	});

	const transformedOrgProjectActivities = (apiOrgProjectActivities || []).map(transformOrgProjectActivity);
	const transformedEmployeeProjectActivities = (apiEmployeeProjectActivities || []).map((activity) => transformEmployeeProjectActivity({
		...activity,
		operationalPeriodStart: activity.operationalPeriodStart.toString(),
		operationalPeriodEnd: activity.operationalPeriodEnd.toString(),
	} as ApiEmployeeProjectActivity));

	const updateProject = api.projects.update.useMutation({
		onSuccess: async () => {
			toast.success("Projekt erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsEditing(false);
			await utils.projects.getById.invalidate({ id });
			await utils.projects.getById.refetch({ id });
		},
		onError: (error) => {
			console.error("Update error:", error);
			toast.error("Fehler beim Aktualisieren des Projekts: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Organization project activity mutations
	const createOrgProjectActivity = api.organisationProjectActivities.create.useMutation({
		onSuccess: async () => {
			toast.success("Organisationsaktivität erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingOrgProjectActivity(false);
			await refetchOrgProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Organisationsaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateOrgProjectActivity = api.organisationProjectActivities.update.useMutation({
		onSuccess: async () => {
			toast.success("Organisationsaktivität erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsOrgProjectActivityEditing(false);
			await refetchOrgProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Organisationsaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Employee project activity mutations
	const createEmployeeProjectActivity = api.employeeProjectActivities.create.useMutation({
		onSuccess: async () => {
			toast.success("Mitarbeiteraktivität erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingEmployeeProjectActivity(false);
			await refetchEmployeeProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Mitarbeiteraktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateEmployeeProjectActivity = api.employeeProjectActivities.update.useMutation({
		onSuccess: async () => {
			toast.success("Mitarbeiteraktivität erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsEmployeeProjectActivityEditing(false);
			await refetchEmployeeProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Mitarbeiteraktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!project) {
		return notFound();
	}

	const handleSubmit = async (formData: unknown) => {
		try {
			const data = formData as UpdateProjectData;
			const cleanedData = Object.fromEntries(
				Object.entries(data).filter(([, value]) => value !== undefined)
			);

			await updateProject.mutateAsync({
				id,
				...cleanedData,
			});
		} catch (error) {
			console.error("Error updating project:", error);
		}
	};

	const handleTabChange = (value: string) => {
		router.push(`/projects/${id}?tab=${value}`);
	};

	// Organization project activity handlers
	const handleAddOrgProjectActivity = async (formData: unknown) => {
		try {
			const data = formData as z.infer<typeof createOrgProjectActivitySchema>;
			await createOrgProjectActivity.mutateAsync({
				organisationIDs: data.organisationIDs,
				projectIDs: id,
				role: data.role,
				description: data.description,
			});
		} catch (error) {
			console.error("Error adding organization project activity:", error);
		}
	};

	const handleOrgProjectActivityModalOpen = (id: string | number) => {
		setSelectedOrgProjectActivityId(id.toString());
	};

	const handleOrgProjectActivityModalClose = () => {
		setSelectedOrgProjectActivityId(null);
		setIsOrgProjectActivityEditing(false);
	};

	const handleUpdateOrgProjectActivity = async (data: z.infer<typeof createOrgProjectActivitySchema>) => {
		if (!selectedOrgProjectActivityId) return;
		await updateOrgProjectActivity.mutateAsync({
			id: selectedOrgProjectActivityId,
			organisationIDs: data.organisationIDs,
			projectIDs: id,
			role: data.role,
			description: data.description,
		});
	};

	// Employee project activity handlers
	const handleAddEmployeeProjectActivity = async (formData: unknown) => {
		try {
			const data = formData as z.infer<typeof createEmployeeProjectActivitySchema>;
			await createEmployeeProjectActivity.mutateAsync({
				data: {
					employeeIDs: data.employeeIDs,
					projectIDs: id,
					employeeRoleID: data.employeeRoleID,
					description: data.description,
					operationalPeriodStart: data.operationalPeriodStart,
					operationalPeriodEnd: data.operationalPeriodEnd,
					operationalDays: data.operationalDays,
				},
			});
		} catch (error) {
			console.error("Error adding employee project activity:", error);
		}
	};

	const handleEmployeeProjectActivityModalOpen = (id: string | number) => {
		setSelectedEmployeeProjectActivityId(id.toString());
	};

	const handleEmployeeProjectActivityModalClose = () => {
		setSelectedEmployeeProjectActivityId(null);
		setIsEmployeeProjectActivityEditing(false);
	};

	const handleUpdateEmployeeProjectActivity = async (formData: unknown) => {
		if (!selectedEmployeeProjectActivityId) return;
		const data = formData as z.infer<typeof createEmployeeProjectActivitySchema>;
		await updateEmployeeProjectActivity.mutateAsync({
			id: selectedEmployeeProjectActivityId,
			data: {
				employeeIDs: data.employeeIDs,
				projectIDs: id,
				employeeRoleID: data.employeeRoleID,
				description: data.description,
				operationalPeriodStart: data.operationalPeriodStart,
				operationalPeriodEnd: data.operationalPeriodEnd,
				operationalDays: data.operationalDays,
			},
		});
	};

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold tracking-tight">
						{project.title}
					</h1>
				</div>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="overview">Übersicht</TabsTrigger>
						<TabsTrigger value="organisations">Organisationen</TabsTrigger>
						<TabsTrigger value="employees">Projektmitarbeiter</TabsTrigger>
						<TabsTrigger value="tender">Ausschreibung</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<Card className="border-none shadow-none">
							{isEditing ? (
								<DynamicForm
									schema={{
										fields: getFormFields(),
										onSubmit: handleSubmit,
									}}
									defaultValues={{
										...projectDefaultValues,
										...project,
									}}
								/>
							) : (
								<DetailView 
									schema={detailSchema}
									data={project}
									onEdit={() => setIsEditing(true)}
									className=""
								/>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="organisations">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Organisationen</h2>
									<Button
										onClick={() => setAddingOrgProjectActivity((v) => !v)}
									>
										{addingOrgProjectActivity ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingOrgProjectActivity && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getOrgProjectActivityFormFields({ includeOrganisation: true, projectId: id }),
												onSubmit: handleAddOrgProjectActivity,
											}}
											defaultValues={{
												...orgProjectActivityDefaultValues,
												projectIDs: id,
												projectTitle: project?.title || "",
											}}
										/>
									</Card>
								)}
								<DataTable<OrganisationProjectActivity>
									data={transformedOrgProjectActivities}
									columns={organisationProjectActivityColumns(handleOrgProjectActivityModalOpen, "modal") as ColumnDef<OrganisationProjectActivity>[]}
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="employees">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Projektmitarbeiter</h2>
									<Button
										onClick={() => setAddingEmployeeProjectActivity((v) => !v)}
									>
										{addingEmployeeProjectActivity ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingEmployeeProjectActivity && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getEmployeeProjectActivityFormFields({ includeEmployee: true, projectId: id }),
												onSubmit: handleAddEmployeeProjectActivity,
											}}
											defaultValues={{
												...employeeProjectActivityDefaultValues,
												projectIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable<EmployeeProjectActivityRow>
									data={transformedEmployeeProjectActivities}
									columns={employeeProjectActivitiesColumns(handleEmployeeProjectActivityModalOpen, "modal") as ColumnDef<EmployeeProjectActivityRow>[]}
									hideCreateButton={true}
									viewMode="modal"
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="tender">
						<Card className="border-none shadow-none">
							{project.callToTender ? (
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<h2 className="text-xl font-semibold">Zugehörige Ausschreibung</h2>
										<Button
											variant="outline"
											onClick={() => {
												if (project.callToTender?.id) {
													router.push(`/tenders/${project.callToTender.id}`);
												}
											}}
										>
											Zur Ausschreibung
										</Button>
									</div>
									<DetailView
										schema={tenderDetailSchema}
										data={project.callToTender}
										className="py-4"
									/>
								</div>
							) : (
								<p>Keine Ausschreibung zugeordnet.</p>
							)}
						</Card>
					</TabsContent>
				</Tabs>

				{/* Organization Project Activity Modal */}
				{selectedOrgProjectActivityId && (
					<Dialog open={!!selectedOrgProjectActivityId} onOpenChange={handleOrgProjectActivityModalClose}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{isOrgProjectActivityEditing ? "Organisationsaktivität bearbeiten" : "Organisationsaktivität Details"}
								</DialogTitle>
							</DialogHeader>
							{isOrgProjectActivityEditing ? (
								<DynamicForm
									schema={{
										fields: getOrgProjectActivityFormFields({ includeOrganisation: true, projectId: id }),
										onSubmit: async (data: unknown) => {
											await handleUpdateOrgProjectActivity(data as { projectIDs: string; organisationIDs: string; role: string; description?: string });
										},
									}}
									defaultValues={
										transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId)
											? {
													organisationIDs: transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId)?.organisation?.name || "",
													projectIDs: id,
													role: transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId)?.role || "",
													description: transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId)?.description || "",
											  }
											: orgProjectActivityDefaultValues
									}
								/>
							) : (
								<DetailView
									schema={orgProjectActivityDetailSchema}
									data={{
										...transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId),
										organisationIDs: transformedOrgProjectActivities.find((d) => d.id === selectedOrgProjectActivityId)?.organisation?.name || "",
										projectIDs: project?.title || "",
									}}
									onEdit={() => setIsOrgProjectActivityEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Employee Project Activity Modal */}
				{selectedEmployeeProjectActivityId && (
					<Dialog open={!!selectedEmployeeProjectActivityId} onOpenChange={handleEmployeeProjectActivityModalClose}>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>
									{isEmployeeProjectActivityEditing ? "Mitarbeiteraktivität bearbeiten" : "Mitarbeiteraktivität Details"}
								</DialogTitle>
							</DialogHeader>
							{isEmployeeProjectActivityEditing ? (
								<DynamicForm
									schema={{
										fields: getEmployeeProjectActivityFormFields({ includeEmployee: true, projectId: id }),
										onSubmit: handleUpdateEmployeeProjectActivity,
									}}
									defaultValues={(() => {
										const activity = transformedEmployeeProjectActivities.find(
											(d) => d.id === selectedEmployeeProjectActivityId
										);
										if (!activity) return {};
										
										return {
											employeeIDs: activity.employee?.id || "",
											projectIDs: id,
											projectTitle: project?.title || "",
											employeeRoleID: activity.employeeRole?.id || "",
											description: activity.description || "",
											operationalPeriodStart: activity.operationalPeriodStart,
											operationalPeriodEnd: activity.operationalPeriodEnd,
											operationalDays: activity.operationalDays || 0,
										};
									})()}
								/>
							) : (
								<DetailView
									schema={employeeProjectActivityDetailSchema}
									data={{
										...(() => {
											const activity = transformedEmployeeProjectActivities.find(
												(d) => d.id === selectedEmployeeProjectActivityId
											);
											if (!activity) return {};
											
											return {
												id: activity.id,
												employeeName: activity.employee ? 
													`${activity.employee.foreName} ${activity.employee.lastName}` : "",
												employeeID: activity.employee?.id || "",
												projectTitle: activity.project?.title || "",
												projectID: activity.project?.id || "",
												employeeRole: activity.employeeRole?.employeeRoleShort || "",
												employeeRoleID: activity.employeeRole?.id || "",
												description: activity.description || "",
												operationalPeriodStart: activity.operationalPeriodStart,
												operationalPeriodEnd: activity.operationalPeriodEnd,
												operationalDays: activity.operationalDays,
											};
										})()
									}}
									onEdit={() => setIsEmployeeProjectActivityEditing(true)}
									className="py-4"
								/>
							)}
						</DialogContent>
					</Dialog>
				)}
			</div>
		</div>
	);
};

export default Page;
