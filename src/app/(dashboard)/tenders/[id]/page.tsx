"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, use, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DynamicForm } from "@/components/form/dynamic-form";
import { DetailView } from "@/components/detail/DetailView";
import { DataTable } from "@/components/table/table";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { notFound } from "next/navigation";
import { z } from "zod";
import { tenderSchema } from "@/server/controllers/tender/schema";
import { getFormFields, defaultValues as tenderDefaultValues } from "@/server/controllers/tender/form-config";
import { detailSchema as tenderDetailSchema } from "@/server/controllers/tender/detail-config";

// Import sub-module configs
import { getConditionsOfParticipationFormFields, conditionsOfParticipationDefaultValues } from "@/server/controllers/tender/conditionsOfParticipation/form-config";
import { getFormFields as getRiskQualityProcessFormFields, defaultValues as riskQualityProcessDefaultValues } from "@/server/controllers/tender/RiskQualityProcess/form-config";
import { getFormFields as getCallToTenderDeliverablesFormFields, defaultValues as callToTenderDeliverablesDefaultValues } from "@/server/controllers/tender/callToTenderDeliverables/form-config";
import { getFormFields as getEmployeeFormFields, defaultValues as employeeDefaultValues, useFormData } from "@/server/controllers/tender/CallToTenderEmployee/form-config";
import { getFormFields as getOrganisationFormFields, defaultValues as organisationDefaultValues } from "@/server/controllers/tender/organisations/form-config";
import { getFormFields as getLessonsLearnedFormFields, defaultValues as lessonsLearnedDefaultValues } from "@/server/controllers/tender/lessonsLearned/form-config";
import { getFormFields as getTaskFormFields, defaultValues as taskDefaultValues } from "@/server/controllers/tasks/form-config";
import { taskDetailConfig } from "@/server/controllers/tasks/detail-config";
import { conditionsOfParticipationDetailConfig } from "@/server/controllers/tender/conditionsOfParticipation/detail-config";

// Import table configs
import { getOrganisationColumns } from "@/server/controllers/tender/organisations/table-config";
import { getCallToTenderEmployeeColumns } from "@/server/controllers/tender/CallToTenderEmployee/table-config";
import { getRiskQualityProcessColumns } from "@/server/controllers/tender/RiskQualityProcess/table-config";
import { columns as lessonsLearnedColumns } from "@/server/controllers/tender/lessonsLearned/table-config";
import { columns as taskColumns } from "@/server/controllers/tasks/table-config";

// Import components
import { LotDivisionTree } from "@/components/lot-divisions/lot-division-tree";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Import schema types

import { riskQualityProcessSchema } from "@/server/controllers/tender/RiskQualityProcess/schema";
import { conditionsOfParticipationSchema } from "@/server/controllers/tender/conditionsOfParticipation/schema";

import { detailSchema as organisationDetailSchema } from "@/server/controllers/tender/organisations/detail-config";
import { TRPCError } from "@trpc/server";
import { getTableColumns as getCallToTenderDeliverablesTableConfig } from "@/server/controllers/tender/callToTenderDeliverables/table-config";

import { type CallToTenderDeliverables } from "@/server/controllers/tender/callToTenderDeliverables/schema";

import { callToTenderDeliverablesDetailConfig } from "@/server/controllers/tender/callToTenderDeliverables/detail-config";
import { ConditionsTree } from "@/components/conditions/conditions-tree";
import { getConditionsOfParticipationTypeFormFields, conditionsOfParticipationTypeDefaultValues } from "@/server/controllers/tender/conditionsOfParticipationType/form-config";
import { conditionsOfParticipationTypeDetailConfig } from "@/server/controllers/tender/conditionsOfParticipationType/detail-config";

import { type CreateLot, type UpdateLot } from "@/server/controllers/tender/lot/schema";

import { getLotFormFields } from "@/server/controllers/tender/lot/form-config";
import { getWorkpackageFormFields } from "@/server/controllers/tender/workpackage/form-config";
import { lotDetailConfig } from "@/server/controllers/tender/lot/detail-config";
import { workpackageDetailConfig } from "@/server/controllers/tender/workpackage/detail-config";

import gsap from "gsap";
import { getFormFields as getCallToTenderProjectFormFields, defaultValues as callToTenderProjectDefaultValues } from "@/server/controllers/tender/CallToTenderProject/form-config";
import { getCallToTenderProjectColumns } from "@/server/controllers/tender/CallToTenderProject/table-config";
import { detailSchema as callToTenderProjectDetailConfig } from "@/server/controllers/tender/CallToTenderProject/detail-config";

import { detailSchema as employeeDetailSchema } from "@/server/controllers/tender/CallToTenderEmployee/detail-config";
import { generateSearchQuery } from "@/lib/search-query";
import { type CallToTenderProject } from "@/server/controllers/tender/CallToTenderProject/schema";

import { lessonsLearnedDetailConfig } from "@/server/controllers/tender/lessonsLearned/detail-config";
import { detailSchema as riskQualityProcessDetailConfig } from "@/server/controllers/tender/RiskQualityProcess/detail-config";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type UpdateTenderData = z.infer<typeof tenderSchema>;

// Add type definitions
interface Lot {
  id: string;
  number: string | null;
  title: string | null;
  description: string;
  volumeEuro: number | null;
  volumePT: number | null;
  status: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lotIdentifier: string | null;
  parentLotID: string | null;
  callToTenderID: string | null;
  workpackages?: { id: string }[];
}

type TaskTableItem = {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  assignedTo: {
    id: string;
    foreName: string;
    lastName: string;
  } | null;
  createdBy: {
    id: string;
    foreName: string;
    lastName: string;
  };
  tender: {
    id: string;
    title: string;
  };
  createdAt: Date | null;
  updatedAt: Date | null;
  dueDate: Date | null;
};

interface Workpackage {
  id: string;
  number: string | null;
  title: string | null;
  description: string;
  volumeEuro: number | null;
  volumePT: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  lotID: string;
}

interface WorkpackageFormData {
  number: string | null;
  title: string | null;
  description: string;
  volumeEuro: number | null;
  volumePT: number | null;
}

const Page = ({ params }: PageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const resolvedParams = use(params);
  const id = resolvedParams?.id;
  const utils = api.useUtils();
  const { employeeRoles } = useFormData();
  const createProjectButtonRef = useRef<HTMLButtonElement>(null);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [addingLot, setAddingLot] = useState(false);
  const [addingWorkpackage, setAddingWorkpackage] = useState(false);
  const [addingCondition, setAddingCondition] = useState(false);
  const [addingDeliverable, setAddingDeliverable] = useState(false);
  const [addingRiskQualityProcess, setAddingRiskQualityProcess] = useState(false);

  const [addingOrganisation, setAddingOrganisation] = useState(false);
  const [addingEmployee, setAddingEmployee] = useState(false);
  const [addingLessonsLearned, setAddingLessonsLearned] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [addingProject, setAddingProject] = useState(false);
  const [tasks, setTasks] = useState<TaskTableItem[]>([]);

  // Selected item states
  const [selectedLotId, setSelectedLotId] = useState<string | null>(null);
  const [selectedWorkpackageId, setSelectedWorkpackageId] = useState<string | null>(null);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<string | null>(null);
  const [selectedDeliverableId, setSelectedDeliverableId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [selectedLessonsLearnedId, setSelectedLessonsLearnedId] = useState<string | null>(null);
  const [selectedRiskQualityProcessId, setSelectedRiskQualityProcessId] = useState<string | null>(null);

  // Editing states
  const [isLotEditing, setIsLotEditing] = useState(false);
  const [isWorkpackageEditing, setIsWorkpackageEditing] = useState(false);
  const [isOrganisationEditing, setIsOrganisationEditing] = useState(false);
  const [isDeliverableEditing, setIsDeliverableEditing] = useState(false);
  const [isProjectEditing, setIsProjectEditing] = useState(false);
  const [isTaskEditing, setIsTaskEditing] = useState(false);
  const [isRiskQualityProcessEditing, setIsRiskQualityProcessEditing] = useState(false);
  const [isLessonsLearnedEditing, setIsLessonsLearnedEditing] = useState(false);

  // New state variables
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [selectedConditionId, setSelectedConditionId] = useState<string | null>(null);
  const [addingType, setAddingType] = useState(false);
  const [isTypeEditing, setIsTypeEditing] = useState(false);
  const [isConditionEditing, setIsConditionEditing] = useState(false);

  // Data fetching
  const { data: tender, isLoading, error: tenderError } = api.tenders.getById.useQuery(
    { id: id ?? "" },
    {
      retry: false,
      enabled: !!id,
    }
  );



  const { data: conditions } = api.conditionsOfParticipation.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  const { data: riskQualityProcesses } = api.riskQualityProcess.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  const { data: organisations } = api.callToTenderOrganisations.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  const { data: employees } = api.callToTenderEmployee.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  const { data: availableOrganisations } = api.organisations.all.useQuery();

  const { data: deliverables, error: deliverablesError } = api.callToTenderDeliverables.getByTenderId.useQuery(
    { callToTenderId: id ?? "" },
    {
      enabled: !!id && !!tender,
      retry: false,
    }
  );

  const { data: lessonsLearned } = api.lessonsLearned.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  const { data: tasksData } = api.tasks.getAll.useQuery(
    { tenderId: id }
  );

  const { data: conditionsOfParticipationTypes } = api.conditionsOfParticipationType.getByTenderId.useQuery(
    { tenderId: id ?? "" },
    { enabled: !!id }
  );

  // Fetch CallToTenderProject data for this tender
  const { data: callToTenderProjects } = api.callToTenderProject.getByTenderId.useQuery(
    { callToTenderId: id ?? "" },
    { enabled: !!id }
  );

  useEffect(() => {
    if (tasksData) {
      setTasks(
        tasksData.map((task) => ({
          id: task.id,
          title: task.title ?? "",
          description: task.description ?? null,
          status: (["TODO", "IN_PROGRESS", "DONE"].includes(task.status) ? task.status : "TODO") as "TODO" | "IN_PROGRESS" | "DONE",
          assignedTo: task.assignedTo
            ? {
                id: task.assignedTo.id,
                foreName: task.assignedTo.foreName,
                lastName: task.assignedTo.lastName,
              }
            : null,
          createdBy: {
            id: task.createdBy.id,
            foreName: task.createdBy.foreName,
            lastName: task.createdBy.lastName,
          },
          tender: {
            id: task.tender.id,
            title: task.tender.title ?? "",
          },
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          dueDate: task.dueDate ?? null,
        }))
      );
    }
  }, [tasksData]);

  // Mutations
  const updateTender = api.tenders.update.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      setIsEditing(false);
      toast.success("Ausschreibung erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren der Ausschreibung: ${error.message}`);
    },
  });

  const createLot = api.lot.create.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      setAddingLot(false);
      toast.success("Los erfolgreich erstellt");
    },
    onError: (error: { message: string }) => {
      toast.error(`Fehler beim Erstellen des Loses: ${error.message}`);
    },
  });

  const updateLot = api.lot.update.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      setAddingLot(false);
      setIsLotEditing(false);
      toast.success("Los erfolgreich aktualisiert");
    },
    onError: (error: { message: string }) => {
      toast.error(`Fehler beim Aktualisieren des Loses: ${error.message}`);
    },
  });

  const deleteLot = api.lot.delete.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      toast.success("Los erfolgreich gelöscht");
    },
    onError: (error: { message: string }) => {
      toast.error(`Fehler beim Löschen des Loses: ${error.message}`);
    },
  });

  

  const updateWorkpackage = api.workpackage.update.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      setAddingWorkpackage(false);
      toast.success("Arbeitspaket erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren des Arbeitspakets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deleteWorkpackage = api.workpackage.delete.useMutation({
    onSuccess: () => {
      utils.tenders.getById.invalidate({ id: id ?? "" });
      toast.success("Arbeitspaket erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen des Arbeitspakets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createCondition = api.conditionsOfParticipation.create.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipation.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingCondition(false);
      toast.success("Teilnahmebedingung erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen der Teilnahmebedingung: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateCondition = api.conditionsOfParticipation.update.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipation.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingCondition(false);
      setSelectedConditionId(null);
      toast.success("Teilnahmebedingung erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren der Teilnahmebedingung: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleCreateCondition = async (data: unknown) => {
    const createData = { ...(data as z.infer<typeof conditionsOfParticipationSchema>) };
    
    // Generate search query
    const searchQuery = generateSearchQuery(createData);

    // Create sanitized data matching schema
    const sanitizedData = {
      title: createData.title,
      duration: createData.duration ?? null,
      volumeEuro: createData.volumeEuro ?? null,
      requirements: createData.requirements ?? null,
      experienceIt: createData.experienceIt ?? null,
      experienceIs: createData.experienceIs ?? null,
      experienceItGs: createData.experienceItGs ?? null,
      experienceGPS: createData.experienceGPS ?? null,
      experienceOther: createData.experienceOther ?? null,
      experienceAll: createData.experienceAll ?? null,
      executivePosition: createData.executivePosition ?? false,
      academicDegree: createData.academicDegree ?? [],
      academicStudy: createData.academicStudy ?? [],
      certificateIDs: createData.certificateIDs ?? [],
      customCertificates: createData.customCertificates ?? [],
      industrySectorIDs: createData.industrySectorIDs ?? [],
      customIndustrySectors: createData.customIndustrySectors ?? [],
      criterionType: createData.criterionType ?? "MUST",
      conditionsOfParticipationTypeIDs: selectedTypeId ?? "",
      callToTenderIDs: id ?? "",
      searchQuery
    };

    await createCondition.mutate(sanitizedData);
  };

  const handleUpdateCondition = async (data: unknown) => {
    const { id, ...updateData } = data as z.infer<typeof conditionsOfParticipationSchema>;
    
    // Generate a proper search query using all relevant fields
    const searchQuery = generateSearchQuery(updateData);

    const sanitizedData = {
      title: updateData.title ?? undefined,
      duration: updateData.duration ?? undefined,
      volumeEuro: updateData.volumeEuro ?? undefined,
      requirements: updateData.requirements ?? undefined,
      experienceIt: updateData.experienceIt ?? undefined,
      experienceIs: updateData.experienceIs ?? undefined,
      experienceItGs: updateData.experienceItGs ?? undefined,
      experienceGPS: updateData.experienceGPS ?? undefined,
      experienceOther: updateData.experienceOther ?? undefined,
      experienceAll: updateData.experienceAll ?? undefined,
      executivePosition: updateData.executivePosition ?? false,
      academicDegree: updateData.academicDegree ?? [],
      academicStudy: updateData.academicStudy ?? [],
      certificateIDs: updateData.certificateIDs ?? [],
      customCertificates: updateData.customCertificates ?? [],
      industrySectorIDs: updateData.industrySectorIDs ?? [],
      customIndustrySectors: updateData.customIndustrySectors ?? [],
      criterionType: updateData.criterionType ?? "MUST",
      conditionsOfParticipationTypeIDs: selectedTypeId ?? undefined,
      callToTenderIDs: id ?? undefined,
      searchQuery
    };

    if (selectedConditionId) {
      await updateCondition.mutate({
        id: selectedConditionId,
        ...sanitizedData,
      });
    }
  };

  const deleteCondition = api.conditionsOfParticipation.delete.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipation.getByTenderId.invalidate({ tenderId: id ?? "" });
      toast.success("Bedingung erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen der Bedingung: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleDeleteCondition = async (id: string) => {
    try {
      await deleteCondition.mutate({ id });
    } catch {
      // Error is already handled by the mutation
    }
  };

  const createDeliverable = api.callToTenderDeliverables.create.useMutation({
    onSuccess: () => {
      utils.callToTenderDeliverables.getByTenderId.invalidate({ callToTenderId: id ?? "" });
      setIsDeliverableEditing(false);
      toast.success("Liefergegenstand erfolgreich erstellt");
    },
  });

  const updateDeliverable = api.callToTenderDeliverables.update.useMutation({
    onSuccess: () => {
      utils.callToTenderDeliverables.getByTenderId.invalidate({ callToTenderId: id ?? "" });
      setIsDeliverableEditing(false);
      toast.success("Liefergegenstand erfolgreich aktualisiert");
    },
  });

  const createRiskQualityProcess = api.riskQualityProcess.create.useMutation({
    onSuccess: () => {
      utils.riskQualityProcess.getByTenderId.invalidate({ tenderId: id ?? "" });
      setIsRiskQualityProcessEditing(false);
      toast.success("Risiko & Qualität Prozess erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen des Risiko & Qualität Prozesses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createOrganisation = api.callToTenderOrganisations.create.useMutation({
    onSuccess: () => {
      utils.callToTenderOrganisations.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingOrganisation(false);
      toast.success("Organisation erfolgreich hinzugefügt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Hinzufügen der Organisation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateOrganisation = api.callToTenderOrganisations.update.useMutation({
    onSuccess: () => {
      utils.callToTenderOrganisations.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingOrganisation(false);
      toast.success("Organisation erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren der Organisation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createEmployee = api.callToTenderEmployee.create.useMutation({
    onSuccess: () => {
      utils.callToTenderEmployee.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingEmployee(false);
      toast.success("Mitarbeiter erfolgreich hinzugefügt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Hinzufügen des Mitarbeiters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createTask = api.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.getAll.invalidate({ tenderId: id });
      setAddingTask(false);
      toast.success("Aufgabe erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen der Aufgabe: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createLessonsLearned = api.lessonsLearned.create.useMutation({
    onSuccess: () => {
      utils.lessonsLearned.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingLessonsLearned(false);
      toast.success("Lessons Learned erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen des Lessons Learned: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const createType = api.conditionsOfParticipationType.create.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipationType.getByTenderId.invalidate({ tenderId: id ?? "" });
      setAddingType(false);
      toast.success("Typ erfolgreich erstellt");
    },
    onError: (error) => {
      toast.error(`Fehler beim Erstellen des Typs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateType = api.conditionsOfParticipationType.update.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipationType.getByTenderId.invalidate({ tenderId: id ?? "" });
      setSelectedTypeId(null);
      setIsTypeEditing(false);
      toast.success("Typ erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren des Typs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const deleteType = api.conditionsOfParticipationType.delete.useMutation({
    onSuccess: () => {
      utils.conditionsOfParticipationType.getByTenderId.invalidate({ tenderId: id ?? "" });
      toast.success("Typ erfolgreich gelöscht");
    },
    onError: (error) => {
      toast.error(`Fehler beim Löschen des Typs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleDeleteType = async (id: string) => {
    try {
      await deleteType.mutate({ id });
    } catch {
      // Error is already handled by the mutation
    }
  };

  const createProjectFromTender = api.tenders.createProjectFromTender.useMutation({
    onSuccess: (project) => {
      toast.success("Projekt erfolgreich erstellt");
      // Redirect to the project page
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      // Handle specific error cases
      if (error.data?.code === 'BAD_REQUEST') {
        if (error.message.includes('already exists')) {
          toast.error("Ein Projekt existiert bereits für diese Ausschreibung");
        } else if (error.message.includes('won tenders')) {
          toast.error("Nur gewonnene Ausschreibungen können in Projekte umgewandelt werden");
        } else {
          toast.error("Fehler beim Erstellen des Projekts: " + error.message);
        }
      } else {
        toast.error("Ein unerwarteter Fehler ist aufgetreten");
      }
      // Close the dialog if it's open
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        (dialog as HTMLDialogElement).close();
      }
    },
  });

  const createProject = api.callToTenderProject.create.useMutation({
    onSuccess: () => {
      utils.callToTenderProject.getByTenderId.invalidate({ callToTenderId: id ?? "" });
      setAddingProject(false);
      toast.success("Projekt erfolgreich hinzugefügt");
    },
  });

  const updateProject = api.callToTenderProject.update.useMutation({
    onSuccess: () => {
      utils.callToTenderProject.getByTenderId.invalidate({ callToTenderId: id ?? "" });
      setAddingProject(false);
      setIsProjectEditing(false);
      toast.success("Projekt erfolgreich aktualisiert");
    },
  });

  // Add GSAP animation effect
  useEffect(() => {
    if (tender?.status === "gewonnen" && !tender.projectCallToTender?.length && createProjectButtonRef.current) {
      const button = createProjectButtonRef.current;
      
      // Create the pulse animation
      gsap.to(button, {
        scale: 1.10,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut"
      });
    }
  }, [tender?.status, tender?.projectCallToTender]);

  // Handle tender not found error
  useEffect(() => {
    if (tenderError?.data?.code === 'NOT_FOUND') {
      toast.error("Ausschreibung nicht gefunden", {
        position: "top-right",
        duration: 3000,
      });
      router.push('/tenders/current');
    }
  }, [tenderError, router]);

  // Event handlers
  const handleTabChange = (value: string) => {
    router.push(`/tenders/${id}?tab=${value}`);
  };

  const handleUpdateTender = async (data: unknown) => {
    try {
      const formData = data as UpdateTenderData;
      await updateTender.mutateAsync({
        id,
        data: {
          title: formData.title,
          type: formData.type,
          shortDescription: formData.shortDescription,
          awardCriteria: formData.awardCriteria,
          status: formData.status,
          offerDeadline: formData.offerDeadline,
          questionDeadline: formData.questionDeadline,
          bindingDeadline: formData.bindingDeadline,
          volumeEuro: formData.volumeEuro,
          volumePT: formData.volumePT,
          volumeHours: formData.volumeHours,
          successChance: formData.successChance,
          keywords: formData.keywords,
          notes: formData.notes,
          hyperlink: formData.hyperlink,
          websiteTenderPlattform: formData.websiteTenderPlattform,
          internalPlattform: formData.internalPlattform,
          standards: formData.standards,
          volumeHoursTotal: formData.volumeHoursTotal,
          approvedMargin: formData.approvedMargin,
          firstContactDate: formData.firstContactDate,
          serviceDate: formData.serviceDate,
          evbItContractNumber: formData.evbItContractNumber,
          evbItContractLocation: formData.evbItContractLocation,
          ocid: formData.ocid,
          noticeType: formData.noticeType,
          releaseDate: formData.releaseDate,
          tag: formData.tag,
          isFrameworkContract: formData.isFrameworkContract,
          serviceTitle: formData.serviceTitle,
          serviceDetails: formData.serviceDetails,
          servicePeriodStart: formData.servicePeriodStart,
          servicePeriodEnd: formData.servicePeriodEnd,
          processor: formData.processor,
          technicalRequirements: formData.technicalRequirements,
          deliverables: formData.deliverables,
          participationConditions: formData.participationConditions,
          legalBasis: formData.legalBasis,
          obligations: formData.obligations,
          qualificationRequirements: formData.qualificationRequirements,
          exclusionCriteria: formData.exclusionCriteria,
        },
      });
      toast.success("Tender updated successfully");
    } catch {
      toast.error("Failed to update tender");
    }
  };

  

  const handleCreateDeliverable = async (data: unknown) => {
    try {
      const formData = data as { deliverablesIDs: string };
      await createDeliverable.mutateAsync({
        callToTenderIDs: id ?? null,
        deliverablesIDs: formData.deliverablesIDs,
      });
      toast.success("Call to tender deliverable created successfully");
    } catch (error) {
      if (error instanceof TRPCError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create call to tender deliverable");
      }
    }
  };

  const handleCreateRiskQualityProcess = async (data: unknown) => {
    const createData = { ...(data as z.infer<typeof riskQualityProcessSchema>) };
    delete createData.id;
    delete createData.createdAt;
    delete createData.updatedAt;
    delete createData.organisation;
    const organisationID = createData.organisationID;
    delete createData.organisationID;
    
    await createRiskQualityProcess.mutate({
      ...createData,
      organisationID: organisationID ?? undefined,
      callToTenderID: id ?? "",
    });
  };

  const handleCreateOrganisation = async (data: unknown) => {
    const formData = data as { organisationIDs: string; organisationRole: string };
    await createOrganisation.mutate({
      organisationRole: formData.organisationRole || '',
      organisationIDs: formData.organisationIDs || '',
      callToTenderIDs: id ?? '',
    });
  };

  const handleCreateEmployee = async (data: unknown) => {
    const formData = data as { employeeCallToTenderRole: string; employeeId: string };
    await createEmployee.mutate({
      employeeCallToTenderRole: formData.employeeCallToTenderRole || '',
      employeeId: formData.employeeId || '',
      callToTenderId: id ?? '',
    });
  };

  const handleCreateTask = async (data: unknown) => {
    const formData = data as {
      title: string;
      description: string;
      status: "TODO" | "IN_PROGRESS" | "DONE";
      assignedToId?: string;
      dueDate?: Date;
    };

    try {
      await createTask.mutate({
        title: formData.title,
        description: formData.description || "",
        status: formData.status || "TODO",
        assignedToId: formData.assignedToId,
        tenderId: id ?? null,
        dueDate: formData.dueDate,
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task. Please make sure you are logged in and have an employee record.");
    }
  };

  const handleCreateLessonsLearned = async (data: unknown) => {
    const formData = data as { lessonsLearned: string };
    await createLessonsLearned.mutate({
      lessonsLearned: formData.lessonsLearned || '',
      tenderId: id ?? '',
    });
  };


  const handleTaskModalOpen = (id: string | number) => {
    setSelectedTaskId(String(id));
    setIsTaskEditing(true);
  };

  const handleLessonsLearnedModalOpen = (id: string | number) => {
    setSelectedLessonsLearnedId(String(id));
    setIsLessonsLearnedEditing(true);
    setAddingLessonsLearned(false);
  };

  const handleView = (id: string | number) => {
    if (typeof id === "string") {
      setSelectedOrganisationId(id);
      setIsOrganisationEditing(false);
    }
  };

  const handleCloseOrganisationModal = () => {
    setSelectedOrganisationId(null);
    setIsOrganisationEditing(false);
  };

  const handleOrganisationFormSubmit = async (data: unknown) => {
    if (selectedOrganisationId) {
      await updateOrganisation.mutate({
        id: selectedOrganisationId,
        ...(typeof data === 'object' && data !== null ? data : {}),
      });
    }
  };

  const handleDeliverableFormSubmit = async (data: unknown) => {
    if (selectedDeliverableId) {
      await updateDeliverable.mutate({
        id: selectedDeliverableId,
        ...(data as Record<string, unknown>),
      });
    }
  };

  // Defensive mapping for lots and workpackages to ensure all required fields are present
  const lotsForTree = (tender?.lots || []).map(lot => ({
    id: lot.id,
    number: lot.number ?? null,
    title: lot.title ?? null,
    description: lot.description ?? '',
    volumeEuro: lot.volumeEuro ?? null,
    volumePT: lot.volumePT ?? null,
    status: (lot as Lot).status ?? null,
    createdAt: (lot as Lot).createdAt ?? null,
    updatedAt: (lot as Lot).updatedAt ?? null,
    lotIdentifier: (lot as Lot).lotIdentifier ?? null,
    parentLotID: (lot as Lot).parentLotID ?? null,
    callToTenderID: (lot as Lot).callToTenderID ?? id ?? '',
    workpackages: lot.workpackages?.map(wp => wp.id) ?? [],
  }));

  const workpackagesForTree = (tender?.lots || []).flatMap(lot =>
    (lot.workpackages || []).map(wp => ({
      id: wp.id,
      number: wp.number ?? null,
      title: wp.title ?? null,
      description: wp.description ?? '',
      volumeEuro: wp.volumeEuro ?? null,
      volumePT: wp.volumePT ?? null,
      createdAt: (wp as Workpackage).createdAt ?? null,
      updatedAt: (wp as Workpackage).updatedAt ?? null,
      lotID: lot.id,
    }))
  );

  // Debug logging for lots and workpackages
  console.log('Lots for LotDivisionTree:', lotsForTree);
  console.log('Workpackages for LotDivisionTree:', workpackagesForTree);

  // Place this with other handler functions, before the return statement
  const handleRiskQualityProcessModalOpen = (id: string | number) => {
    setSelectedRiskQualityProcessId(String(id));
    setIsRiskQualityProcessEditing(true);
    setAddingRiskQualityProcess(false);
  };

  // Add handleEmployeeModalOpen function
  const handleEmployeeModalOpen = (id: string | number) => {
    setSelectedEmployeeId(String(id));
  };

  // Add handleDeliverableModalOpen function
  const handleDeliverableModalOpen = (id: string | number) => {
    setSelectedDeliverableId(String(id));
    setIsDeliverableEditing(false);
  };

  const handleCreateProject = async (data: unknown) => {
    const formData = data as { projectId: string; role?: string; description?: string; relevance?: string };
    await createProject.mutate({
      projectId: formData.projectId,
      callToTenderId: id ?? '',
      role: formData.role,
      description: formData.description,
      relevance: formData.relevance,
    });
  };

  const handleProjectModalOpen = (id: string | number) => {
    setSelectedProjectId(String(id));
    setIsProjectEditing(false);
  };

  // Add these mutations with other mutations
  const updateRiskQualityProcess = api.riskQualityProcess.update.useMutation({
    onSuccess: () => {
      utils.riskQualityProcess.getByTenderId.invalidate({ tenderId: id ?? "" });
      setIsRiskQualityProcessEditing(false);
      toast.success("Risiko & Qualität Prozess erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren des Risiko & Qualität Prozesses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const updateLessonsLearned = api.lessonsLearned.update.useMutation({
    onSuccess: () => {
      utils.lessonsLearned.getByTenderId.invalidate({ tenderId: id ?? "" });
      setIsLessonsLearnedEditing(false);
      toast.success("Lessons Learned erfolgreich aktualisiert");
    },
    onError: (error) => {
      toast.error(`Fehler beim Aktualisieren der Lessons Learned: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Loading and error states
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (tenderError) {
    if (tenderError.data?.code === 'NOT_FOUND') {
      return notFound();
    }
    return <div>Error loading tender: {tenderError.message}</div>;
  }

  if (!tender) {
    return notFound();
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-auto bg-background">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            {tender.title}
          </h1>
          <div className="flex gap-2">
            {tender.status === "gewonnen" && !tender.projectCallToTender?.length && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button ref={createProjectButtonRef}>Projekt erstellen</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Projekt erstellen</DialogTitle>
                  </DialogHeader>
                  <p className="py-4">
                    Möchten Sie ein neues Projekt aus dieser Ausschreibung erstellen?
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const dialog = document.querySelector('[role="dialog"]');
                        if (dialog) {
                          (dialog as HTMLDialogElement).close();
                        }
                      }}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      onClick={() => {
                        createProjectFromTender.mutate(
                          { id: tender.id },
                          {
                            onSuccess: () => {
                              toast.success("Projekt erfolgreich erstellt");
                              const dialog = document.querySelector('[role="dialog"]');
                              if (dialog) {
                                (dialog as HTMLDialogElement).close();
                              }
                            },
                            onError: (error) => {
                              toast.error("Fehler beim Erstellen des Projekts: " + error.message);
                            },
                          }
                        );
                      }}
                      disabled={createProjectFromTender.isPending}
                    >
                      {createProjectFromTender.isPending ? "Wird erstellt..." : "Erstellen"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            {tender.projectCallToTender?.[0] && (
              <Button
                variant="outline"
                onClick={() => router.push(`/projects/${tender.projectCallToTender?.[0]?.id}`)}
              >
                Zum Projekt
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-10">

            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="description">Leistungsumfang</TabsTrigger>
            <TabsTrigger value="conditions">Eignungskriterien</TabsTrigger>
            <TabsTrigger value="projects">Projekte</TabsTrigger>
            <TabsTrigger value="profiles">Profile</TabsTrigger>
            <TabsTrigger value="deliverables">Konzepte</TabsTrigger>
            <TabsTrigger value="organisations">Organisationen</TabsTrigger>
            <TabsTrigger value="quality">Risk & Quality</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="lessons">Lessons Learned</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="border-none shadow-none">
              {isEditing ? (
                <DynamicForm
                  schema={{
                    fields: getFormFields(),
                    onSubmit: handleUpdateTender,
                  }}
                  defaultValues={{
                    ...tenderDefaultValues,
                    ...tender,
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Übersicht</h2>
                  </div>
                  <DetailView
                    schema={tenderDetailSchema}
                    data={tender}
                    className="py-4"
                  />
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Leistungsbeschreibung</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    {/* Pass robustly mapped lots and workpackages to LotDivisionTree */}
                    <LotDivisionTree
                      lots={lotsForTree}
                      workpackages={workpackagesForTree}
                      onAddLot={(parentId) => {
                        setSelectedLotId(parentId || null);
                        setAddingLot(true);
                      }}
                      onAddWorkpackage={(lotId) => {
                        setSelectedLotId(lotId);
                        setAddingWorkpackage(true);
                      }}
                      onLotClick={(id) => {
                        setSelectedLotId(id);
                        setSelectedWorkpackageId(null);
                      }}
                      onWorkpackageClick={(id) => {
                        setSelectedWorkpackageId(id);
                        setSelectedLotId(null);
                      }}
                      onDeleteLot={async (id) => {
                        try {
                          await deleteLot.mutate({ id });
                          toast.success("Los erfolgreich gelöscht");
                        } catch (error) {
                          toast.error(`Fehler beim Löschen des Loses: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      onDeleteWorkpackage={async (id) => {
                        try {
                          await deleteWorkpackage.mutate({ id });
                          toast.success("Arbeitspaket erfolgreich gelöscht");
                        } catch (error) {
                          toast.error(`Fehler beim Löschen des Arbeitspakets: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        }
                      }}
                      selectedLotId={selectedLotId || undefined}
                      selectedWorkpackageId={selectedWorkpackageId || undefined}
                    />
                  </div>
                  
                  <div>
                    {selectedLotId && (
                      <Card className="p-4">
                        {isLotEditing ? (
                          <DynamicForm
                            schema={{
                              ...getLotFormFields(
                                id ?? '',
                                selectedLotId,
                                tender.lots?.filter(lot => lot.id !== selectedLotId).map(lot => ({
                                  id: lot.id,
                                  number: lot.number ?? '',
                                  title: lot.title ?? ''
                                })) ?? []
                              ),
                              onSubmit: async (data: unknown) => {
                                const formData = {
                                  id: selectedLotId,
                                  number: (data as Record<string, unknown>).number === '' ? null : (data as Record<string, unknown>).number as string,
                                  title: (data as Record<string, unknown>).title === '' ? null : (data as Record<string, unknown>).title as string,
                                  description: (data as Record<string, unknown>).description as string,
                                  volumeEuro: (data as Record<string, unknown>).volumeEuro ? Number((data as Record<string, unknown>).volumeEuro) : null,
                                  volumePT: (data as Record<string, unknown>).volumePT ? Number((data as Record<string, unknown>).volumePT) : null,
                                  parentLotID: (data as Record<string, unknown>).parentLotID === '' || (data as Record<string, unknown>).parentLotID === undefined || (data as Record<string, unknown>).parentLotID === null ? null : String((data as Record<string, unknown>).parentLotID),
                                } as UpdateLot;
                                await updateLot.mutate(formData);
                                setIsLotEditing(false);
                              },
                            }}
                            defaultValues={{
                              ...Object.assign({}, tender.lots?.find(l => l.id === selectedLotId) as Lot),
                              parentLotID: (tender.lots?.find(l => l.id === selectedLotId) as Lot)?.parentLotID ?? '',
                              number: tender.lots?.find(l => l.id === selectedLotId)?.number ?? '',
                              title: tender.lots?.find(l => l.id === selectedLotId)?.title ?? '',
                              description: tender.lots?.find(l => l.id === selectedLotId)?.description ?? '',
                              volumeEuro: tender.lots?.find(l => l.id === selectedLotId)?.volumeEuro ?? null,
                              volumePT: tender.lots?.find(l => l.id === selectedLotId)?.volumePT ?? null,
                            }}
                          />
                        ) : (
                          <DetailView
                            schema={lotDetailConfig}
                            data={Object.assign({}, tender?.lots?.find(l => l.id === selectedLotId))}
                            onEdit={() => {
                              setIsLotEditing(true);
                            }}
                          />
                        )}
                      </Card>
                    )}
                    
                    {selectedWorkpackageId && (
                      <Card className="p-4">
                        {isWorkpackageEditing ? (
                          <DynamicForm
                            schema={{
                              ...getWorkpackageFormFields(),
                              onSubmit: async (data: unknown) => {
                                if (!selectedWorkpackageId || selectedWorkpackageId.trim() === '') {
                                  toast.error('Invalid workpackage ID');
                                  return;
                                }

                                const existingWorkpackage = tender?.workpackages?.find(w => w.id === selectedWorkpackageId);
                                if (!existingWorkpackage) {
                                  toast.error('Workpackage not found');
                                  return;
                                }

                                // Get the lot ID from the parent lot
                                const parentLot = tender?.lots?.find(l => l.workpackages?.some(wp => wp.id === selectedWorkpackageId));
                                if (!parentLot) {
                                  toast.error('Parent lot not found');
                                  return;
                                }

                                const updateData = {
                                  id: selectedWorkpackageId,
                                  number: (data as WorkpackageFormData).number ?? null,
                                  title: (data as WorkpackageFormData).title ?? null,
                                  description: (data as WorkpackageFormData).description ?? '',
                                  lotID: parentLot.id,
                                  volumeEuro: (data as WorkpackageFormData).volumeEuro ? Number((data as WorkpackageFormData).volumeEuro) : null,
                                  volumePT: (data as WorkpackageFormData).volumePT ? Number((data as WorkpackageFormData).volumePT) : null,
                                };

                                try {
                                  await updateWorkpackage.mutate(updateData);
                                  setIsWorkpackageEditing(false);
                                  setSelectedWorkpackageId(null);
                                } catch (error) {
                                  toast.error(`Fehler beim Aktualisieren des Arbeitspakets: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                }
                              },
                            }}
                            defaultValues={{
                              ...Object.assign({}, tender.workpackages?.find(w => w.id === selectedWorkpackageId)),
                              lotID: selectedLotId || tender.lots?.find(l => l.workpackages?.some(wp => wp.id === selectedWorkpackageId))?.id || '',
                            }}
                          />
                        ) : (
                          <DetailView
                            schema={workpackageDetailConfig}
                            data={Object.assign({}, tender?.workpackages?.find(w => w.id === selectedWorkpackageId))}
                            onEdit={() => {
                              setIsWorkpackageEditing(true);
                            }}
                          />
                        )}
                      </Card>
                    )}
                    
                    {!selectedLotId && !selectedWorkpackageId && (
                      <div className="text-center text-muted-foreground py-8">
                        Wählen Sie ein Los oder ein Arbeitspaket aus, um Details anzuzeigen
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Add Lot Dialog */}
                <Dialog open={addingLot} onOpenChange={(open) => {
                  setAddingLot(open);
                  if (!open) {
                    setSelectedLotId(null);
                  }
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isLotEditing ? "Los bearbeiten" : "Neues Los"}
                      </DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={{
                        ...getLotFormFields(
                          id ?? '',
                          selectedLotId ?? undefined,
                          tender.lots?.filter(lot => lot.id !== selectedLotId).map(lot => ({
                            id: lot.id,
                            number: lot.number ?? '',
                            title: lot.title ?? ''
                          })) ?? []
                        ),
                        onSubmit: async (data: unknown) => {
                          if (selectedLotId) {
                            const formData = {
                              id: selectedLotId,
                              number: (data as Record<string, unknown>).number === '' ? null : (data as Record<string, unknown>).number as string,
                              title: (data as Record<string, unknown>).title === '' ? null : (data as Record<string, unknown>).title as string,
                              description: (data as Record<string, unknown>).description as string,
                              volumeEuro: (data as Record<string, unknown>).volumeEuro ? Number((data as Record<string, unknown>).volumeEuro) : null,
                              volumePT: (data as Record<string, unknown>).volumePT ? Number((data as Record<string, unknown>).volumePT) : null,
                              parentLotID: (data as Record<string, unknown>).parentLotID === '' || (data as Record<string, unknown>).parentLotID === undefined || (data as Record<string, unknown>).parentLotID === null ? null : String((data as Record<string, unknown>).parentLotID),
                            } as UpdateLot;
                            await updateLot.mutate(formData);
                          } else {
                            const formData = {
                              ...(data as Record<string, unknown>),
                              callToTenderID: id ?? '',
                              parentLotID: (data as Record<string, unknown>).parentLotID === '' ? null : (data as Record<string, unknown>).parentLotID,
                            } as CreateLot;
                            await createLot.mutate(formData);
                          }
                          setAddingLot(false);
                          setSelectedLotId(null);
                        },
                      }}
                      defaultValues={
                        selectedLotId
                          ? Object.assign({}, tender.lots?.find(l => l.id === selectedLotId))
                          : {
                              description: "",
                              callToTenderID: id ?? null,
                              parentLotID: null,
                            }
                      }
                    />
                  </DialogContent>
                </Dialog>

                {/* Add Workpackage Dialog */}
                <Dialog open={addingWorkpackage} onOpenChange={(open) => {
                  setAddingWorkpackage(open);
                  if (!open) {
                    setSelectedWorkpackageId(null);
                  }
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isWorkpackageEditing ? "Arbeitspaket bearbeiten" : "Neues Arbeitspaket"}
                      </DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={{
                        ...getWorkpackageFormFields(),
                        onSubmit: async (data: unknown) => {
                          if (!selectedWorkpackageId || selectedWorkpackageId.trim() === '') {
                            toast.error('Invalid workpackage ID');
                            return;
                          }

                          const existingWorkpackage = tender?.workpackages?.find(w => w.id === selectedWorkpackageId);
                          if (!existingWorkpackage) {
                            toast.error('Workpackage not found');
                            return;
                          }

                          // Get the lot ID from the parent lot
                          const parentLot = tender?.lots?.find(l => l.workpackages?.some(wp => wp.id === selectedWorkpackageId));
                          if (!parentLot) {
                            toast.error('Parent lot not found');
                            return;
                          }

                          const updateData = {
                            id: selectedWorkpackageId,
                            number: (data as WorkpackageFormData).number ?? null,
                            title: (data as WorkpackageFormData).title ?? null,
                            description: (data as WorkpackageFormData).description ?? '',
                            lotID: parentLot.id,
                            volumeEuro: (data as WorkpackageFormData).volumeEuro ? Number((data as WorkpackageFormData).volumeEuro) : null,
                            volumePT: (data as WorkpackageFormData).volumePT ? Number((data as WorkpackageFormData).volumePT) : null,
                          };

                          try {
                            await updateWorkpackage.mutate(updateData);
                            setIsWorkpackageEditing(false);
                            setSelectedWorkpackageId(null);
                          } catch (error) {
                            toast.error(`Fehler beim Aktualisieren des Arbeitspakets: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        },
                      }}
                      defaultValues={{
                        ...Object.assign({}, tender.workpackages?.find(w => w.id === selectedWorkpackageId)),
                        lotID: selectedLotId || tender.lots?.find(l => l.workpackages?.some(wp => wp.id === selectedWorkpackageId))?.id || '',
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Conditions Tab */}
          <TabsContent value="conditions">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Teilnahmebedingungen</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <ConditionsTree
                      types={conditionsOfParticipationTypes || []}
                      conditions={conditions || []}
                      onAddType={(parentId) => {
                        setSelectedTypeId(parentId || null);
                        setAddingType(true);
                      }}
                      onAddCondition={(typeId) => {
                        setSelectedTypeId(typeId);
                        setAddingCondition(true);
                      }}
                      onTypeClick={(id) => {
                        setSelectedTypeId(id);
                        setSelectedConditionId(null);
                      }}
                      onConditionClick={(id) => {
                        setSelectedConditionId(id);
                        setSelectedTypeId(null);
                      }}
                      onDeleteType={handleDeleteType}
                      onDeleteCondition={handleDeleteCondition}
                      selectedTypeId={selectedTypeId || undefined}
                      selectedConditionId={selectedConditionId || undefined}
                    />
                  </div>
                  
                  <div>
                    {selectedTypeId && (
                      <Card className="p-4">
                       
                        <DetailView
                          schema={conditionsOfParticipationTypeDetailConfig}
                          data={conditionsOfParticipationTypes?.find(t => t.id === selectedTypeId) || {}}
                          onEdit={() => {
                            setAddingType(true);
                            setIsTypeEditing(true);
                          }}
                        />
                      </Card>
                    )}
                    
                    {selectedConditionId && (
                      <Card className="p-4">
                        
                        <DetailView
                          schema={conditionsOfParticipationDetailConfig}
                          data={conditions?.find(c => c.id === selectedConditionId) || {}}
                          onEdit={() => {
                            setAddingCondition(true);
                            setIsConditionEditing(true);
                          }}
                        />
                      </Card>
                    )}
                    
                    {!selectedTypeId && !selectedConditionId && (
                      <div className="text-center text-muted-foreground py-8">
                        Wählen Sie einen Typ oder eine Bedingung aus, um Details anzuzeigen
                      </div>
                    )}
                  </div>
                </div>
                
                <Dialog open={addingType} onOpenChange={(open) => {
                  setAddingType(open);
                  if (!open) {
                    setIsTypeEditing(false);
                    setSelectedTypeId(null);
                  }
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isTypeEditing ? "Typ bearbeiten" : "Neuer Typ"}
                      </DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={{
                        fields: getConditionsOfParticipationTypeFormFields(conditionsOfParticipationTypes || []),
                        onSubmit: async (data: unknown) => {
                          if (selectedTypeId) {
                            await updateType.mutate({
                              id: selectedTypeId,
                              ...(data as Record<string, unknown>),
                            });
                          } else {
                            await createType.mutate({
                              ...(data as Record<string, unknown>),
                              title: (data as Record<string, unknown>).title as string,
                              callToTenderIDs: id ?? null,
                            });
                          }
                          setAddingType(false);
                          setIsTypeEditing(false);
                          setSelectedTypeId(null);
                        },
                      }}
                      defaultValues={
                        selectedTypeId
                          ? conditionsOfParticipationTypes?.find(t => t.id === selectedTypeId)
                          : {
                              ...conditionsOfParticipationTypeDefaultValues,
                              callToTenderIDs: id ?? null,
                            }
                      }
                    />
                  </DialogContent>
                </Dialog>
                
                <Dialog open={addingCondition} onOpenChange={(open) => {
                  setAddingCondition(open);
                  if (!open) {
                    setIsConditionEditing(false);
                    setSelectedConditionId(null);
                  }
                }}>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[1200px]">
                    <DialogHeader>
                      <DialogTitle>
                        {isConditionEditing ? "Bedingung bearbeiten" : "Neue Bedingung"}
                      </DialogTitle>
                    </DialogHeader>
                    <DynamicForm
                      schema={{
                        fields: getConditionsOfParticipationFormFields(),
                        onSubmit: async (data) => {
                          if (selectedConditionId) {
                            await handleUpdateCondition(data);
                          } else {
                            await handleCreateCondition(data);
                          }
                          setAddingCondition(false);
                          setIsConditionEditing(false);
                          setSelectedConditionId(null);
                        },
                      }}
                      defaultValues={
                        selectedConditionId
                          ? conditions?.find(c => c.id === selectedConditionId)
                          : {
                              ...conditionsOfParticipationDefaultValues,
                              callToTenderIDs: id ?? null,
                              conditionsOfParticipationTypeIDs: selectedTypeId || "",
                            }
                      }
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Deliverables Tab */}
          <TabsContent value="deliverables">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Liefergegenstände</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingDeliverable((v) => !v)}
                  >
                    {addingDeliverable ? "Abbrechen" : "Hinzufügen"}
                  </Button>
                </div>
                {addingDeliverable && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getCallToTenderDeliverablesFormFields(),
                        onSubmit: handleCreateDeliverable,
                      }}
                      defaultValues={{
                        ...callToTenderDeliverablesDefaultValues,
                        callToTenderID: id ?? null,
                      }}
                    />
                  </Card>
                )}
                {deliverablesError ? (
                  <div className="text-center text-red-500 py-4">
                    Fehler beim Laden der Liefergegenstände: {deliverablesError.message}
                  </div>
                ) : deliverables && deliverables.length > 0 ? (
                  <DataTable<CallToTenderDeliverables>
                    data={deliverables}
                    columns={getCallToTenderDeliverablesTableConfig(handleDeliverableModalOpen, "modal")}
                    tabValue={activeTab}
                    onView={handleDeliverableModalOpen}
                    viewMode="modal"
                    hideCreateButton={true}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Keine Liefergegenstände vorhanden
                  </div>
                )}
                <Dialog open={!!selectedDeliverableId} onOpenChange={() => {
                  setSelectedDeliverableId(null);
                  setIsDeliverableEditing(false);
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Liefergegenstand Details</DialogTitle>
                    </DialogHeader>
                    {selectedDeliverableId && deliverables?.find((d: { id: string }) => d.id === selectedDeliverableId) && (
                      isDeliverableEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getCallToTenderDeliverablesFormFields(),
                            onSubmit: handleDeliverableFormSubmit,
                          }}
                          defaultValues={deliverables.find((d: { id: string }) => d.id === selectedDeliverableId) ?? {}}
                        />
                      ) : (
                        <DetailView
                          schema={callToTenderDeliverablesDetailConfig}
                          data={deliverables.find((d: { id: string }) => d.id === selectedDeliverableId) ?? {}}
                          onEdit={() => setIsDeliverableEditing(true)}
                          className="py-4"
                        />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Quality Tab */}
          <TabsContent value="quality">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Risiko & Qualität</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingRiskQualityProcess((v) => !v)}
                  >
                    {addingRiskQualityProcess ? "Abbrechen" : "Hinzufügen"}
                  </Button>
                </div>
                {addingRiskQualityProcess && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getRiskQualityProcessFormFields(
                          availableOrganisations?.map((org: { id: string; name: string }) => ({
                            id: org.id,
                            name: org.name
                          })) || []
                        ),
                        onSubmit: handleCreateRiskQualityProcess,
                      }}
                      defaultValues={Object.assign({}, riskQualityProcessDefaultValues, { callToTenderID: id ?? null })}
                    />
                  </Card>
                )}
                {riskQualityProcesses && riskQualityProcesses.length > 0 ? (
                  <DataTable
                    data={riskQualityProcesses}
                    columns={getRiskQualityProcessColumns(handleRiskQualityProcessModalOpen, "modal")}
                    onView={handleRiskQualityProcessModalOpen}
                    viewMode="modal"
                    hideCreateButton={true}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Keine Risiko & Qualität Prozesse vorhanden
                  </div>
                )}
                <Dialog open={!!selectedRiskQualityProcessId} onOpenChange={() => {
                  setSelectedRiskQualityProcessId(null);
                  setIsRiskQualityProcessEditing(false);
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Risiko & Qualität Details</DialogTitle>
                    </DialogHeader>
                    {selectedRiskQualityProcessId && riskQualityProcesses?.find(rqp => rqp.id === selectedRiskQualityProcessId) && (
                      isRiskQualityProcessEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getRiskQualityProcessFormFields(
                              availableOrganisations?.map((org: { id: string; name: string }) => ({
                                id: org.id,
                                name: org.name
                              })) || []
                            ),
                            onSubmit: async (data) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                              if (selectedRiskQualityProcessId) {
                                await updateRiskQualityProcess.mutate({
                                  id: selectedRiskQualityProcessId,
                                  ...(data as Record<string, unknown>),
                                });
                              }
                            },
                          }}
                          defaultValues={Object.assign({}, riskQualityProcesses.find(rqp => rqp.id === selectedRiskQualityProcessId))}
                        />
                      ) : (
                        <DetailView
                          schema={riskQualityProcessDetailConfig}
                          data={riskQualityProcesses.find(rqp => rqp.id === selectedRiskQualityProcessId) ?? {}}
                          onEdit={() => setIsRiskQualityProcessEditing(true)}
                          className="py-4"
                        />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Organisations Tab */}
          <TabsContent value="organisations">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Organisationen</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingOrganisation((v) => !v)}
                  >
                    {addingOrganisation ? "Abbrechen" : "Organisation hinzufügen"}
                  </Button>
                </div>
                {addingOrganisation && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getOrganisationFormFields(
                          availableOrganisations?.map((org: { id: string; name: string }) => ({
                            id: org.id,
                            name: org.name
                          })) || []
                        ),
                        onSubmit: handleCreateOrganisation,
                      }}
                      defaultValues={{
                        ...organisationDefaultValues,
                        organisationIDs: organisations?.find(org => org.id === selectedOrganisationId)?.organisation?.id,
                        organisationRole: organisations?.find(org => org.id === selectedOrganisationId)?.organisationRole?.role,
                        callToTenderIDs: id ?? null,
                      }}
                    />
                  </Card>
                )}
                <DataTable
                  data={organisations?.map((org: { id: string; organisation: { id: string; name: string } | null; organisationRole: { role: string } | null }) => {
                    const transformed = {
                      id: org.id,
                      organisation: org.organisation ? {
                        id: org.organisation.id,
                        name: org.organisation.name
                      } : null,
                      organisationRole: org.organisationRole ? {
                        role: org.organisationRole.role
                      } : null
                    };
                    return transformed;
                  }) || []}
                  columns={getOrganisationColumns(handleView, "modal")}
                  onView={handleView}
                  viewMode="modal"
                  hideCreateButton={true}
                />
                <Dialog open={!!selectedOrganisationId} onOpenChange={handleCloseOrganisationModal}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Organisation Details</DialogTitle>
                    </DialogHeader>
                    {selectedOrganisationId && (
                      isOrganisationEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getOrganisationFormFields(
                              availableOrganisations?.map((org: { id: string; name: string }) => ({
                                id: org.id,
                                name: org.name
                              })) || []
                            ),
                            onSubmit: handleOrganisationFormSubmit,
                          }}
                          defaultValues={{
                            ...organisationDefaultValues,
                            ...organisations?.find(org => org.id === selectedOrganisationId),
                            callToTenderIDs: id ?? null,
                          }}
                        />
                      ) : (
                        <DetailView
                          schema={organisationDetailSchema}
                          data={organisations?.find(org => org.id === selectedOrganisationId) ?? {}}
                          onEdit={() => setIsOrganisationEditing(true)}
                          className="py-4"
                        />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Profiles Tab */}
          <TabsContent value="profiles">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Mitarbeiter</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingEmployee((v) => !v)}
                  >
                    {addingEmployee ? "Abbrechen" : "Mitarbeiter hinzufügen"}
                  </Button>
                </div>
                {addingEmployee && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getEmployeeFormFields(id, employeeRoles),
                        onSubmit: handleCreateEmployee,
                      }}
                      defaultValues={{
                        ...employeeDefaultValues,
                        callToTenderId: id ?? null,
                      }}
                    />
                  </Card>
                )}
                <DataTable
                  data={employees?.map((emp) => ({
                    id: emp.id,
                    employee: {
                      id: emp.employee?.id ?? "",
                      foreName: emp.employee?.foreName ?? "",
                      lastName: emp.employee?.lastName ?? "",
                    },
                    employeeCallToTenderRole: emp.employeeCallToTenderRole ?? "",
                    role: emp.role ?? "",
                    profileTitle: emp.profileTitle ?? "",
                    description: emp.description ?? "",
                    costCenter: emp.costCenter ?? null,
                    profilePrice: emp.profilePrice ?? null,
                    travelCost: emp.travelCost ?? null,
                    autoSelected: emp.autoSelected ?? null,
                  })) ?? []}
                  columns={getCallToTenderEmployeeColumns(handleEmployeeModalOpen, "modal")}
                  onView={handleEmployeeModalOpen}
                  viewMode="modal"
                  hideCreateButton={true}
                />
                <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Mitarbeiter Details</DialogTitle>
                    </DialogHeader>
                    {selectedEmployeeId && employees?.find(emp => emp.id === selectedEmployeeId) && (
                      <DetailView
                        schema={employeeDetailSchema}
                        data={employees.find(emp => emp.id === selectedEmployeeId) ?? {}}
                        className="py-4"
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Tasks</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingTask((v) => !v)}
                  >
                    {addingTask ? "Abbrechen" : "Neue Aufgabe"}
                  </Button>
                </div>
                {addingTask && (
                  <Card className="mb-6 p-4">
                    <Dialog open={addingTask} onOpenChange={setAddingTask}>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Neue Aufgabe</DialogTitle>
                        </DialogHeader>
                        <div className="max-w-[500px] mx-auto">
                          <DynamicForm
                            schema={{
                              fields: getTaskFormFields(),
                              onSubmit: handleCreateTask,
                            }}
                            defaultValues={{
                              ...taskDefaultValues,
                              tenderId: id ?? null,
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </Card>
                )}
                <DataTable
                  data={tasks}
                  columns={taskColumns}
                  onView={handleTaskModalOpen}
                  viewMode="modal"
                  hideCreateButton={true}
                />
                <Dialog open={!!selectedTaskId} onOpenChange={() => {
                  setSelectedTaskId(null);
                  setIsTaskEditing(false);
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Aufgabendetails</DialogTitle>
                    </DialogHeader>
                    {selectedTaskId && tasks.find(task => task.id === selectedTaskId) && (
                      isTaskEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getTaskFormFields(),
                            onSubmit: async (data) => { // eslint-disable-line @typescript-eslint/no-unused-vars
                              // TODO: Implement task update
                              setIsTaskEditing(false);
                            },
                          }}
                          defaultValues={tasks.find(task => task.id === selectedTaskId)}
                        />
                      ) : (
                        <DetailView
                          schema={taskDetailConfig}
                          data={tasks.find(task => task.id === selectedTaskId) as Record<string, unknown>}
                          onEdit={() => setIsTaskEditing(true)}
                          className="py-4"
                        />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Lessons Learned Tab */}
          <TabsContent value="lessons">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Lessons Learned</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingLessonsLearned((v) => !v)}
                  >
                    {addingLessonsLearned ? "Abbrechen" : "Hinzufügen"}
                  </Button>
                </div>
                {addingLessonsLearned && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getLessonsLearnedFormFields(
                          availableOrganisations?.map((org: { id: string; name: string }) => ({
                            id: org.id,
                            name: org.name
                          })) || []
                        ),
                        onSubmit: handleCreateLessonsLearned,
                      }}
                      defaultValues={Object.assign({}, lessonsLearnedDefaultValues, { tenderId: id ?? null })}
                    />
                  </Card>
                )}
                {lessonsLearned && lessonsLearned.length > 0 ? (
                  <DataTable
                    data={lessonsLearned}
                    columns={lessonsLearnedColumns}
                    onView={handleLessonsLearnedModalOpen}
                    viewMode="modal"
                    hideCreateButton={true}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Keine Lessons Learned vorhanden
                  </div>
                )}
                <Dialog open={!!selectedLessonsLearnedId} onOpenChange={() => {
                  setSelectedLessonsLearnedId(null);
                  setIsLessonsLearnedEditing(false);
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Lessons Learned Details</DialogTitle>
                    </DialogHeader>
                    {selectedLessonsLearnedId && lessonsLearned?.find(ll => ll.id === selectedLessonsLearnedId) && (
                      isLessonsLearnedEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getLessonsLearnedFormFields(
                              availableOrganisations?.map((org: { id: string; name: string }) => ({
                                id: org.id,
                                name: org.name
                              })) || []
                            ),
                            onSubmit: async (data) => {
                              if (selectedLessonsLearnedId) {
                                await updateLessonsLearned.mutate({
                                  id: selectedLessonsLearnedId,
                                  ...(data as Record<string, unknown>),
                                });
                              }
                            },
                          }}
                          defaultValues={Object.assign({}, lessonsLearned.find(ll => ll.id === selectedLessonsLearnedId))}
                        />
                      ) : (
                        <DetailView
                          schema={lessonsLearnedDetailConfig}
                          data={lessonsLearned.find(ll => ll.id === selectedLessonsLearnedId) ?? {}}
                          onEdit={() => setIsLessonsLearnedEditing(true)}
                          className="py-4"
                        />
                      )
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects">
            <Card className="border-none shadow-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Projekte</h2>
                  <Button
                    className="btn btn-primary"
                    onClick={() => setAddingProject((v) => !v)}
                  >
                    {addingProject ? "Abbrechen" : "Projekt hinzufügen"}
                  </Button>
                </div>
                {addingProject && (
                  <Card className="mb-6 p-4">
                    <DynamicForm
                      schema={{
                        fields: getCallToTenderProjectFormFields(id ?? ''),
                        onSubmit: handleCreateProject,
                      }}
                      defaultValues={{
                        ...callToTenderProjectDefaultValues,
                        callToTenderId: id ?? null,
                      }}
                    />
                  </Card>
                )}
                {callToTenderProjects && callToTenderProjects.length > 0 ? (
                  <DataTable
                    data={callToTenderProjects as unknown as CallToTenderProject[]}
                    columns={getCallToTenderProjectColumns(handleProjectModalOpen, "modal")}
                    onView={handleProjectModalOpen}
                    viewMode="modal"
                    hideCreateButton={true}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    Keine Projekte vorhanden
                  </div>
                )}
                <Dialog open={!!selectedProjectId} onOpenChange={() => {
                  setSelectedProjectId(null);
                  setIsProjectEditing(false);
                }}>
                  <DialogContent className="sm:max-w-[800px]">
                    <DialogHeader>
                      <DialogTitle>Projektdetails</DialogTitle>
                    </DialogHeader>
                    {selectedProjectId && callToTenderProjects?.find(p => p.id === selectedProjectId) && (
                      isProjectEditing ? (
                        <DynamicForm
                          schema={{
                            fields: getCallToTenderProjectFormFields(id ?? ''),
                            onSubmit: async (data) => {
                              if (selectedProjectId) {
                                await updateProject.mutate({
                                  id: selectedProjectId,
                                  ...(data as Record<string, unknown>),
                                });
                              }
                            },
                          }}
                          defaultValues={Object.assign({}, callToTenderProjects.find(p => p.id === selectedProjectId))}
                        />
                      ) : (
                        <DetailView
                          schema={callToTenderProjectDetailConfig}
                          data={Object.assign({}, callToTenderProjects.find(p => p.id === selectedProjectId))}
                          onEdit={() => setIsProjectEditing(true)}
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