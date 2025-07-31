"use client";

import { toast } from "sonner";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { TRPCClientErrorLike } from "@trpc/client";
import { AppRouter } from "@/server/api/root";

type TableItem = {
  id: string | number;
  tender?: {
    id: string;
  };
};

type TableActionsProps = {
  item: TableItem;
  pathname: string;
  viewMode?: 'navigation' | 'modal';
  onModalOpen?: (id: string | number) => void;
};

export const useTableActions = ({ item, pathname: currentPath, viewMode = 'navigation', onModalOpen }: TableActionsProps) => {
  const router = useRouter();
  const utils = api.useUtils();

  const deleteConcept = api.concepts.delete.useMutation({
    onSuccess: async () => {
      toast.success("Konzept erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.concepts.all.invalidate()]);
      router.push("/concepts");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Konzepts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteTemplate = api.templates.delete.useMutation({
    onSuccess: async () => {
      toast.success("Vorlage erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.templates.all.invalidate()]);
      router.push("/templates");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Vorlage: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteTraining = api.trainings.delete.useMutation({
    onSuccess: async () => {
      toast.success("Training erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.trainings.getAll.invalidate()]);
      router.push("/trainings");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Trainings: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteProfile = api.profiles.delete.useMutation({
    onSuccess: async () => {
      toast.success("Profil erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.profiles.all.invalidate()]);
      router.push("/profiles");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Profils: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisation = api.organisations.delete.useMutation({
    onSuccess: async () => {
      toast.success("Organisation erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.organisations.all.invalidate()]);
      router.push("/organisations");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Organisation: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisationContact = api.organisationContacts.delete.useMutation({
    onSuccess: async () => {
      toast.success("Kontakt erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.organisationContacts.all.invalidate()]);
      router.push("/organisations/contacts");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Kontakts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  // Settings mutations
  const deleteCertificate = api.certificate.delete.useMutation({
    onSuccess: async () => {
      toast.success("Zertifikat erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.certificate.getAll.invalidate()]);
      router.push("/settings?tab=certificates");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Zertifikats: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeRank = api.employeeRank.delete.useMutation({
    onSuccess: async () => {
      toast.success("Mitarbeiterrang erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.employeeRank.getAll.invalidate()]);
      router.push("/settings?tab=employeeRanks");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Mitarbeiterrangs: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeRole = api.employeeRole.delete.useMutation({
    onSuccess: async () => {
      toast.success("Mitarbeiterrolle erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.employeeRole.getAll.invalidate()]);
      router.push("/settings?tab=employeeRoles");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Mitarbeiterrolle: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteIndustrySector = api.industrySector.delete.useMutation({
    onSuccess: async () => {
      toast.success("Branche erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.industrySector.getAll.invalidate()]);
      router.push("/settings?tab=industrySectors");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Branche: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteLocation = api.location.delete.useMutation({
    onSuccess: async () => {
      toast.success("Standort erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.location.getAll.invalidate()]);
      router.push("/settings?tab=locations");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Standorts: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteSalutation = api.salutation.delete.useMutation({
    onSuccess: async () => {
      toast.success("Anrede erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.salutation.getAll.invalidate()]);
      router.push("/settings?tab=salutations");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Anrede: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisationRole = api.organisationRole.delete.useMutation({
    onSuccess: async () => {
      toast.success("Organisationsrolle erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.organisationRole.getAll.invalidate()]);
      router.push("/settings?tab=organisationRoles");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Organisationsrolle: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteSkill = api.skills.delete.useMutation({
    onSuccess: async () => {
      toast.success("Fähigkeit erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.skills.getAll.invalidate()]);
      router.push("/settings?tab=skills");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Fähigkeit: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteSecurityClearance = api.securityClearance.delete.useMutation({
    onSuccess: async () => {
      toast.success("Sicherheitscheck erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.securityClearance.getAll.invalidate()]);
      if (currentPath.startsWith("/settings")) {
        router.push("/settings?tab=securityClearance");
      } else {
        // Check for /profiles/[id] (not /profiles or /profiles/)
        const profileDetailMatch = currentPath.match(/^\/profiles\/(\w+)/);
        if (profileDetailMatch) {
          const profileId = profileDetailMatch[1];
          router.push(`/profiles/${profileId}?tab=securityClearance`);
        }
      }
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Sicherheitschecks: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisationCertificate = api.organisationCertificates.delete.useMutation({
    onSuccess: async () => {
      toast.success("Zertifikat erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.organisationCertificates.getAll.invalidate()]);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Organisationszertifikats: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisationTender = api.organisationTender.delete.useMutation({
    onSuccess: async () => {
      toast.success("Ausschreibungsorganisation erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.organisationTender.getAll.invalidate();
      await utils.organisationTender.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Ausschreibungsorganisation: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteAcademicDegree = api.academicDegree.delete.useMutation({
    onSuccess: async () => {
      toast.success("Akademischer Grad erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.academicDegree.getAll.invalidate();
      await utils.academicDegree.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des akademischen Grades: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteVocational = api.voccational.delete.useMutation({
    onSuccess: async () => {
      toast.success("Ausbildung erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.voccational.getAll.invalidate();
      await utils.voccational.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Ausbildung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteProfessionalBackground = api.professionalBackground.delete.useMutation({
    onSuccess: async () => {
      toast.success("Beruflicher Hintergrund erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.professionalBackground.getAll.invalidate();
      await utils.professionalBackground.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des beruflichen Hintergrunds: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeProjectActivity = api.employeeProjectActivities.delete.useMutation({
    onSuccess: async () => {
      toast.success("Projektaktivität erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeProjectActivities.getAll.invalidate();
      await utils.employeeProjectActivities.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Projektaktivität: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeExternalProject = api.employeeExternalProjects.delete.useMutation({
    onSuccess: async () => {
      toast.success("Externe Projektaktivität erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeExternalProjects.getAll.invalidate();
      await utils.employeeExternalProjects.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der externen Projektaktivität: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeCertificate = api.employeeCertificates.delete.useMutation({
    onSuccess: async () => {
      toast.success("Zertifikat erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeCertificates.getAll.invalidate();
      await utils.employeeCertificates.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Zertifikats: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeSkill = api.employeeSkills.delete.useMutation({
    onSuccess: async () => {
      toast.success("Fähigkeit erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeSkills.getAll.invalidate();
      await utils.employeeSkills.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Fähigkeit: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteEmployeeTraining = api.employeeTraining.delete.useMutation({
    onSuccess: async () => {
      toast.success("Schulung erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.employeeTraining.getAll.invalidate();
      await utils.employeeTraining.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Schulung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteTender = api.tenders.delete.useMutation({
    onSuccess: async () => {
      toast.success("Ausschreibung erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.tenders.all.invalidate();
      router.push("/tenders/current");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Ausschreibung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteOrganisationProjectActivity = api.organisationProjectActivities.delete.useMutation({
    onSuccess: async () => {
      toast.success("Projektaktivität erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.organisationProjectActivities.getAll.invalidate();
      await utils.organisationProjectActivities.getAll.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Projektaktivität: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteLotDivision = api.lot.delete.useMutation({
    onSuccess: async () => {
      toast.success("Los erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.tenders.getById.invalidate();
      await utils.tenders.getById.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Loses: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const updateLotDivision = api.lot.update.useMutation({
    onSuccess: async () => {
      toast.success("Los erfolgreich aktualisiert", {
        position: "top-right",
        duration: 3000,
      });
      await utils.tenders.getById.invalidate();
      await utils.tenders.getById.refetch();
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Update error:", error);
      toast.error("Fehler beim Aktualisieren des Loses: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  // Add tender-organisation delete mutation
  const deleteTenderOrganisation = api.callToTenderOrganisations.delete.useMutation({
    onSuccess: async () => {
      toast.success("Organisation erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([
        utils.callToTenderOrganisations.getByTenderId.invalidate(),
        utils.tenders.getById.invalidate()
      ]);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Organisation: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  // Add tender-employee delete mutation
  const deleteTenderEmployee = api.callToTenderEmployee.delete.useMutation({
    onSuccess: async () => {
      toast.success("Mitarbeiter erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([
        utils.callToTenderEmployee.getByTenderId.invalidate(),
        utils.tenders.getById.invalidate()
      ]);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Mitarbeiters: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  // Add CallToTenderProject delete mutation
  const deleteTenderProject = api.callToTenderProject.delete.useMutation({
    onSuccess: async () => {
      toast.success("Projekt erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      try {
        await Promise.all([
          utils.callToTenderProject.getByTenderId.invalidate(),
          utils.tenders.getById.invalidate()
        ]);
      } catch {
        toast.error("Die Ausschreibung wurde nicht gefunden", {
          position: "top-right",
          duration: 3000,
        });
      }
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      if (error.data?.code === "NOT_FOUND") {
        toast.error("Die Ausschreibung wurde nicht gefunden", {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Fehler beim Löschen des Projekts: " + error.message, {
          position: "top-right",
          duration: 3000,
        });
      }
    },
  });

  const deleteDivision = api.division.delete.useMutation({
    onSuccess: async () => {
      toast.success("Abteilung erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.division.getAll.invalidate()]);
      router.push("/settings?tab=divisions");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Abteilung: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteLessonsLearned = api.lessonsLearned.delete.useMutation({
    onSuccess: async () => {
      toast.success("Lessons Learned erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await utils.lessonsLearned.getAll.invalidate();
      router.push("/tenders/lessons-learned");
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Lessons Learned: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const deleteTask = api.tasks.delete.useMutation({
    onSuccess: async () => {
      toast.success("Aufgabe erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([utils.tasks.getAll.invalidate()]);
      // Only redirect if we're not in a tender context
      if (!currentPath.includes('/tenders')) {
        router.push("/tasks");
      }
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen der Aufgabe: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  const handleView = async () => {
    const itemId = String(item.id);

    // Get tab value for /profiles pages
    let tab: string | null = null;
    if (currentPath.includes('/profiles') && typeof window !== 'undefined') {
      tab = new URL(window.location.href).searchParams.get('tab');
    }

    // Special handling for lessons learned
    if (currentPath.includes('/tenders/lessons-learned')) {
      // Navigate to the associated tender
      const tenderId = item.tender?.id;
      if (tenderId) {
        try {
          // Check if tender exists before navigation
          await utils.tenders.getById.fetch({ id: tenderId });
          router.push(`/tenders/${tenderId}`);
        } catch {
          toast.error("Die Ausschreibung wurde nicht gefunden", {
            position: "top-right",
            duration: 3000,
          });
        }
      }
      return;
    }

    // If we're in modal mode and have a modal handler, use it
    if (viewMode === 'modal' && onModalOpen) {
      // Tasks modal logic - moved to top for priority
      if (currentPath.includes('/tasks') || currentPath.includes('/tenders') && new URL(window.location.href).searchParams.get('tab') === 'tasks') {
        onModalOpen(itemId);
        return;
      }

      // Profile tabs modal logic
      if (currentPath.includes('/profiles')) {
        // Always use modal for profile tabs when in modal mode
        onModalOpen(itemId);
        return;
      }

      // Project activities modal logic
      if (currentPath.includes('/projects')) {
        onModalOpen(itemId);
        return;
      }
      
      // Existing modal conditions
      if (((currentPath.includes('/organisations') && typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('tab') === 'certificates') ||
        currentPath.includes('/organisations/certificates'))) {
        onModalOpen(itemId);
        return;
      }
      // Tender modal logic
      if (((currentPath.includes('/organisations') && typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('tab') === 'tender') ||
        currentPath.includes('/organisations/tender'))) {
        onModalOpen(itemId);
        return;
      }
      // Project activities modal logic
      if (((currentPath.includes('/organisations') && typeof window !== 'undefined' && new URL(window.location.href).searchParams.get('tab') === 'projects') ||
        currentPath.includes('/organisations/project-activities'))) {
        onModalOpen(itemId);
        return;
      }
    }

    // Tender organisations modal logic
    if (
      viewMode === 'modal' &&
      onModalOpen &&
      currentPath.includes('/tenders') &&
      typeof window !== 'undefined' &&
      new URL(window.location.href).searchParams.get('tab') === 'organisations'
    ) {
      onModalOpen(itemId);
      return;
    }

    // Add RiskQuality modal logic
    if (
      viewMode === 'modal' &&
      onModalOpen &&
      currentPath.includes('/tenders') &&
      typeof window !== 'undefined' &&
      new URL(window.location.href).searchParams.get('tab') === 'quality'
    ) {
      onModalOpen(itemId);
      return;
    }

    // Add CallToTenderEmployee modal logic
    if (
      viewMode === 'modal' &&
      onModalOpen &&
      currentPath.includes('/tenders') &&
      typeof window !== 'undefined' &&
      new URL(window.location.href).searchParams.get('tab') === 'profiles'
    ) {
      onModalOpen(itemId);
      return;
    }

    // Add CallToTenderProject modal logic
    if (
      viewMode === 'modal' &&
      onModalOpen &&
      currentPath.includes('/tenders') &&
      typeof window !== 'undefined' &&
      new URL(window.location.href).searchParams.get('tab') === 'projects'
    ) {
      onModalOpen(itemId);
      return;
    }

    // Add Deliverables modal logic in the tender section
    if (
      viewMode === 'modal' &&
      onModalOpen &&
      currentPath.includes('/tenders') &&
      typeof window !== 'undefined' &&
      new URL(window.location.href).searchParams.get('tab') === 'deliverables'
    ) {
      onModalOpen(itemId);
      return;
    }

    // Otherwise, handle navigation based on the pathname
    if (currentPath.includes('/concepts')) {
      router.push(`/concepts/${itemId}`);
    } else if (currentPath.includes('/templates')) {
      router.push(`/templates/${itemId}`);
    } else if (currentPath.includes('/profiles')) {
      // For profiles, handle tab-based navigation
      if (tab) {
        router.push(`/profiles/${itemId}?tab=${tab}`);
      } else {
        router.push(`/profiles/${itemId}`);
      }
    } else if (currentPath.includes('/organisations/contacts')) {
      router.push(`/organisations/contacts/${itemId}`);
    } else if (currentPath.includes('/organisations')) {
      router.push(`/organisations/${itemId}`);
    } else if (currentPath.includes('/settings')) {
      // For settings, we should never navigate if in modal mode
      if (viewMode === 'modal' && onModalOpen) {
        onModalOpen(itemId);
      } else {
        const tab = new URL(window.location.href).searchParams.get("tab");
        switch (tab) {
          case 'certificates':
          case 'employeeRanks':
          case 'employeeRoles':
          case 'industrySectors':
          case 'locations':
          case 'salutations':
          case 'organisationRoles':
          case 'skills':
          case 'securityClearance':
          case 'divisions':
            router.push(`/settings/${tab}/${itemId}`);
            break;
          case 'divisions':
            await deleteDivision.mutateAsync({ id: String(item.id) });
            break;
          default:
            router.push(`/settings?tab=${tab}`);
        }
      }
    } else if (currentPath.includes('/tenders')) {
      const tab = new URL(window.location.href).searchParams.get('tab');
      if (tab === 'description' && viewMode === 'modal' && onModalOpen) {
        onModalOpen(itemId);
      } else {
        router.push(`/tenders/${itemId}`);
      }
    } else if (currentPath.includes('/trainings')) {
      router.push(`/trainings/${itemId}`);
    } else if (currentPath.includes('/tasks')) {
      // For tasks, always use modal mode if specified
      if (viewMode === 'modal' && onModalOpen) {
        onModalOpen(itemId);
      } else {
        // If not in modal mode, stay on the current page and open modal
        onModalOpen?.(itemId);
      }
    } else {
      // Default case: navigate to the current path + id
      const baseRoute = currentPath.split('/').slice(0, 2).join('/');
      router.push(`${baseRoute}/${itemId}`);
    }
  };

  const handleDelete = async () => {
    try {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get("tab");

      // Add tasks delete case
      if (currentPath.includes('/tasks')) {
        await deleteTask.mutateAsync({ id: String(item.id) });
        return;
      }

      // Add lessons learned delete case
      if (currentPath.includes('/tenders/lessons-learned')) {
        await deleteLessonsLearned.mutateAsync({ id: String(item.id) });
        return;
      }

      // Add lot division delete case
      if (currentPath.includes('/tenders') && tab === 'description') {
        try {
          await deleteLotDivision.mutateAsync({ id: String(item.id) });
        } catch (error) {
          if (error instanceof Error && error.message.includes("NOT_FOUND")) {
            toast.error("Die Ausschreibung wurde nicht gefunden", {
              position: "top-right",
              duration: 3000,
            });
          } else {
            throw error;
          }
        }
        return;
      }

      // Add RiskQuality delete case
      if (currentPath.includes('/tenders') && tab === 'quality') {
        await deleteRiskQualityProcess.mutateAsync({ id: String(item.id) });
        return;
      }

      // Add Deliverables delete case
      if (currentPath.includes('/tenders') && tab === 'deliverables') {
        try {
          await deleteDeliverable.mutateAsync({ id: String(item.id) });
        } catch (error) {
          console.error("Error deleting deliverable:", error);
        }
        return;
      }

      // Add tender organisation delete case - moved up for better visibility
      if (currentPath.includes('/tenders') && tab === 'organisations') {
        await deleteTenderOrganisation.mutateAsync({ id: String(item.id) });
        return;
      }

      // Add tender employee delete case
      if (currentPath.includes('/tenders') && tab === 'profiles') {
        await deleteTenderEmployee.mutateAsync({ id: String(item.id) });
        return;
      }

      // Add tender project delete case
      if (currentPath.includes('/tenders') && tab === 'projects') {
        try {
          await deleteTenderProject.mutateAsync({ id: String(item.id) });
        } catch (error) {
          if (error instanceof Error && error.message.includes("NOT_FOUND")) {
            toast.error("Die Ausschreibung wurde nicht gefunden", {
              position: "top-right",
              duration: 3000,
            });
          } else {
            throw error;
          }
        }
        return;
      }

      if (
        (currentPath.includes('/profiles') && tab === 'skills') ||
        currentPath.includes('/profiles/skills')
      ) {
        await deleteEmployeeSkill.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'certificates') ||
        currentPath.includes('/profiles/certificates')
      ) {
        await deleteEmployeeCertificate.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'external') ||
        currentPath.includes('/profiles/external')
      ) {
        await deleteEmployeeExternalProject.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'projects') ||
        currentPath.includes('/profiles/projects')
      ) {
        await deleteEmployeeProjectActivity.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'professional') ||
        currentPath.includes('/profiles/professional')
      ) {
        await deleteProfessionalBackground.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'voccational') ||
        currentPath.includes('/profiles/voccational')
      ) {
        await deleteVocational.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'academic') ||
        currentPath.includes('/profiles/academic')
      ) {
        await deleteAcademicDegree.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/profiles') && tab === 'trainings') ||
        currentPath.includes('/profiles/trainings')
      ) {
        await deleteEmployeeTraining.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/organisations') && tab === 'projects') ||
        currentPath.includes('/organisations/projects')
      ) {
        await deleteOrganisationProjectActivity.mutateAsync({ id: String(item.id) });
        return;
      } else if (
        (currentPath.includes('/organisations') && tab === 'certificates') ||
        currentPath.includes('/organisations/certificates')
      ) {
        await deleteOrganisationCertificate.mutateAsync({ id: String(item.id) });
      } else if (
        (currentPath.includes('/organisations') && tab === 'tender') ||
        currentPath.includes('/organisations/tender')
      ) {
        await deleteOrganisationTender.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/tenders')) {
        await deleteTender.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/trainings')) {
        await deleteTraining.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/concepts')) {
        await deleteConcept.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/templates')) {
        await deleteTemplate.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/profiles')) {
        await deleteProfile.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/organisations/contacts')) {
        await deleteOrganisationContact.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/organisations')) {
        await deleteOrganisation.mutateAsync({ id: String(item.id) });
      } else if (currentPath.includes('/settings')) {
        switch (tab) {
          case 'certificates':
            await deleteCertificate.mutateAsync({ id: String(item.id) });
            break;
          case 'employeeRanks':
            await deleteEmployeeRank.mutateAsync({ id: String(item.id) });
            break;
          case 'employeeRoles':
            await deleteEmployeeRole.mutateAsync({ id: String(item.id) });
            break;
          case 'industrySectors':
            await deleteIndustrySector.mutateAsync({ id: String(item.id) });
            break;
          case 'locations':
            await deleteLocation.mutateAsync({ id: String(item.id) });
            break;
          case 'salutations':
            await deleteSalutation.mutateAsync({ id: String(item.id) });
            break;
          case 'organisationRoles':
            await deleteOrganisationRole.mutateAsync({ id: String(item.id) });
            break;
          case 'skills':
            await deleteSkill.mutateAsync({ id: String(item.id) });
            break;
          case 'securityClearance':
            await deleteSecurityClearance.mutateAsync({ id: String(item.id) });
            break;
          case 'divisions':
            await deleteDivision.mutateAsync({ id: String(item.id) });
            break;
          default:
            toast.error("Das hat nicht geklappt", {
              position: "top-right",
              duration: 3000,
            });
        }
      } else {
        toast.error("Das hat nicht geklappt", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  // Add deleteRiskQualityProcess mutation
  const deleteRiskQualityProcess = api.riskQualityProcess.delete.useMutation({
    onSuccess: async () => {
      toast.success("Risiko & Qualität Prozess erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([
        utils.riskQualityProcess.getByTenderId.invalidate(),
        utils.tenders.getById.invalidate()
      ]);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Risiko & Qualität Prozesses: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  // Add deleteDeliverable mutation
  const deleteDeliverable = api.callToTenderDeliverables.delete.useMutation({
    onSuccess: async () => {
      toast.success("Liefergegenstand erfolgreich gelöscht", {
        position: "top-right",
        duration: 3000,
      });
      await Promise.all([
        utils.callToTenderDeliverables.getByTenderId.invalidate(),
        utils.tenders.getById.invalidate()
      ]);
    },
    onError: (error: TRPCClientErrorLike<AppRouter>) => {
      console.error("Delete error:", error);
      toast.error("Fehler beim Löschen des Liefergegenstands: " + error.message, {
        position: "top-right",
        duration: 3000,
      });
    },
  });

  return {
    handleView,
    handleDelete,
    updateLotDivision,
    deleteRiskQualityProcess,
    deleteDeliverable,
    deleteTask,
  };
}; 