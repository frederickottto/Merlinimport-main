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
	defaultValues as profileDefaultValues,

	type FormProfileData,
	type UpdateProfileData
} from "@/server/controllers/profiles/form-config";
import { detailSchema } from "@/server/controllers/profiles/detail-config";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/table/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import academic degree related modules
import { academicDegreeColumns } from "@/server/controllers/profiles/academicDegree/table-config";
import { getFormFields as getAcademicDegreeFormFields, defaultValues as academicDegreeDefaultValues, createSchema as createAcademicDegreeSchema } from "@/server/controllers/profiles/academicDegree/form-config";
import { detailSchema as academicDegreeDetailSchema } from "@/server/controllers/profiles/academicDegree/detail-config";
import type { TransformedAcademicDegree } from "@/server/controllers/profiles/academicDegree/table-config";

// Import certificates related modules
import { employeeCertificatesColumns, type EmployeeCertificateRow } from "@/server/controllers/profiles/employeeCertificates/table-config";
import { getFormFields as getCertificateFormFields, defaultValues as certificateDefaultValues, createSchema as createCertificateSchema } from "@/server/controllers/profiles/employeeCertificates/form-config";
import { certificateDetailSchema } from "@/server/controllers/profiles/employeeCertificates/detail-config";
import { employeeCertificatesSchema } from "@/server/controllers/profiles/employeeCertificates/schema";

// Import project activities related modules
import { employeeProjectActivitiesColumns } from "@/server/controllers/profiles/employeeProjectActivities/table-config";
import { getFormFields as getProjectActivityFormFields, defaultValues as projectActivityDefaultValues, createSchema as createProjectActivitySchema } from "@/server/controllers/profiles/employeeProjectActivities/form-config";
import { detailSchema as projectActivityDetailSchema } from "@/server/controllers/profiles/employeeProjectActivities/detail-config";
import { employeeProjectActivitiesSchema } from "@/server/controllers/profiles/employeeProjectActivities/schema";
import type { EmployeeProjectActivityRow } from "@/server/controllers/profiles/employeeProjectActivities/table-config";

// Import skills related modules
import { employeeSkillsColumns } from "@/server/controllers/profiles/employeeSkills/table-config";
import { getFormFields as getSkillFormFields, defaultValues as skillDefaultValues, createSchema as createSkillSchema } from "@/server/controllers/profiles/employeeSkills/form-config";
import { detailSchema as skillDetailSchema } from "@/server/controllers/profiles/employeeSkills/detail-config";

// Import professional background related modules
import { professionalBackgroundColumns, TransformedProfessionalBackground } from "@/server/controllers/profiles/professionalBackground/table-config";
import { getFormFields as getProfBackgroundFormFields, defaultValues as profBackgroundDefaultValues, createSchema as createProfBackgroundSchema } from "@/server/controllers/profiles/professionalBackground/form-config";
import { detailSchema as profBackgroundDetailSchema } from "@/server/controllers/profiles/professionalBackground/detail-config";

// Import external project related modules
import { employeeExternalProjectsColumns } from "@/server/controllers/profiles/employeeExternalProjects/table-config";
import { getFormFields as getExternalProjectFormFields, defaultValues as externalProjectDefaultValues, createSchema as createExternalProjectSchema } from "@/server/controllers/profiles/employeeExternalProjects/form-config";
import { detailSchema as externalProjectDetailSchema } from "@/server/controllers/profiles/employeeExternalProjects/detail-config";

// Import vocational related modules
import { voccationalColumns, TransformedVoccational } from "@/server/controllers/profiles/voccational/table-config";
import { getFormFields as getVocationalFormFields, defaultValues as vocationalDefaultValues, createSchema as createVocationalSchema } from "@/server/controllers/profiles/voccational/form-config";
import { detailSchema as vocationalDetailSchema } from "@/server/controllers/profiles/voccational/detail-config";

// Import employee training related modules
import { employeeTrainingColumns, TransformedEmployeeTraining } from "@/server/controllers/profiles/employeeTraining/table-config";
import { getFormFields as getEmployeeTrainingFormFields, defaultValues as employeeTrainingDefaultValues, createSchema as createEmployeeTrainingSchema } from "@/server/controllers/profiles/employeeTraining/form-config";
import { detailSchema as employeeTrainingDetailSchema } from "@/server/controllers/profiles/employeeTraining/detail-config";

// Import security clearance related modules
import { getSecurityClearanceColumns } from "@/server/controllers/settings/securityClearance/table-config";
import { securityClearanceFormConfig, securityClearanceFormSchema } from "@/server/controllers/settings/securityClearance/form-config";
import { detailSchema as securityClearanceDetailSchema } from "@/server/controllers/settings/securityClearance/detail-config";
import type { SecurityClearance } from "@/server/controllers/settings/securityClearance/schema";
import type { SecurityClearanceWithEmployee } from "@/server/controllers/settings/securityClearance/form-config";

interface PageProps {
	params: Promise<{
		id: string;
	}>;
}

const Page = ({ params }: PageProps) => {
	const { id } = use(params);
	const router = useRouter();
	const searchParams = useSearchParams();
	const activeTab = searchParams.get("tab") || "overview";
	const [isEditing, setIsEditing] = useState(false);

	// Academic degree states
	const [addingAcademicDegree, setAddingAcademicDegree] = useState(false);
	const [selectedAcademicDegreeId, setSelectedAcademicDegreeId] = useState<string | null>(null);
	const [isAcademicDegreeEditing, setIsAcademicDegreeEditing] = useState(false);

	// Certificate states
	const [addingCertificate, setAddingCertificate] = useState(false);
	const [selectedCertificateId, setSelectedCertificateId] = useState<string | null>(null);
	const [isCertificateEditing, setIsCertificateEditing] = useState(false);

	// Project activity states
	const [addingProjectActivity, setAddingProjectActivity] = useState(false);
	const [selectedProjectActivityId, setSelectedProjectActivityId] = useState<string | null>(null);
	const [isProjectActivityEditing, setIsProjectActivityEditing] = useState(false);

	// Skill states
	const [addingSkill, setAddingSkill] = useState(false);
	const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
	const [isSkillEditing, setIsSkillEditing] = useState(false);

	// Professional background states
	const [addingProfBackground, setAddingProfBackground] = useState(false);
	const [selectedProfBackgroundId, setSelectedProfBackgroundId] = useState<string | null>(null);
	const [isProfBackgroundEditing, setIsProfBackgroundEditing] = useState(false);

	// External project states
	const [addingExternalProject, setAddingExternalProject] = useState(false);
	const [selectedExternalProjectId, setSelectedExternalProjectId] = useState<string | null>(null);
	const [isExternalProjectEditing, setIsExternalProjectEditing] = useState(false);

	// Vocational states
	const [addingVocational, setAddingVocational] = useState(false);
	const [selectedVocationalId, setSelectedVocationalId] = useState<string | null>(null);
	const [isVocationalEditing, setIsVocationalEditing] = useState(false);

	// Training states
	const [addingTraining, setAddingTraining] = useState(false);
	const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
	const [isTrainingEditing, setIsTrainingEditing] = useState(false);

	// Security clearance states
	const [addingSecurityClearance, setAddingSecurityClearance] = useState(false);
	const [selectedSecurityClearanceId, setSelectedSecurityClearanceId] = useState<string | null>(null);
	const [isSecurityClearanceEditing, setIsSecurityClearanceEditing] = useState(false);

	const utils = api.useUtils();
	const { data: profile, isLoading } = api.profiles.getById.useQuery({ id });
	const { data: academicDegrees, refetch: refetchAcademicDegrees } = api.academicDegree.getAll.useQuery({ employeeId: id });
	const { data: certificates, refetch: refetchCertificates } = api.employeeCertificates.getAll.useQuery({ employeeId: id });
	const { data: projectActivities, refetch: refetchProjectActivities } = api.employeeProjectActivities.getAll.useQuery({ employeeId: id });
	const { data: skills, refetch: refetchSkills } = api.employeeSkills.getAll.useQuery({ employeeId: id });
	const { data: profBackground, refetch: refetchProfBackground } = api.professionalBackground.getAll.useQuery({ employeeId: id });
	const { data: externalProjects, refetch: refetchExternalProjects } = api.employeeExternalProjects.getAll.useQuery({ employeeId: id });
	const { data: vocational, refetch: refetchVocational } = api.voccational.getAll.useQuery({ employeeId: id });
	const { data: employeeTrainings, refetch: refetchEmployeeTrainings } = api.employeeTraining.getAll.useQuery({ employeeId: id });
	const { data: securityClearances, refetch: refetchSecurityClearances } = api.securityClearance.getAll.useQuery();
	const { data: trainings, isLoading: isTrainingsLoading, error: trainingsError } = api.trainings.getAll.useQuery(undefined, {
		retry: false,
		refetchOnWindowFocus: false,
	});

	// Add logging for project activities data
	console.log('Raw Project Activities:', projectActivities);

	// Profile mutations
	const updateProfile = api.profiles.update.useMutation({
		onSuccess: async () => {
			toast.success("Profil erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsEditing(false);
			await utils.profiles.getById.invalidate({ id });
			await utils.profiles.getById.refetch({ id });
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren des Profils: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Academic degree mutations
	const createAcademicDegree = api.academicDegree.create.useMutation({
		onSuccess: async () => {
			toast.success("Akademischer Grad erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingAcademicDegree(false);
			await refetchAcademicDegrees();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen des akademischen Grades: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateAcademicDegree = api.academicDegree.update.useMutation({
		onSuccess: async () => {
			toast.success("Akademischer Grad erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsAcademicDegreeEditing(false);
			await refetchAcademicDegrees();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren des akademischen Grades: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Certificate mutations
	const createCertificate = api.employeeCertificates.create.useMutation({
		onSuccess: async () => {
			toast.success("Zertifikat erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingCertificate(false);
			await refetchCertificates();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen des Zertifikats: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateCertificate = api.employeeCertificates.update.useMutation({
		onSuccess: async () => {
			toast.success("Zertifikat erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsCertificateEditing(false);
			await refetchCertificates();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren des Zertifikats: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Project activity mutations
	const createProjectActivity = api.employeeProjectActivities.create.useMutation({
		onSuccess: async () => {
			toast.success("Projektaktivität erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingProjectActivity(false);
			await refetchProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateProjectActivity = api.employeeProjectActivities.update.useMutation({
		onSuccess: async () => {
			toast.success("Projektaktivität erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsProjectActivityEditing(false);
			await refetchProjectActivities();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Skill mutations
	const createSkill = api.employeeSkills.create.useMutation({
		onSuccess: async () => {
			toast.success("Fähigkeit erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingSkill(false);
			await refetchSkills();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Fähigkeit: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateSkill = api.employeeSkills.update.useMutation({
		onSuccess: async () => {
			toast.success("Fähigkeit erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsSkillEditing(false);
			await refetchSkills();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Fähigkeit: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Professional background mutations
	const createProfBackground = api.professionalBackground.create.useMutation({
		onSuccess: async () => {
			toast.success("Beruflicher Hintergrund erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingProfBackground(false);
			await refetchProfBackground();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen des beruflichen Hintergrunds: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateProfBackground = api.professionalBackground.update.useMutation({
		onSuccess: async () => {
			toast.success("Beruflicher Hintergrund erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsProfBackgroundEditing(false);
			await refetchProfBackground();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren des beruflichen Hintergrunds: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// External project mutations
	const createExternalProject = api.employeeExternalProjects.create.useMutation({
		onSuccess: async () => {
			toast.success("Externe Projektaktivität erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingExternalProject(false);
			await refetchExternalProjects();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der externen Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateExternalProject = api.employeeExternalProjects.update.useMutation({
		onSuccess: async () => {
			toast.success("Externe Projektaktivität erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsExternalProjectEditing(false);
			await refetchExternalProjects();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der externen Projektaktivität: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Vocational mutations
	const createVocational = api.voccational.create.useMutation({
		onSuccess: async () => {
			toast.success("Ausbildung erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingVocational(false);
			await refetchVocational();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Ausbildung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateVocational = api.voccational.update.useMutation({
		onSuccess: async () => {
			toast.success("Ausbildung erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsVocationalEditing(false);
			await refetchVocational();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Ausbildung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Training mutations
	const createEmployeeTraining = api.employeeTraining.create.useMutation({
		onSuccess: async () => {
			toast.success("Schulung erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingTraining(false);
			await refetchEmployeeTrainings();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Schulung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateEmployeeTraining = api.employeeTraining.update.useMutation({
		onSuccess: async () => {
			toast.success("Schulung erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsTrainingEditing(false);
			await refetchEmployeeTrainings();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Schulung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	// Security clearance mutations
	const createSecurityClearance = api.securityClearance.create.useMutation({
		onSuccess: async () => {
			toast.success("Sicherheitsüberprüfung erfolgreich hinzugefügt", {
				position: "top-right",
				duration: 3000,
			});
			setAddingSecurityClearance(false);
			await refetchSecurityClearances();
		},
		onError: (error) => {
			toast.error("Fehler beim Hinzufügen der Sicherheitsüberprüfung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	const updateSecurityClearance = api.securityClearance.update.useMutation({
		onSuccess: async () => {
			toast.success("Sicherheitsüberprüfung erfolgreich aktualisiert", {
				position: "top-right",
				duration: 3000,
			});
			setIsSecurityClearanceEditing(false);
			await refetchSecurityClearances();
		},
		onError: (error) => {
			toast.error("Fehler beim Aktualisieren der Sicherheitsüberprüfung: " + error.message, {
				position: "top-right",
				duration: 3000,
			});
		},
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!profile) {
		return notFound();
	}

	const profileWithSalutations = {
		...profile,
		// Map titles to an array of salutationIDs for form handling
		salutationIDs: Array.isArray(profile.titles) ? profile.titles.map(title => title.id) : [],
		// Map counselor to a single counselorID for form handling
		counselorIDs: profile.counselor?.id || "",
		// Map employee rank to a single employeeRankID for form handling
		employeeRankIDs: profile.employeeRank?.id || "",
		// Map location to a single locationID for form handling
		locationIDs: profile.location?.id || "",
		// Transform titles for display purposes
		titles: Array.isArray(profile.titles) ? profile.titles.map(title => ({
			id: title.id,
			salutationShort: title.salutationShort,
			salutationLong: title.salutationLong,
			display: `${title.salutationShort}${title.salutationLong ? ` (${title.salutationLong})` : ''}`
		})) : [],
		contractStartDate: profile.contractStartDate ? new Date(profile.contractStartDate) : null,
		employeeRank: profile.employeeRank?.employeePositionShort || null,
		location: profile.location ? {
			...profile.location,
			displayAddress: `${profile.location.street} ${profile.location.houseNumber}, ${profile.location.postCode} ${profile.location.city}, ${profile.location.region}, ${profile.location.country}`
		} : null,
		// Add counselor data for display
		counselor: profile.counselor ? {
			id: profile.counselor.id,
			foreName: profile.counselor.foreName,
			lastName: profile.counselor.lastName
		} : null
	};

	console.log("profileWithSalutations", profileWithSalutations);

	const handleSubmit = async (formData: unknown) => {
		try {
			const typedData = formData as FormProfileData;
			
			// Ensure required fields are present
			if (!typedData.foreName || !typedData.lastName) {
				throw new Error("Forename and lastname are required");
			}

			// Create the update data with proper typing
			const cleanUpdateData: UpdateProfileData = {
				foreName: typedData.foreName,
				lastName: typedData.lastName,
				experienceIt: typedData.experienceIt ?? 0,
				experienceIs: typedData.experienceIs ?? 0,
				experienceItGs: typedData.experienceItGs ?? 0,
				experienceGps: typedData.experienceGps ?? 0,
				experienceOther: typedData.experienceOther ?? 0,
				experienceAll: typedData.experienceAll ?? 0,
				// Optional fields
				pseudonym: typedData.pseudonym,
				employeerCompany: typedData.employeerCompany,
				mobile: typedData.mobile,
				telephone: typedData.telephone,
				linkedInURL: typedData.linkedInURL,
				xingURL: typedData.xingURL,
				discoverURL: typedData.discoverURL,
				description: typedData.description,
				contractStartDate: typedData.contractStartDate,
				// Pass IDs directly
				salutationIDs: typedData.salutationIDs,
				counselorIDs: typedData.counselorIDs,
				employeeRankIDs: typedData.employeeRankIDs,
				locationIDs: typedData.locationIDs,
				divisionId: typedData.divisionId,
			};

			await updateProfile.mutateAsync({
				id,
				data: cleanUpdateData,
			});
		} catch (error) {
			console.error("Error updating profile:", error);
		}
	};

	const handleTabChange = (value: string) => {
		router.push(`/profiles/${id}?tab=${value}`);
	};

	// Academic degree handlers
	const handleAddAcademicDegree = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createAcademicDegreeSchema>;
			await createAcademicDegree.mutateAsync({
				data: {
					...typedData,
					employeeIDs: id,
				},
			});
		} catch (error) {
			console.error("Error adding academic degree:", error);
		}
	};

	const handleAcademicDegreeModalOpen = (id: string | number) => {
		setSelectedAcademicDegreeId(id.toString());
	};

	const handleAcademicDegreeModalClose = () => {
		setSelectedAcademicDegreeId(null);
		setIsAcademicDegreeEditing(false);
	};

	const handleUpdateAcademicDegree = async (data: unknown) => {
		const typedData = data as z.infer<typeof createAcademicDegreeSchema>;
		await updateAcademicDegree.mutateAsync({
			id: selectedAcademicDegreeId!,
			data: typedData,
		});
	};

	// Certificate handlers
	const handleAddCertificate = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createCertificateSchema>;
			const data = {
				certificateIDs: typedData.certificateIDs,
				validUntil: typedData.validUntil,
				employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
				employeeIDs: id,
				issuer: typedData.issuer,
			} satisfies z.infer<typeof employeeCertificatesSchema>;
			await createCertificate.mutateAsync({ data });
		} catch (error) {
			console.error("Error adding certificate:", error);
		}
	};

	const handleCertificateModalOpen = (id: string | number) => {
		setSelectedCertificateId(id.toString());
	};

	const handleCertificateModalClose = () => {
		setSelectedCertificateId(null);
		setIsCertificateEditing(false);
	};

	const handleUpdateCertificate = async (data: unknown) => {
		const typedData = data as z.infer<typeof createCertificateSchema>;
		await updateCertificate.mutateAsync({
			id: selectedCertificateId!,
			data: {
				validUntil: typedData.validUntil,
				employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
				issuer: typedData.issuer,
			},
		});
	};

	// Project activity handlers
	const handleAddProjectActivity = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createProjectActivitySchema>;
			const data = {
				description: typedData.description,
				employeeRoleID: typedData.employeeRoleID,
				projectIDs: typedData.projectIDs || "",
				employeeIDs: id,
				operationalPeriodStart: typedData.operationalPeriodStart,
				operationalPeriodEnd: typedData.operationalPeriodEnd,
				operationalDays: typedData.operationalDays || 0,
			} satisfies z.infer<typeof employeeProjectActivitiesSchema>;
			await createProjectActivity.mutateAsync({ data });
		} catch (error) {
			console.error("Error adding project activity:", error);
		}
	};

	const handleProjectActivityModalOpen = (id: string | number) => {
		setSelectedProjectActivityId(id.toString());
	};

	const handleProjectActivityModalClose = () => {
		setSelectedProjectActivityId(null);
		setIsProjectActivityEditing(false);
	};

	const handleUpdateProjectActivity = async (data: unknown) => {
		const typedData = data as z.infer<typeof createProjectActivitySchema>;
		await updateProjectActivity.mutateAsync({
			id: selectedProjectActivityId!,
			data: typedData,
		});
	};

	// Skill handlers
	const handleAddSkill = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createSkillSchema>;
			await createSkill.mutateAsync({
				data: {
					skillIDs: typedData.skillIDs,
					niveau: typedData.niveau,
					employeeIDs: [id],
				},
			});
		} catch (error) {
			console.error("Error adding skill:", error);
		}
	};

	const handleSkillModalOpen = (id: string | number) => {
		setSelectedSkillId(id.toString());
	};

	const handleSkillModalClose = () => {
		setSelectedSkillId(null);
		setIsSkillEditing(false);
	};

	const handleUpdateSkill = async (data: unknown) => {
		const typedData = data as z.infer<typeof createSkillSchema>;
		await updateSkill.mutateAsync({
			id: selectedSkillId!,
			data: typedData,
		});
	};

	// Professional background handlers
	const handleAddProfBackground = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createProfBackgroundSchema>;
			await createProfBackground.mutateAsync({
				...typedData,
				employeeIDs: id,
			});
		} catch (error) {
			console.error("Error adding professional background:", error);
		}
	};

	const handleProfBackgroundModalOpen = (id: string | number) => {
		setSelectedProfBackgroundId(id.toString());
	};

	const handleProfBackgroundModalClose = () => {
		setSelectedProfBackgroundId(null);
		setIsProfBackgroundEditing(false);
	};

	const handleUpdateProfBackground = async (data: unknown) => {
		const typedData = data as z.infer<typeof createProfBackgroundSchema>;
		await updateProfBackground.mutateAsync({
			id: selectedProfBackgroundId!,
			...typedData,
		});
	};

	// External project handlers
	const handleAddExternalProject = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createExternalProjectSchema>;
			await createExternalProject.mutateAsync({
				data: {
					...typedData,
					employeeIDs: id,
				},
			});
		} catch (error) {
			console.error("Error adding external project:", error);
		}
	};

	const handleExternalProjectModalOpen = (id: string | number) => {
		setSelectedExternalProjectId(id.toString());
	};

	const handleExternalProjectModalClose = () => {
		setSelectedExternalProjectId(null);
		setIsExternalProjectEditing(false);
	};

	const handleUpdateExternalProject = async (data: unknown) => {
		const typedData = data as z.infer<typeof createExternalProjectSchema>;
		await updateExternalProject.mutateAsync({
			id: selectedExternalProjectId!,
			data: typedData,
		});
	};

	// Vocational handlers
	const handleAddVocational = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createVocationalSchema>;
			await createVocational.mutateAsync({
				data: {
					...typedData,
					employeeIDs: id,
				},
			});
		} catch (error) {
			console.error("Error adding vocational:", error);
		}
	};

	const handleVocationalModalOpen = (id: string | number) => {
		setSelectedVocationalId(id.toString());
	};

	const handleVocationalModalClose = () => {
		setSelectedVocationalId(null);
		setIsVocationalEditing(false);
	};

	const handleUpdateVocational = async (data: unknown) => {
		const typedData = data as z.infer<typeof createVocationalSchema>;
		await updateVocational.mutateAsync({
			id: selectedVocationalId!,
			data: typedData,
		});
	};

	// Training handlers
	const handleAddTraining = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof createEmployeeTrainingSchema>;
			await createEmployeeTraining.mutateAsync({
				data: {
					...typedData,
					employeeID: id,
				},
			});
		} catch (error) {
			console.error("Error adding training:", error);
		}
	};

	const handleTrainingModalOpen = (id: string | number) => {
		setSelectedTrainingId(id.toString());
	};

	const handleTrainingModalClose = () => {
		setSelectedTrainingId(null);
		setIsTrainingEditing(false);
	};

	const handleUpdateTraining = async (data: unknown) => {
		const typedData = data as z.infer<typeof createEmployeeTrainingSchema>;
		await updateEmployeeTraining.mutateAsync({
			id: selectedTrainingId!,
			data: typedData,
		});
	};

	// Security clearance handlers
	const handleAddSecurityClearance = async (formData: unknown) => {
		try {
			const typedData = formData as z.infer<typeof securityClearanceFormSchema>;
			await createSecurityClearance.mutateAsync({
				...typedData,
				employeeIDs: id,
			});
		} catch (error) {
			console.error("Error adding security clearance:", error);
		}
	};

	const handleSecurityClearanceModalOpen = (id: string | number) => {
		setSelectedSecurityClearanceId(id.toString());
	};

	const handleSecurityClearanceModalClose = () => {
		setSelectedSecurityClearanceId(null);
		setIsSecurityClearanceEditing(false);
	};

	const handleUpdateSecurityClearance = async (data: unknown) => {
		const typedData = data as z.infer<typeof securityClearanceFormSchema>;
		await updateSecurityClearance.mutateAsync({
			id: selectedSecurityClearanceId!,
			...typedData,
		});
	};

	return (
		<div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
			<div className="p-6">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-bold tracking-tight">
						{profile.foreName} {profile.lastName}
					</h1>
				</div>

				<Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-2">
					<TabsList className="grid w-full grid-cols-10">
						<TabsTrigger value="overview">Übersicht</TabsTrigger>
						<TabsTrigger value="academic">Studium</TabsTrigger>
						<TabsTrigger value="voccational">Ausbildung</TabsTrigger>
						<TabsTrigger value="professional">Vita</TabsTrigger>
						<TabsTrigger value="projects">EY-Projekte</TabsTrigger>
						<TabsTrigger value="external">Sonstige Projekte</TabsTrigger>
						<TabsTrigger value="certificates">Zertifikate</TabsTrigger>
						<TabsTrigger value="skills">Skills</TabsTrigger>
						<TabsTrigger value="trainings">Schulungen</TabsTrigger>
						<TabsTrigger value="securityClearance">Sonstiges</TabsTrigger>
					</TabsList>

					<TabsContent value="overview">
						<Card className="border-none shadow-none">
							{isEditing ? (
								<DynamicForm
									schema={{
										fields: getFormFields().map(field => {
											if (field.name === 'salutationIDs') {
												return {
													...field,
													options: {
														endpoint: "salutation.getAll",
														labelField: "salutationShort",
														valueField: "id",
														multiple: true,
														formatLabel: (item: unknown) => {
															const salutation = item as { salutationShort: string; salutationLong?: string };
															return salutation.salutationLong 
																? `${salutation.salutationShort} (${salutation.salutationLong})`
																: salutation.salutationShort;
														}
													}
												};
											}
											return field;
										}),
										onSubmit: handleSubmit,
									}}
									defaultValues={{
										...profileDefaultValues,
										...profileWithSalutations,
										// Ensure salutationIDs is an array of strings
										salutationIDs: Array.isArray(profileWithSalutations.salutationIDs) 
											? profileWithSalutations.salutationIDs 
											: [],
										// Ensure counselorIDs is a string
										counselorIDs: profileWithSalutations.counselorIDs || "",
									}}
								/>
							) : (
								<DetailView 
									schema={detailSchema}
									data={profileWithSalutations}
									onEdit={() => setIsEditing(true)}
									className="py-4"
								/>
							)}
						</Card>
					</TabsContent>

					<TabsContent value="academic">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Akademischer Werdegang</h2>
									<Button
										onClick={() => setAddingAcademicDegree((v) => !v)}
									>
										{addingAcademicDegree ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingAcademicDegree && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getAcademicDegreeFormFields(),
												onSubmit: handleAddAcademicDegree,
											}}
											defaultValues={{
												...academicDegreeDefaultValues,
												employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
												employeeIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable<TransformedAcademicDegree>
									data={(academicDegrees || []).map(degree => ({
										id: degree.id,
										employeeName: `${degree.employee.foreName} ${degree.employee.lastName}`,
										degreeTitleShort: degree.degreeTitleShort,
										degreeTitleLong: degree.degreeTitleLong,
										study: degree.study,
										completed: degree.completed ?? false,
										studyStart: degree.studyStart,
										studyEnd: degree.studyEnd,
										university: degree.university,
										studyMINT: degree.studyMINT ?? false,
									}))}
									columns={academicDegreeColumns(handleAcademicDegreeModalOpen, "modal")}
									onView={handleAcademicDegreeModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="voccational">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Ausbildung</h2>
									<Button
										onClick={() => setAddingVocational((v) => !v)}
									>
										{addingVocational ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingVocational && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getVocationalFormFields(),
												onSubmit: handleAddVocational,
											}}
											defaultValues={{
												...vocationalDefaultValues,
												employeeDisplayName: `${profile.foreName} ${profile.lastName}`,
												employeeIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable<TransformedVoccational>
									data={(vocational || []).map(voc => ({
										id: voc.id,
										employeeName: `${voc.employee.foreName} ${voc.employee.lastName}`,
										industrySectorName: voc.industrySector?.industrySector ?? null,
										voccationalTitleShort: voc.voccationalTitleShort ?? null,
										voccationalTitleLong: voc.voccationalTitleLong ?? null,
										voccationalMINT: voc.voccationalMINT ?? false,
										company: voc.company ?? null,
										voccationalStart: voc.voccationalStart ?? null,
										voccationalEnd: voc.voccationalEnd ?? null,
									}))}
									columns={voccationalColumns(handleVocationalModalOpen, "modal")}
									onView={handleVocationalModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="professional">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Beruflicher Werdegang</h2>
									<Button
										onClick={() => setAddingProfBackground((v) => !v)}
									>
										{addingProfBackground ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingProfBackground && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getProfBackgroundFormFields(),
												onSubmit: handleAddProfBackground,
											}}
											defaultValues={{
												...profBackgroundDefaultValues,
												employeeIDs: id,
												employeeDisplayName: `${profile.foreName} ${profile.lastName}`,
											}}
										/>
									</Card>
								)}
								<DataTable<TransformedProfessionalBackground>
									data={(profBackground ?? []).map(bg => ({
										id: bg.id,
										position: bg.position,
										executivePosition: bg.executivePosition || false,
										employer: bg.employer,
										description: bg.description,
										professionStart: bg.professionStart,
										professionEnd: bg.professionEnd,
										experienceIt: bg.experienceIt || 0,
										experienceIs: bg.experienceIs || 0,
										experienceItGs: bg.experienceItGs || 0,
										experienceGps: bg.experienceGps || 0,
										experienceOther: bg.experienceOther || 0,
										experienceAll: bg.experienceAll || 0,
										employeeName: `${profile.foreName} ${profile.lastName}`,
										industrySectorName:
											typeof bg.industrySector === "object" && bg.industrySector
												? bg.industrySector.industrySector
												: bg.industrySector ?? null,
									}))}
									columns={professionalBackgroundColumns(handleProfBackgroundModalOpen, "modal")}
									onView={handleProfBackgroundModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="projects">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Projektaktivitäten</h2>
									<Button
										onClick={() => setAddingProjectActivity((v) => !v)}
									>
										{addingProjectActivity ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingProjectActivity && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getProjectActivityFormFields(),
												onSubmit: handleAddProjectActivity,
											}}
											defaultValues={{
												...projectActivityDefaultValues,
												employeeDisplayName: `${profile.foreName} ${profile.lastName}`,
											}}
										/>
									</Card>
								)}
								<DataTable<EmployeeProjectActivityRow>
									data={(projectActivities || []).map(activity => ({
										id: activity.id,
										employee: activity.employee
											? {
													id: activity.employee.id,
													foreName: activity.employee.foreName,
													lastName: activity.employee.lastName,
											  }
											: null,
										project: activity.project
											? {
													id: activity.project.id,
													title: activity.project.title ?? "",
											  }
											: null,
										employeeName: activity.employee
											? `${activity.employee.foreName} ${activity.employee.lastName}`
											: "-",
										projectTitle: activity.project?.title || "-",
										employeeRole: activity.employeeRole
											? { id: activity.employeeRole.id, employeeRoleShort: activity.employeeRole.employeeRoleShort || "" }
											: null,
										description: activity.description,
										operationalPeriodStart: activity.operationalPeriodStart,
										operationalPeriodEnd: activity.operationalPeriodEnd,
										operationalDays: activity.operationalDays || 0,
									}))}
									columns={employeeProjectActivitiesColumns(handleProjectActivityModalOpen, "modal")}
									onView={handleProjectActivityModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="external">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Externe Projektaktivitäten</h2>
									<Button
										onClick={() => setAddingExternalProject((v) => !v)}
									>
										{addingExternalProject ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingExternalProject && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getExternalProjectFormFields(),
												onSubmit: handleAddExternalProject,
											}}
											defaultValues={{
												...externalProjectDefaultValues,
												employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
												employeeIDs: id,
											}}
										/>
									</Card>
								)}
								<DataTable
									data={(externalProjects || []).map(project => ({
										id: project.id,
										employee: {
											foreName: project.employee?.foreName || "",
											lastName: project.employee?.lastName || "",
										},
										professionalBackground: project.professionalBackground
											? { position: project.professionalBackground.position || "" }
											: null,
										projectTitle: project.projectTitle || "",
										projectStart: project.projectStart || null,
										projectEnd: project.projectEnd || null,
										operationalDays: project.operationalDays ?? null,
										clientName: project.clientName || null,
									}))}
									columns={employeeExternalProjectsColumns(handleExternalProjectModalOpen, "modal")}
									onView={handleExternalProjectModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="certificates">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Zertifikate</h2>
									<Button
										onClick={() => setAddingCertificate((v) => !v)}
									>
										{addingCertificate ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingCertificate && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getCertificateFormFields(),
												onSubmit: handleAddCertificate,
											}}
											defaultValues={{
												...certificateDefaultValues,
												employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
											}}
										/>
									</Card>
								)}
								<DataTable<EmployeeCertificateRow>
									data={(certificates || []).map((certificate: { 
										id: string; 
										certificate: { title: string } | null; 
										validUntil: Date | null; 
										issuer?: string | null;
									}) => ({
										id: certificate.id,
										employee: {
											foreName: profile.foreName,
											lastName: profile.lastName,
										},
										certificate: certificate.certificate ? {
											title: certificate.certificate.title || "",
										} : null,
										validUntil: certificate.validUntil,
										issuer: certificate.issuer ?? "",
									}))}
									columns={employeeCertificatesColumns(handleCertificateModalOpen, "modal")}
									onView={handleCertificateModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="skills">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Fähigkeiten</h2>
									<Button
										onClick={() => setAddingSkill((v) => !v)}
									>
										{addingSkill ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingSkill && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: getSkillFormFields(),
												onSubmit: handleAddSkill,
											}}
											defaultValues={{
												...skillDefaultValues,
												employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
												employeeIDs: [id],
											}}
										/>
									</Card>
								)}
								<DataTable
									columns={employeeSkillsColumns(handleSkillModalOpen, "modal")}
									data={(skills || []).map(skill => ({
										id: skill.id,
										niveau: skill.niveau,
										employee: {
											foreName: skill.employees[0]?.foreName || "",
											lastName: skill.employees[0]?.lastName || "",
										},
										skillName: skill.skills?.title || "",
									}))}
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="trainings">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Schulungen</h2>
									<Button onClick={() => setAddingTraining((v) => !v)}>
										{addingTraining ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingTraining && (
									<Card className="mb-6 p-4">
										{isTrainingsLoading ? (
											<div>Lade Trainings...</div>
										) : trainingsError ? (
											<div className="text-red-500">Fehler beim Laden der Trainings: {trainingsError.message}</div>
										) : (
											<DynamicForm
												schema={{
													fields: getEmployeeTrainingFormFields().map(field =>
														field.name === "trainingID"
															? {
																	...field,
																	options: (trainings || []).map(t => ({ label: t.trainingTitle, value: t.id })),
															  }
															: field
													),
													onSubmit: handleAddTraining,
												}}
												defaultValues={{
													...employeeTrainingDefaultValues,
													employeeID: id,
													employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
												}}
											/>
										)}
									</Card>
								)}
								<DataTable<TransformedEmployeeTraining>
									data={(employeeTrainings || []).map((et) => ({
										id: et.id,
										employeeName: et.employee ? `${et.employee.foreName} ${et.employee.lastName}` : "",
										trainingTitle: et.training ? et.training.trainingTitle : "",
										passed: et.passed ?? false,
										passedDate: et.passedDate ? new Date(et.passedDate) : null,
									}))}
									columns={employeeTrainingColumns(handleTrainingModalOpen, "modal")}
									onView={handleTrainingModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>

					<TabsContent value="securityClearance">
						<Card className="border-none shadow-none">
							<div className="space-y-6">
								<div className="flex items-center justify-between mb-4">
									<h2 className="text-xl font-semibold">Sicherheitsüberprüfungen</h2>
									<Button onClick={() => setAddingSecurityClearance((v) => !v)}>
										{addingSecurityClearance ? "Abbrechen" : "Hinzufügen"}
									</Button>
								</div>
								{addingSecurityClearance && (
									<Card className="mb-6 p-4">
										<DynamicForm
											schema={{
												fields: securityClearanceFormConfig.sections[0].fields.filter(field => field.name !== "employeeIDs"),
												onSubmit: handleAddSecurityClearance,
											}}
											defaultValues={{
												employeeIDs: id,
												securityClearanceType: "",
												securityClearanceLevel: "",
												applicationDate: new Date(),
												approved: false,
											}}
										/>
									</Card>
								)}
								<DataTable<SecurityClearance>
									data={(securityClearances || [])
										.filter((sc: SecurityClearanceWithEmployee) => sc.employee && typeof sc.employee.id === 'string' && sc.employee.id === id)
										.map((sc: SecurityClearanceWithEmployee) => ({
											id: sc.id,
											employeeIDs: sc.employeeIDs ?? "",
											createdAt: sc.createdAt === null ? undefined : sc.createdAt,
											updatedAt: sc.updatedAt === null ? undefined : sc.updatedAt,
											approved: typeof sc.approved === 'boolean' ? sc.approved : undefined,
											securityClearanceType: sc.securityClearanceType ?? undefined,
											securityClearanceLevel: sc.securityClearanceLevel ?? undefined,
											applicationDate: sc.applicationDate === null ? undefined : sc.applicationDate,
										}))
									}
									columns={getSecurityClearanceColumns(handleSecurityClearanceModalOpen, "modal")}
									onView={handleSecurityClearanceModalOpen}
									viewMode="modal"
									hideCreateButton={true}
								/>
							</div>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Academic Degree Modal */}
				{selectedAcademicDegreeId && (
					<Dialog open={!!selectedAcademicDegreeId} onOpenChange={handleAcademicDegreeModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isAcademicDegreeEditing ? "Akademischen Grad bearbeiten" : "Akademischer Grad Details"}
								</DialogTitle>
							</DialogHeader>
							{isAcademicDegreeEditing ? (
								<DynamicForm
									schema={{
										fields: getAcademicDegreeFormFields(),
										onSubmit: handleUpdateAcademicDegree,
									}}
									defaultValues={
										academicDegrees?.find((d) => d.id === selectedAcademicDegreeId) ||
										academicDegreeDefaultValues
									}
								/>
							) : (
								<DetailView
									schema={academicDegreeDetailSchema}
									data={academicDegrees?.find((d) => d.id === selectedAcademicDegreeId) as Record<string, unknown>}
									onEdit={() => setIsAcademicDegreeEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Certificate Modal */}
				{selectedCertificateId && (
					<Dialog open={!!selectedCertificateId} onOpenChange={handleCertificateModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isCertificateEditing ? "Zertifikat bearbeiten" : "Zertifikat Details"}
								</DialogTitle>
							</DialogHeader>
							{isCertificateEditing ? (
								<DynamicForm
									schema={{
										fields: getCertificateFormFields(),
										onSubmit: handleUpdateCertificate,
									}}
									defaultValues={{
										...certificates?.find((c) => c.id === selectedCertificateId),
										employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
									}}
								/>
							) : (
								<DetailView
									schema={certificateDetailSchema}
									data={(() => {
										const selectedCertificate = certificates?.find((c) => c.id === selectedCertificateId);
										if (!selectedCertificate) return {};
										return {
											employeeDisplayName: `${profile?.foreName} ${profile?.lastName}`,
											certificateTitle: selectedCertificate.certificate?.title || "-",
											certificateCategory: selectedCertificate.certificate?.category || "-",
											certificateDeeplink: selectedCertificate.certificate?.deeplink || "-",
											certificateSalesCertificate: selectedCertificate.certificate?.salesCertificate || false,
											validUntil: selectedCertificate.validUntil,
											issuer: selectedCertificate.issuer || "-"
										};
									})()}
									onEdit={() => setIsCertificateEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Project Activity Modal */}
				{selectedProjectActivityId && (
					<Dialog open={!!selectedProjectActivityId} onOpenChange={handleProjectActivityModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isProjectActivityEditing ? "Projektaktivität bearbeiten" : "Projektaktivität Details"}
								</DialogTitle>
							</DialogHeader>
							{isProjectActivityEditing ? (
								<DynamicForm
									schema={{
										fields: getProjectActivityFormFields(),
										onSubmit: handleUpdateProjectActivity,
									}}
									defaultValues={(() => {
										console.log('Selected Project Activity ID:', selectedProjectActivityId);
										const selected = projectActivities?.find((p) => p.id === selectedProjectActivityId);
										console.log('Found Selected Activity:', selected);
										if (!selected) return projectActivityDefaultValues;
										return {
											...selected,
											employeeRoleID: selected.employeeRole?.id || "",
										};
									})()}
								/>
							) : (
								<DetailView
									schema={projectActivityDetailSchema}
									data={(() => {
										const selected = projectActivities?.find((p) => p.id === selectedProjectActivityId);
										if (!selected) return {};
										const data = {
											employeeName: selected.employee ? `${selected.employee.foreName} ${selected.employee.lastName}` : "-",
											projectTitle: selected.project?.title || "-",
											employeeRole: selected.employeeRole?.employeeRoleShort || "-",
											description: selected.description || "-",
											operationalPeriodStart: selected.operationalPeriodStart,
											operationalPeriodEnd: selected.operationalPeriodEnd,
											operationalDays: selected.operationalDays || 0,
										};
										console.log('Project Activity Detail Data:', {
											selected,
											transformedData: data
										});
										return data;
									})()}
									onEdit={() => setIsProjectActivityEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Skill Modal */}
				{selectedSkillId && (
					<Dialog open={!!selectedSkillId} onOpenChange={handleSkillModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isSkillEditing ? "Fähigkeit bearbeiten" : "Fähigkeit Details"}
								</DialogTitle>
							</DialogHeader>
							{isSkillEditing ? (
								<DynamicForm
									schema={{
										fields: getSkillFormFields(),
										onSubmit: handleUpdateSkill,
									}}
									defaultValues={
										skills?.find((s) => s.id === selectedSkillId) ||
										skillDefaultValues
									}
								/>
							) : (
								<DetailView
									schema={skillDetailSchema}
									data={(() => {
										const selectedSkill = skills?.find((s) => s.id === selectedSkillId);
										if (!selectedSkill) return {};
										return {
											...selectedSkill,
											employeeName: selectedSkill.employees?.[0]
												? `${selectedSkill.employees[0].foreName} ${selectedSkill.employees[0].lastName}`
												: "-",
											skillName: selectedSkill.skills?.title || "-",
										};
									})()}
									onEdit={() => setIsSkillEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Professional Background Modal */}
				{selectedProfBackgroundId && (
					<Dialog open={!!selectedProfBackgroundId} onOpenChange={handleProfBackgroundModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isProfBackgroundEditing ? "Beruflichen Hintergrund bearbeiten" : "Beruflicher Hintergrund Details"}
								</DialogTitle>
							</DialogHeader>
							{isProfBackgroundEditing ? (
								<DynamicForm
									schema={{
										fields: getProfBackgroundFormFields(),
										onSubmit: handleUpdateProfBackground,
									}}
									defaultValues={{
										...profBackground?.find((p) => p.id === selectedProfBackgroundId),
										employeeDisplayName: `${profile.foreName} ${profile.lastName}`,
									}}
								/>
							) : (
								<DetailView
									schema={profBackgroundDetailSchema}
									data={(() => {
										const selected = profBackground?.find((p) => p.id === selectedProfBackgroundId);
										if (!selected) return {};
										return {
											...selected,
											employeeName: `${profile.foreName} ${profile.lastName}`,
											executivePosition: typeof selected.executivePosition === 'boolean' ? (selected.executivePosition ? "Ja" : "Nein") : "-",
											industrySector: selected.industrySector?.industrySector || "-",
										};
									})()}
									onEdit={() => setIsProfBackgroundEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* External Project Modal */}
				{selectedExternalProjectId && (
					<Dialog open={!!selectedExternalProjectId} onOpenChange={handleExternalProjectModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isExternalProjectEditing ? "Externe Projektaktivität bearbeiten" : "Externe Projektaktivität Details"}
								</DialogTitle>
							</DialogHeader>
							{isExternalProjectEditing ? (
								<DynamicForm
									schema={{
										fields: getExternalProjectFormFields(),
										onSubmit: handleUpdateExternalProject,
									}}
									defaultValues={
										externalProjects?.find((p) => p.id === selectedExternalProjectId) ||
										externalProjectDefaultValues
									}
								/>
							) : (
								<DetailView
									schema={externalProjectDetailSchema}
									data={(() => {
										const selected = externalProjects?.find((p) => p.id === selectedExternalProjectId);
										if (!selected) return {};
										return {
											...selected,
											employeeIDs: selected.employee ? `${selected.employee.foreName} ${selected.employee.lastName}` : "-",
											professionalBackgroundIDs: selected.professionalBackground?.position || "-",
											employeeProjectRole: selected.employeeProjectRole || "-",
											projectStart: selected.projectStart ? new Date(selected.projectStart).toLocaleDateString("de-DE") : "-",
											projectEnd: selected.projectEnd ? new Date(selected.projectEnd).toLocaleDateString("de-DE") : "-",
											experienceIt: typeof selected.experienceIt === "boolean" ? (selected.experienceIt ? "Ja" : "Nein") : "-",
											experienceIs: typeof selected.experienceIs === "boolean" ? (selected.experienceIs ? "Ja" : "Nein") : "-",
											experienceItGs: typeof selected.experienceItGs === "boolean" ? (selected.experienceItGs ? "Ja" : "Nein") : "-",
											experienceGps: typeof selected.experienceGps === "boolean" ? (selected.experienceGps ? "Ja" : "Nein") : "-",
											experienceOther: typeof selected.experienceOther === "boolean" ? (selected.experienceOther ? "Ja" : "Nein") : "-",
										};
									})()}
									onEdit={() => setIsExternalProjectEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Vocational Modal */}
				{selectedVocationalId && (
					<Dialog open={!!selectedVocationalId} onOpenChange={handleVocationalModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isVocationalEditing ? "Ausbildung bearbeiten" : "Ausbildung Details"}
								</DialogTitle>
							</DialogHeader>
							{isVocationalEditing ? (
								<DynamicForm
									schema={{
										fields: getVocationalFormFields(),
										onSubmit: handleUpdateVocational,
									}}
									defaultValues={{
										...vocational?.find((v) => v.id === selectedVocationalId),
										employeeDisplayName: `${profile.foreName} ${profile.lastName}`,
									}}
								/>
							) : (
								<DetailView
									schema={vocationalDetailSchema}
									data={(() => {
										const selected = vocational?.find((v) => v.id === selectedVocationalId);
										if (!selected) return {};
										return {
											...selected,
											employee: selected.employee,
											industrySector: selected.industrySector?.industrySector || "-",
											voccationalMINT: typeof selected.voccationalMINT === "boolean" ? (selected.voccationalMINT ? "Ja" : "Nein") : "-",
											voccationalStart: selected.voccationalStart ? new Date(selected.voccationalStart).toLocaleDateString("de-DE") : "-",
											voccationalEnd: selected.voccationalEnd ? new Date(selected.voccationalEnd).toLocaleDateString("de-DE") : "-",
										};
									})()}
									onEdit={() => setIsVocationalEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Training Modal */}
				{selectedTrainingId && (
					<Dialog open={!!selectedTrainingId} onOpenChange={handleTrainingModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isTrainingEditing ? "Schulung bearbeiten" : "Schulung Details"}
								</DialogTitle>
							</DialogHeader>
							{isTrainingEditing ? (
								<DynamicForm
									schema={{
										fields: getEmployeeTrainingFormFields(),
										onSubmit: handleUpdateTraining,
									}}
									defaultValues={
										employeeTrainings?.find((t) => t.id === selectedTrainingId) ||
										employeeTrainingDefaultValues
									}
								/>
							) : (
								<DetailView
									schema={employeeTrainingDetailSchema}
									data={(() => {
										const selectedTraining = employeeTrainings?.find((t) => t.id === selectedTrainingId);
										if (!selectedTraining) return {};
										return {
											...selectedTraining,
											employeeName: selectedTraining.employee
												? `${selectedTraining.employee.foreName} ${selectedTraining.employee.lastName}`
												: "-",
											trainingTitle: selectedTraining.training?.trainingTitle || "-",
											passed: typeof selectedTraining.passed === 'boolean' ? (selectedTraining.passed ? "Ja" : "Nein") : "-",
										};
									})()}
									onEdit={() => setIsTrainingEditing(true)}
								/>
							)}
						</DialogContent>
					</Dialog>
				)}

				{/* Security Clearance Modal */}
				{selectedSecurityClearanceId && (
					<Dialog open={!!selectedSecurityClearanceId} onOpenChange={handleSecurityClearanceModalClose}>
						<DialogContent className="w-full max-w-2xl overflow-y-auto max-h-[90vh]">
							<DialogHeader>
								<DialogTitle>
									{isSecurityClearanceEditing ? "Sicherheitsüberprüfung bearbeiten" : "Sicherheitsüberprüfung Details"}
								</DialogTitle>
							</DialogHeader>
							{isSecurityClearanceEditing ? (
								<DynamicForm
									schema={{
										fields: securityClearanceFormConfig.sections[0].fields.filter(field => field.name !== "employeeIDs"),
										onSubmit: handleUpdateSecurityClearance,
									}}
									defaultValues={
										(securityClearances?.find((sc) => sc.id === selectedSecurityClearanceId)) ||
										{
											employeeIDs: id,
											securityClearanceType: "",
											securityClearanceLevel: "",
											applicationDate: new Date(),
											approved: false,
										}
									}
								/>
							) : (
								<DetailView
									schema={securityClearanceDetailSchema}
									data={(() => {
										const selectedClearance = securityClearances?.find((sc) => sc.id === selectedSecurityClearanceId);
										if (!selectedClearance) return {};
										return selectedClearance;
									})() as Record<string, unknown>}
									onEdit={() => setIsSecurityClearanceEditing(true)}
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
