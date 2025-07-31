"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/table/table";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DetailView } from "@/components/detail/DetailView";
import type { DetailSchema } from "@/types/detail";
import { DynamicForm } from "@/components/form/dynamic-form";
import type { FormFieldSchema } from "@/types/form";
import { toast } from "sonner";
import { getFormFields as getCertificateFormFields } from "@/server/controllers/settings/certificate/form-config";
import { getFormFields as getEmployeeRankFormFields } from "@/server/controllers/settings/employeeRank/form-config";
import { getFormFields as getEmployeeRoleFormFields } from "@/server/controllers/settings/employeeRole/form-config";
import { getFormFields as getIndustrySectorFormFields } from "@/server/controllers/settings/industrySector/form-config";
import { formSchema as locationFormSchema } from "@/server/controllers/settings/location/form-config";
import { getFormFields as getOrganisationRoleFormFields } from "@/server/controllers/settings/organisationRole/form-config";
import { formSchema as salutationFormSchema } from "@/server/controllers/settings/salutation/form-config";
import { securityClearanceFormConfig } from "@/server/controllers/settings/securityClearance/form-config";
import { formSchema as skillsFormSchema } from "@/server/controllers/settings/skills/form-config";
import { api } from "@/trpc/react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import detail schemas
import { detailSchema as certificateSchema } from "@/server/controllers/settings/certificate/detail-config";
import { detailSchema as employeeRoleSchema } from "@/server/controllers/settings/employeeRole/detail-config";
import { detailSchema as employeeRankSchema } from "@/server/controllers/settings/employeeRank/detail-config";
import { detailSchema as industrySectorSchema } from "@/server/controllers/settings/industrySector/detail-config";
import { detailSchema as locationSchema } from "@/server/controllers/settings/location/detail-config";
import { detailSchema as salutationSchema } from "@/server/controllers/settings/salutation/detail-config";
import { detailSchema as organisationRoleSchema } from "@/server/controllers/settings/organisationRole/detail-config";
import { detailSchema as securityClearanceSchema } from "@/server/controllers/settings/securityClearance/detail-config";
import { detailSchema as skillsSchema } from "@/server/controllers/settings/skills/detail-config";
import { getOrganisationRoleColumns } from "@/server/controllers/settings/organisationRole/table-config";
import { getCertificateColumns } from "@/server/controllers/settings/certificate/table-config";
import { getEmployeeRankColumns } from "@/server/controllers/settings/employeeRank/table-config";
import { getEmployeeRoleColumns } from "@/server/controllers/settings/employeeRole/table-config";
import { getIndustrySectorColumns } from "@/server/controllers/settings/industrySector/table-config";
import { getLocationColumns } from "@/server/controllers/settings/location/table-config";
import { getSalutationColumns } from "@/server/controllers/settings/salutation/table-config";
import { getSecurityClearanceColumns } from "@/server/controllers/settings/securityClearance/table-config";
import { getSkillColumns } from "@/server/controllers/settings/skills/table-config";
import { detailSchema as divisionSchema } from "@/server/controllers/settings/division/detail-config";
import { getDivisionColumns } from "@/server/controllers/settings/division/table-config";
import { divisionFormConfig } from "@/server/controllers/settings/division/form-config";

const schemas: Record<string, DetailSchema> = {
	certificates: certificateSchema,
	employeeRoles: employeeRoleSchema,
	employeeRanks: employeeRankSchema,
	industrySectors: industrySectorSchema,
	locations: locationSchema,
	salutations: salutationSchema,
	organisationRoles: organisationRoleSchema,
	securityClearance: securityClearanceSchema,
	skills: skillsSchema,
	divisions: divisionSchema,
};

type FormData = {
	// Certificate
	certificateTitle?: string;
	description?: string;
	type?: string;
	category?: "Projektmanagement" | "Cloud" | "Security" | "Datenschutz" | "Architektur" | "Entwicklung" | "DevOps" | "Agile" | "Sonstiges";
	deeplink?: string;
	salesCertificate?: boolean;
	// Employee Rank
	employeePositionShort?: string;
	employeePositionLong?: string;
	employeeCostStraight?: number;
	// Employee Role
	role?: string;
	// Industry Sector
	industrySector?: string;
	industrySectorEY?: string;
	// Location
	street?: string;
	houseNumber?: string;
	postCode?: string;
	city?: string;
	region?: string;
	country?: string;
	// Salutation
	salutationShort?: string;
	salutationLong?: string;
	// Security Clearance
	employeeIDs?: string;
	approved?: boolean;
	securityClearanceType?: string;
	securityClearanceLevel?: string;
	applicationDate?: Date;
	// Skills
	skillTitle?: string;
	// Division
	divisionTitle?: string;
	abbreviation?: string;
	managedById?: string;
	parentDivisionId?: string;
};

type SelectedItem = {
	id: string;
	title?: string | null;
	abbreviation?: string | null;
	managedBy?: { id: string; foreName: string; lastName: string } | null;
	parentDivision?: { id: string; title: string } | null;
	employees?: Array<{ id: string; foreName: string; lastName: string }>;
	employee?: { id: string } | null;
	securityClearanceType?: string | null;
	securityClearanceLevel?: string | null;
	applicationDate?: Date | null;
	approved?: boolean | null;
	[key: string]: unknown;
} | null | undefined;

// Add these types after imports
type BaseTableData = {
	id: string;
	createdAt?: Date | null;
	updatedAt?: Date | null;
};

type SalutationData = BaseTableData & {
	salutationShort: string | null;
	salutationLong: string | null;
	employeeIDs: string[];
	organisationContactsIDs: string[];
};

type EmployeeRoleData = BaseTableData & {
	role: string | null;
	employeeProjectsEmployeeRoleID: string | null;
};

type EmployeeRankData = BaseTableData & {
	employeePositionShort: string;
	employeePositionLong: string;
	employeeCostStraight: number | null;
};

type SecurityClearanceData = BaseTableData & {
	employee: {
		id: string;
		description: string | null;
		foreName: string;
		lastName: string;
		[key: string]: unknown;
	};
	securityClearanceType: string | null;
	securityClearanceLevel: string | null;
	applicationDate: Date | null;
	approved: boolean | null;
	employeeIDs: string;
};

type SkillData = BaseTableData & {
	title: string | null;
	type: string | null;
	description: string | null;
	employeeSkills: Array<{
		id: string;
		createdAt: Date | null;
		updatedAt: Date | null;
		employeeIDs: string[];
		niveau: string | null;
		skillIDs: string;
	}>;
};

type CertificateData = BaseTableData & {
	title: string;
	type: string | null;
	description: string | null;
	category: string | null;
	deeplink: string | null;
	salesCertificate: boolean | null;
	conditionsOfParticipationIDs: string[];
};

type PitchModule = {
	id: string;
	title: string;
	description: string;
	createdAt?: Date;
	updatedAt?: Date;
};

type DivisionData = BaseTableData & {
	title: string;
	abbreviation: string | null;
	managedBy: {
		id: string;
		foreName: string;
		lastName: string;
	} | null;
	parentDivision: {
		id: string;
		title: string;
	} | null;
};

const pitchColumns: ColumnDef<PitchModule>[] = [
	{
		accessorKey: "title",
		header: "Titel",
	},
	{
		accessorKey: "description",
		header: "Beschreibung",
	},
	{
		accessorKey: "createdAt",
		header: "Erstellt am",
		cell: ({ row }) => {
			const date = row.getValue("createdAt") as Date | undefined;
			return date ? new Date(date).toLocaleDateString("de-DE") : "-";
		},
	},
	{
		accessorKey: "updatedAt",
		header: "Aktualisiert am",
		cell: ({ row }) => {
			const date = row.getValue("updatedAt") as Date | undefined;
			return date ? new Date(date).toLocaleDateString("de-DE") : "-";
		},
	},
	{
		id: "actions",
		cell: ({ row }) => {
			const pitchModule = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<span className="sr-only">Menü öffnen</span>
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={() => {
								// Handle edit action
								console.log("Edit pitch module:", pitchModule.id);
							}}
						>
							<Pencil className="mr-2 h-4 w-4" />
							Bearbeiten
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];

function SettingsContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "certificates";
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const utils = api.useUtils();
	
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

	const handleModalOpen = (id: string | number) => {
		setSelectedItemId(String(id));
	};

	// Add update mutations
	const updateCertificate = api.certificate.update.useMutation({
		onSuccess: async () => {
			toast.success("Zertifikat erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.certificate.getAll.invalidate();
			await utils.certificate.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateEmployeeRank = api.employeeRank.update.useMutation({
		onSuccess: async () => {
			toast.success("Position erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.employeeRank.getAll.invalidate();
			await utils.employeeRank.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateEmployeeRole = api.employeeRole.update.useMutation({
		onSuccess: async () => {
			toast.success("Mitarbeiterrolle erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.employeeRole.getAll.invalidate();
			await utils.employeeRole.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateIndustrySector = api.industrySector.update.useMutation({
		onSuccess: async () => {
			toast.success("Branche erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.industrySector.getAll.invalidate();
			await utils.industrySector.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateLocation = api.location.update.useMutation({
		onSuccess: async () => {
			toast.success("Standort erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.location.getAll.invalidate();
			await utils.location.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateOrganisationRole = api.organisationRole.update.useMutation({
		onSuccess: async () => {
			toast.success("Organisationsrolle erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.organisationRole.getAll.invalidate();
			await utils.organisationRole.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateSalutation = api.salutation.update.useMutation({
		onSuccess: async () => {
			toast.success("Anrede erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.salutation.getAll.invalidate();
			await utils.salutation.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateSecurityClearance = api.securityClearance.update.useMutation({
		onSuccess: async () => {
			toast.success("Sicherheitscheck erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.securityClearance.getAll.invalidate();
			await utils.securityClearance.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateSkills = api.skills.update.useMutation({
		onSuccess: async () => {
			toast.success("Fähigkeit erfolgreich aktualisiert");
			setIsEditing(false);
			await utils.skills.getAll.invalidate();
			await utils.skills.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren: " + error.message);
		},
	});

	const updateDivision = api.division.update.useMutation({
		onSuccess: async () => {
			toast.success("Division successfully updated");
			setIsEditing(false);
			await utils.division.getAll.invalidate();
			await utils.division.getById.invalidate({ id: selectedItemId! });
		},
		onError: (error) => {
			toast.error("Error updating: " + error.message);
		},
	});

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSubmit = async (data: unknown) => {
		const formData = data as FormData;
		try {
			switch (activeTab) {
				case "certificates":
					await updateCertificate.mutateAsync({
						id: selectedItemId!,
						data: {
							title: formData.certificateTitle,
							description: formData.description,
							type: formData.type,
							category: formData.category as "Projektmanagement" | "Cloud" | "Security" | "Datenschutz" | "Architektur" | "Entwicklung" | "DevOps" | "Agile" | "Sonstiges",
							deeplink: formData.deeplink,
							salesCertificate: formData.salesCertificate,
						},
					});
					break;
				case "employeeRanks":
					await updateEmployeeRank.mutateAsync({
						id: selectedItemId!,
						employeePositionShort: formData.employeePositionShort,
						employeePositionLong: formData.employeePositionLong,
						employeeCostStraight: formData.employeeCostStraight ? Number(formData.employeeCostStraight) : undefined,
					});
					break;
				case "employeeRoles":
					await updateEmployeeRole.mutateAsync({
						id: selectedItemId!,
						role: formData.role,
					});
					break;
				case "industrySectors":
					await updateIndustrySector.mutateAsync({
						id: selectedItemId!,
						industrySector: formData.industrySector,
						industrySectorEY: formData.industrySectorEY,
					});
					break;
				case "locations":
					await updateLocation.mutateAsync({
						id: selectedItemId!,
						street: formData.street,
						houseNumber: formData.houseNumber,
						postCode: formData.postCode,
						city: formData.city,
						region: formData.region,
						country: formData.country,
					});
					break;
				case "organisationRoles":
					await updateOrganisationRole.mutateAsync({
						id: selectedItemId!,
						role: formData.role || "",
					});
					break;
				case "salutations":
					await updateSalutation.mutateAsync({
						id: selectedItemId!,
						salutationShort: formData.salutationShort,
						salutationLong: formData.salutationLong,
					});
					break;
				case "securityClearance":
					await updateSecurityClearance.mutateAsync({
						id: selectedItemId!,
						employeeIDs: formData.employeeIDs,
						approved: formData.approved,
						securityClearanceType: formData.securityClearanceType,
						securityClearanceLevel: formData.securityClearanceLevel,
						applicationDate: formData.applicationDate ? new Date(formData.applicationDate) : undefined,
					});
					break;
				case "skills":
					await updateSkills.mutateAsync({
						id: selectedItemId!,
						title: formData.skillTitle,
						type: formData.type || undefined,
						description: formData.description || undefined,
					});
					break;
				case "pitch":
					// Handle pitch submission
					console.log("Pitch submission:", formData);
					break;
				case "divisions":
					await updateDivision.mutateAsync({
						id: selectedItemId!,
						title: formData.divisionTitle!,
						abbreviation: formData.abbreviation,
						managedById: formData.managedById,
						parentDivisionId: formData.parentDivisionId,
						employeeIDs: Array.isArray(formData.employeeIDs) ? formData.employeeIDs : [],
					});
					break;
				// Add other cases for different tabs here
			}
		} catch (error) {
			console.error("Error updating item:", error);
		}
	};

	const handleModalClose = () => {
		setSelectedItemId(null);
		setIsEditing(false);
	};

	const handleTabChange = (value: string) => {
		router.push(`/settings?tab=${value}`);
	};

	const { data: certificates } = api.certificate.getAll.useQuery();
	const { data: employeeRoles } = api.employeeRole.getAll.useQuery();
	const { data: employeeRanks } = api.employeeRank.getAll.useQuery();
	const { data: industrySectors } = api.industrySector.getAll.useQuery();
	const { data: locations } = api.location.getAll.useQuery();
	const { data: salutations } = api.salutation.getAll.useQuery();
	const { data: organisationRoles } = api.organisationRole.getAll.useQuery();
	const { data: securityClearances } = api.securityClearance.getAll.useQuery();
	const { data: skills } = api.skills.getAll.useQuery();
	const { data: pitchModules } = api.pitch.all.useQuery();
	const { data: divisions } = api.division.getAll.useQuery();

	// Fetch individual item data based on the selected ID and active tab
	const { data: selectedCertificate } = api.certificate.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "certificates" }
	);
	const { data: selectedEmployeeRole } = api.employeeRole.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "employeeRoles" }
	);
	const { data: selectedEmployeeRank } = api.employeeRank.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "employeeRanks" }
	);
	const { data: selectedIndustrySector } = api.industrySector.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "industrySectors" }
	);
	const { data: selectedLocation } = api.location.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "locations" }
	);
	const { data: selectedSalutation } = api.salutation.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "salutations" }
	);
	const { data: selectedOrganisationRole } = api.organisationRole.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "organisationRoles" }
	);
	const { data: selectedSecurityClearance } = api.securityClearance.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "securityClearance" }
	);
	const { data: selectedSkill } = api.skills.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "skills" }
	);
	const { data: selectedDivision } = api.division.getById.useQuery(
		{ id: selectedItemId! },
		{ enabled: !!selectedItemId && activeTab === "divisions" }
	);

	const getSelectedItem = (): SelectedItem => {
		switch (activeTab) {
			case "certificates":
				return selectedCertificate || null;
			case "employeeRoles":
				return selectedEmployeeRole || null;
			case "employeeRanks":
				return selectedEmployeeRank || null;
			case "industrySectors":
				return selectedIndustrySector || null;
			case "locations":
				return selectedLocation || null;
			case "salutations":
				return selectedSalutation || null;
			case "organisationRoles":
				return selectedOrganisationRole || null;
			case "securityClearance":
				return selectedSecurityClearance || null;
			case "skills":
				return selectedSkill || null;
			case "divisions":
				return selectedDivision || null;
			default:
				return null;
		}
	};

	const getModalTitle = () => {
		switch (activeTab) {
			case "certificates":
				return "Zertifikat Details";
			case "employeeRoles":
				return "Mitarbeiterrolle Details";
			case "employeeRanks":
				return "Mitarbeiterrang Details";
			case "industrySectors":
				return "Branche Details";
			case "locations":
				return "Standort Details";
			case "salutations":
				return "Anrede Details";
			case "organisationRoles":
				return "Organisationsrolle Details";
			case "securityClearance":
				return "Sicherheitsüberprüfung Details";
			case "skills":
				return "Fähigkeit Details";
			case "divisions":
				return "Division Details";
			default:
				return "Details";
		}
	};

	const getFormFields = (tab: string) => {
		switch (tab) {
			case "locations":
				return locationFormSchema.fields;
			case "certificates":
				return getCertificateFormFields();
			case "employeeRanks":
				return getEmployeeRankFormFields();
			case "employeeRoles":
				return getEmployeeRoleFormFields();
			case "industrySectors":
				return getIndustrySectorFormFields();
			case "organisationRoles":
				return getOrganisationRoleFormFields();
			case "salutations":
				return salutationFormSchema.fields;
			case "securityClearance":
				return securityClearanceFormConfig.sections[0].fields;
			case "skills":
				return skillsFormSchema.fields;
			case "pitch":
				return [
					{
						name: "title",
						label: "Titel",
						type: "text" as const,
						required: true,
						position: 1,
						width: "full" as const,
						section: {
							id: "overview",
							title: "Übersicht",
						},
					},
					{
						name: "description",
						label: "Beschreibung",
						type: "textarea" as const,
						required: true,
						position: 2,
						width: "full" as const,
						section: {
							id: "overview",
							title: "Übersicht",
						},
					},
				] as FormFieldSchema[];
			case "divisions":
				return divisionFormConfig;
			default:
				return [];
		}
	};

	const handleCreate = async (data: unknown) => {
		const formData = data as FormData;
		try {
			switch (activeTab) {
				case "divisions":
					await createDivision.mutateAsync({
						title: formData.divisionTitle!,
						abbreviation: formData.abbreviation,
						managedById: formData.managedById,
						parentDivisionId: formData.parentDivisionId,
					});
					break;
				// ... existing cases ...
			}
			setIsCreateDialogOpen(false);
			toast.success("Division successfully created");
		} catch (error) {
			console.error("Error creating item:", error);
			toast.error("Error creating division");
		}
	};

	// Add create mutation
	const createDivision = api.division.create.useMutation({
		onSuccess: async () => {
			await utils.division.getAll.invalidate();
		},
		onError: (error) => {
			toast.error("Error creating division: " + error.message);
		},
	});

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Einstellungen</h1>
			</div>
			<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
				<TabsList className="grid w-full grid-cols-11">
					<TabsTrigger value="salutations">Anreden</TabsTrigger>
					<TabsTrigger value="employeeRoles">Projektrollen</TabsTrigger>
					<TabsTrigger value="employeeRanks">Positionen</TabsTrigger>
					<TabsTrigger value="securityClearance">Sicherheitscheck</TabsTrigger>
					<TabsTrigger value="skills">Skills</TabsTrigger>
					<TabsTrigger value="certificates">Zertifikate</TabsTrigger>
					<TabsTrigger value="locations">Standorte</TabsTrigger>
					<TabsTrigger value="industrySectors">Branchen</TabsTrigger>
					<TabsTrigger value="organisationRoles">Beziehungen</TabsTrigger>
					<TabsTrigger value="divisions">Divisionen</TabsTrigger>
					<TabsTrigger value="pitch">Pitch</TabsTrigger>
				</TabsList>

				<TabsContent value="salutations">
					<DataTable
						data={(salutations || []).map((salutation) => ({
							...salutation,
							createdAt: salutation.createdAt ?? undefined,
							updatedAt: salutation.updatedAt ?? undefined,
						}))}
						columns={getSalutationColumns(handleModalOpen, "modal") as ColumnDef<SalutationData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="employeeRoles">
					<DataTable
						data={(employeeRoles || []).map((role) => ({
							...role,
							createdAt: role.createdAt ?? undefined,
							updatedAt: role.updatedAt ?? undefined,
						}))}
						columns={getEmployeeRoleColumns(handleModalOpen, "modal") as ColumnDef<EmployeeRoleData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="employeeRanks">
					<DataTable
						data={(employeeRanks || []).map((rank) => ({
							...rank,
							createdAt: rank.createdAt ?? undefined,
							updatedAt: rank.updatedAt ?? undefined,
							employeeCostStraight: rank.employeeCostStraight ?? null,
						}))}
						columns={getEmployeeRankColumns(handleModalOpen, "modal") as ColumnDef<EmployeeRankData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="securityClearance">
					<DataTable
						data={(securityClearances || []).map((clearance) => ({
							...clearance,
							createdAt: clearance.createdAt ?? undefined,
							updatedAt: clearance.updatedAt ?? undefined,
							securityClearanceType: clearance.securityClearanceType ?? null,
							securityClearanceLevel: clearance.securityClearanceLevel ?? null,
							applicationDate: clearance.applicationDate ?? null,
							approved: clearance.approved ?? null,
							employee: clearance.employee ?? null,
							employeeIDs: clearance.employeeIDs ?? "",
						}))}
						columns={getSecurityClearanceColumns(handleModalOpen, "modal") as unknown as ColumnDef<SecurityClearanceData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="skills">
					<DataTable
						data={(skills || []).map((skill) => ({
							...skill,
							createdAt: skill.createdAt ?? undefined,
							updatedAt: skill.updatedAt ?? undefined,
							type: skill.type ?? null,
							description: skill.description ?? null,
							title: skill.title ?? null,
							employeeSkills: skill.employeeSkills ?? [],
						}))}
						columns={getSkillColumns(handleModalOpen, "modal") as unknown as ColumnDef<SkillData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="certificates">
					<DataTable
						data={(certificates || []).map((cert) => ({
							...cert,
							createdAt: cert.createdAt ?? undefined,
							updatedAt: cert.updatedAt ?? undefined,
							type: cert.type ?? null,
							description: cert.description ?? null,
							category: cert.category ?? null,
							deeplink: cert.deeplink ?? null,
							salesCertificate: cert.salesCertificate ?? null,
							conditionsOfParticipationIDs: cert.conditionsOfParticipationIDs ?? [],
						}))}
						columns={getCertificateColumns(handleModalOpen, "modal") as unknown as ColumnDef<CertificateData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="locations">
					<DataTable
						data={(locations || []).map((location) => ({
							...location,
							createdAt: location.createdAt ?? undefined,
							updatedAt: location.updatedAt ?? undefined,
						}))}
						columns={getLocationColumns(handleModalOpen, "modal")}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="industrySectors">
					<DataTable
						data={(industrySectors || []).map((sector) => ({
							...sector,
							createdAt: sector.createdAt ?? undefined,
							updatedAt: sector.updatedAt ?? undefined,
						}))}
						columns={getIndustrySectorColumns(handleModalOpen, "modal")}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="organisationRoles">
					<DataTable
						data={(organisationRoles || []).map((role) => ({
							...role,
							createdAt: role.createdAt ?? undefined,
							updatedAt: role.updatedAt ?? undefined,
						}))}
						columns={getOrganisationRoleColumns(handleModalOpen, "modal")}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="divisions">
					<DataTable
						data={(divisions || []).map((division) => ({
							...division,
							createdAt: division.createdAt ?? undefined,
							updatedAt: division.updatedAt ?? undefined,
						}))}
						columns={getDivisionColumns(handleModalOpen, "modal") as ColumnDef<DivisionData>[]}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>

				<TabsContent value="pitch">
					<DataTable
						data={(pitchModules || []).map((module: PitchModule) => ({
							...module,
							createdAt: module.createdAt ?? undefined,
							updatedAt: module.updatedAt ?? undefined,
						}))}
						columns={pitchColumns}
						tabValue={activeTab}
						onView={handleModalOpen}
						viewMode="modal"
					/>
				</TabsContent>
			</Tabs>

			<Dialog open={!!selectedItemId} onOpenChange={handleModalClose}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>{getModalTitle()}</DialogTitle>
					</DialogHeader>
					{getSelectedItem() && schemas[activeTab] && (
						isEditing ? (
							<DynamicForm
								schema={{
									fields: getFormFields(activeTab),
									onSubmit: (data: unknown) => handleSubmit(data),
								}}
								defaultValues={{
									...getSelectedItem(),
									...(activeTab === "securityClearance" && getSelectedItem()?.employee ? {
										employeeIDs: getSelectedItem()?.employee?.id ?? "",
										securityClearanceType: getSelectedItem()?.securityClearanceType ?? "",
										securityClearanceLevel: getSelectedItem()?.securityClearanceLevel ?? "",
										applicationDate: getSelectedItem()?.applicationDate instanceof Date ? getSelectedItem()?.applicationDate : undefined,
										approved: getSelectedItem()?.approved ?? false,
									} : {}),
									...(activeTab === "divisions" && getSelectedItem() ? {
										title: getSelectedItem()?.title,
										abbreviation: getSelectedItem()?.abbreviation,
										managedById: getSelectedItem()?.managedBy?.id,
										parentDivisionId: getSelectedItem()?.parentDivision?.id,
										employeeIDs: getSelectedItem()?.employees?.map(emp => emp.id) || [],
									} : {}),
								}}
							/>
						) : (
							<DetailView
								schema={schemas[activeTab]}
								data={getSelectedItem() || {}}
								onEdit={handleEdit}
								className="py-4"
							/>
						)
					)}
				</DialogContent>
			</Dialog>

			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent className="sm:max-w-[800px]">
					<DialogHeader>
						<DialogTitle>Create Division</DialogTitle>
					</DialogHeader>
					<DynamicForm
						schema={{
							fields: getFormFields(activeTab),
							onSubmit: handleCreate,
						}}
						defaultValues={{}}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<SettingsContent />
		</Suspense>
	);
}
