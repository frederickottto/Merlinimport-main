"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { TenderStatus } from "@/server/controllers/tender/schema";
import { formatDate } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FileSpreadsheet, Upload, Star, StarOff, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmployeePlaceholder, EMPLOYEE_PLACEHOLDERS } from "@/lib/employee-placeholders";
import { DeliverablesPlaceholder, DELIVERABLES_PLACEHOLDERS } from "@/lib/deliverables-placeholders";
import { ProjectPlaceholder, PROJECT_PLACEHOLDERS } from "@/lib/project-placeholders";
import { PlaceholderCopy } from "@/components/templates/placeholder-copy";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlaceholderAccordion } from "@/components/ui/placeholder-accordion";
import Image from 'next/image';
import { getAllPlaceholders } from '@/lib/placeholder-schema-mappings';

type TenderBackend = {
  id: string;
  title: string | null;
  type: string | null;
  shortDescription: string | null;
  offerDeadline?: string | Date | null;
  status: typeof TenderStatus[keyof typeof TenderStatus] | null;
  keywords: string[];
  template?: { id: string; title: string }[];
};

type TemplatePlaceholder = {
  key: string;
  description: string;
  value?: string;
  matchingData?: Array<{
    value: string;
    source: string;
    item: unknown;
  }>;
};

type Template = {
  id: string;
  name: string;
  type: 'word' | 'excel';
  source: 'tender' | 'company' | 'custom';
  file?: File;
  isFavorite?: boolean;
  lastUsed?: number;
  placeholders?: TemplatePlaceholder[];
};

const STEPS = [
  {
    title: "Ausschreibung auswählen",
    description: "Wählen Sie eine Ausschreibung für Ihr Angebot",
  },
  {
    title: "Inhalte",
    description: "Prüfen Sie die benötigten Inhalte für Ihr Angebot",
  },
  {
    title: "Vorlagen",
    description: "Wählen Sie eine Vorlage für Ihr Angebot",
  },
  {
    title: "Angebot",
    description: "Fügen Sie Inhalte zu Ihrem Angebot hinzu",
  },
  {
    title: "Export",
    description: "Exportieren Sie Ihr Angebot",
  },
];

interface StepIndicatorProps {
  steps: { title: string; description: string }[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

const StepIndicator = ({ steps, currentStep, onStepClick }: StepIndicatorProps) => {
  return (
    <div className="relative">
      {/* Connecting lines */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10" />
      
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className={cn(
              "flex flex-col items-center cursor-pointer",
              index <= currentStep ? "text-primary" : "text-muted-foreground",
              onStepClick && index < currentStep ? "hover:text-primary/80" : "cursor-default"
            )}
            onClick={() => onStepClick && index < currentStep && onStepClick(index)}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-background",
              index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted"
            )}>
              {index + 1}
            </div>
            <div className="text-sm font-medium">{step.title}</div>
            <div className="text-xs text-center">{step.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Page() {
  const { data: tenders, isLoading: isLoadingTenders } = api.tenders.all.useQuery();
  const [selectedTender, setSelectedTender] = useState<TenderBackend | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [uploadedTemplates, setUploadedTemplates] = useState<Template[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [templatePlaceholders, setTemplatePlaceholders] = useState<TemplatePlaceholder[]>([]);


  // Update the employeePlaceholders state to use the imported constant
  const [employeePlaceholders, setEmployeePlaceholders] = useState<EmployeePlaceholder[]>(EMPLOYEE_PLACEHOLDERS);
  const [deliverablesPlaceholders, setDeliverablesPlaceholders] = useState<DeliverablesPlaceholder[]>(DELIVERABLES_PLACEHOLDERS);
  const [projectPlaceholders, setProjectPlaceholders] = useState<ProjectPlaceholder[]>(PROJECT_PLACEHOLDERS);

  // Add state for selected section
  const [selectedSection, setSelectedSection] = useState<'projects' | 'employees' | 'deliverables' | null>(null);

  // Add tRPC queries for placeholder data
  const projectPlaceholderData = api.placeholders.getPlaceholderData.useQuery(
    { type: 'project', id: 'all', placeholderIds: [] },
    { enabled: false }
  );
  const employeePlaceholderData = api.placeholders.getPlaceholderData.useQuery(
    { type: 'employee', id: 'all', placeholderIds: [] },
    { enabled: false }
  );
  const deliverablesPlaceholderData = api.placeholders.getPlaceholderData.useQuery(
    { type: 'deliverables', id: 'all', placeholderIds: [] },
    { enabled: false }
  );

  // Function to handle step click
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      setCurrentStep(stepIndex);
    }
  };

  // Filter tenders based on status and search query
  const filteredTenders = tenders?.filter(tender => {
    const isActive = tender.status !== TenderStatus.VERLOREN && 
                    tender.status !== TenderStatus.GEWONNEN && 
                    tender.status !== TenderStatus.PRAEQUALIFIKATION;
    
    const matchesSearch = searchQuery === "" || 
      tender.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

    return isActive && matchesSearch;
  });

  const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newTemplates: Template[] = [];
    for (const file of Array.from(files)) {
      // Basic file validation
      if (!file || file.size === 0) {
        toast.error(`${file.name} ist leer. Bitte laden Sie eine gültige Datei hoch.`);
        continue;
      }

      // Validate file type
      const isWord = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isWord && !isExcel) {
        toast.error(`${file.name} ist kein gültiges Word- oder Excel-Dokument.`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} ist zu groß. Maximale Dateigröße ist 10MB.`);
        continue;
      }

      const template: Template = {
        id: crypto.randomUUID(),
        name: file.name,
        type: isWord ? 'word' : 'excel',
        source: 'custom',
        file,
        isFavorite: false,
        lastUsed: Date.now()
      };

      newTemplates.push(template);
    }

    if (newTemplates.length > 0) {
      setUploadedTemplates(prev => [...prev, ...newTemplates]);
      toast.success('Vorlagen erfolgreich hochgeladen');
    }
  };

  const toggleFavorite = (templateId: string) => {
    setUploadedTemplates(prev => 
      prev.map(template => 
        template.id === templateId 
          ? { ...template, isFavorite: !template.isFavorite }
          : template
      )
    );
  };

  const filteredTemplates = uploadedTemplates.filter(template => 
    !showFavoritesOnly || template.isFavorite
  );

  // Function to extract placeholders from template
  const extractPlaceholders = async (template: Template) => {
    if (!template.file) return;

    try {
      const formData = new FormData();
      formData.append('file', template.file);

      const response = await fetch('/api/templates/extract-placeholders', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to extract placeholders');

      const data = await response.json();
      
      // Get all possible placeholders
      const allPlaceholders = getAllPlaceholders();

      // Match placeholders with schema fields and fetch data
      const matchedPlaceholders = await Promise.all(data.placeholders.map(async (placeholder: TemplatePlaceholder) => {
        // Find which type of placeholder this is
        const placeholderType = Object.entries(allPlaceholders).find(([, keys]) => 
          keys.includes(placeholder.key)
        )?.[0] as 'employees' | 'projects' | 'deliverables' | undefined;

        if (!placeholderType) {
          return {
            ...placeholder,
            value: '',
            matchingData: []
          };
        }

        // If we have selected placeholders from step 2, use those
        const selectedPlaceholders = {
          employees: employeePlaceholders.filter(p => p.selected),
          projects: projectPlaceholders.filter(p => p.selected),
          deliverables: deliverablesPlaceholders.filter(p => p.selected)
        };

        // If we have selected placeholders, use those IDs for fetching data
        const selectedIds = selectedPlaceholders[placeholderType].map(p => p.id);
        
        try {
          // Fetch data for this placeholder type
          let result;
          if (placeholderType === 'projects') {
            result = await projectPlaceholderData.refetch();
          } else if (placeholderType === 'employees') {
            result = await employeePlaceholderData.refetch();
          } else {
            result = await deliverablesPlaceholderData.refetch();
          }

          // Get the value from the result
          const value = result.data?.[placeholder.key];
          
          // Create matching data array
          const matchingData = [{
            value: value?.toString() ?? '',
            source: placeholderType,
            item: { id: selectedIds.length > 0 ? selectedIds[0] : 'all' }
          }];

          return {
            ...placeholder,
            value: value?.toString() ?? '',
            matchingData
          };
        } catch (error) {
          console.error(`Error fetching ${placeholderType} data:`, error);
          return {
            ...placeholder,
            value: '',
            matchingData: []
          };
        }
      }));

      setTemplatePlaceholders(matchedPlaceholders);
    } catch (error) {
      console.error('Error extracting placeholders:', error);
      toast.error('Fehler beim Extrahieren der Platzhalter');
    }
  };

  // Add function to handle section click
  const handleSectionClick = (section: 'projects' | 'employees' | 'deliverables') => {
    setSelectedSection(section);
  };

  // Determine which placeholders to use
  const selectedPlaceholders = {
    employees: employeePlaceholders.length > 0 ? employeePlaceholders : employeePlaceholders,
    projects: projectPlaceholders.length > 0 ? projectPlaceholders : projectPlaceholders,
    deliverables: deliverablesPlaceholders.length > 0 ? deliverablesPlaceholders : deliverablesPlaceholders
  };

  // Update data fetching to use schema fields
  const { data: employeesData } = api.callToTenderEmployee.getByTenderId.useQuery(
    { tenderId: selectedTender?.id ?? '' },
    { enabled: !!selectedTender?.id }
  );

  const { data: projectsData } = api.callToTenderProject.getByTenderId.useQuery(
    { callToTenderId: selectedTender?.id ?? '' },
    { enabled: !!selectedTender?.id }
  );

  const { data: deliverablesData } = api.callToTenderDeliverables.getByTenderId.useQuery(
    { callToTenderId: selectedTender?.id ?? '' },
    { enabled: !!selectedTender?.id }
  );

  // Update the placeholder selection logic in the UI
  const renderPlaceholderSection = (category: string, type: 'employees' | 'projects' | 'deliverables') => {
    const placeholders = selectedPlaceholders[type].filter(p => p.category === category);
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{category}</h3>
        <div className="grid grid-cols-2 gap-4">
          {placeholders.map((placeholder) => (
            <PlaceholderAccordion
              key={placeholder.id}
              placeholder={placeholder}
              isSelected={placeholder.selected}
              onSelect={(checked) => {
                if (type === 'employees') {
                  setEmployeePlaceholders(prev => 
                    prev.map(p => p.id === placeholder.id ? { ...p, selected: checked } : p)
                  );
                } else if (type === 'projects') {
                  setProjectPlaceholders(prev => 
                    prev.map(p => p.id === placeholder.id ? { ...p, selected: checked } : p)
                  );
                } else if (type === 'deliverables') {
                  setDeliverablesPlaceholders(prev => 
                    prev.map(p => p.id === placeholder.id ? { ...p, selected: checked } : p)
                  );
                }
              }}
              onFieldSelect={(fieldId) => {
                if (type === 'employees') {
                  setEmployeePlaceholders(prev => 
                    prev.map(p => {
                      if (p.id === placeholder.id && p.fields) {
                        return {
                          ...p,
                          fields: p.fields.map(f => 
                            f.id === fieldId ? { ...f, selected: !f.selected } : f
                          )
                        };
                      }
                      return p;
                    })
                  );
                } else if (type === 'projects') {
                  setProjectPlaceholders(prev => 
                    prev.map(p => {
                      if (p.id === placeholder.id && p.fields) {
                        return {
                          ...p,
                          fields: p.fields.map(f => 
                            f.id === fieldId ? { ...f, selected: !f.selected } : f
                          )
                        };
                      }
                      return p;
                    })
                  );
                } else if (type === 'deliverables') {
                  setDeliverablesPlaceholders(prev => 
                    prev.map(p => {
                      if (p.id === placeholder.id && p.fields) {
                        return {
                          ...p,
                          fields: p.fields.map(f => 
                            f.id === fieldId ? { ...f, selected: !f.selected } : f
                          )
                        };
                      }
                      return p;
                    })
                  );
                }
              }}
              selectedFields={placeholder.fields?.filter(f => f.selected).map(f => f.id) ?? []}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoadingTenders) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="w-full h-8" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Tender Selection (1/3) */}
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Für welche Ausschreibung möchten Sie ein Angebot erstellen?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Command className="rounded-lg border shadow-md">
                    <CommandInput 
                      placeholder="Suchen Sie nach einer Ausschreibung..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>Keine Ausschreibungen gefunden.</CommandEmpty>
                      <CommandGroup>
                        {filteredTenders?.map((tender) => (
                          <CommandItem
                            key={tender.id}
                            onSelect={() => {
                              const tenderWithCorrectStatus: TenderBackend = {
                                ...tender,
                                status: tender.status as typeof TenderStatus[keyof typeof TenderStatus]
                              };
                              setSelectedTender(tenderWithCorrectStatus);
                            }}
                            className="cursor-pointer"
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{tender.title ?? "-"}</span>
                              <span className="text-sm text-muted-foreground">{tender.type ?? "-"}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tender Details (2/3) */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ausschreibungsdetails</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTender ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{selectedTender.title}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTender.type}</p>
                      </div>
                      <p className="text-sm">{selectedTender.shortDescription}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Deadline</p>
                          <p className="text-sm">{formatDate(selectedTender.offerDeadline)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-sm">{selectedTender.status}</p>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => setCurrentStep(1)}
                        disabled={!selectedTender}
                      >
                        Weiter zur Vorlagenauswahl
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Wählen Sie eine Ausschreibung aus, um Details anzuzeigen
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Card className="bg-yellow-50 border-yellow-200 flex-1 mr-6">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800">Hinweis zur Platzhalterauswahl</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        In diesem Schritt können Sie optional bestimmte Platzhalter explizit auswählen. 
                        Wenn Sie keine Auswahl treffen, werden im nächsten Schritt automatisch alle relevanten 
                        Platzhalter aus der Vorlage berücksichtigt.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Button 
                className="whitespace-nowrap"
                onClick={() => setCurrentStep(2)}
              >
                Weiter zur Vorlagenauswahl
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Selected Items (1/3) */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Projekte</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/tenders/${selectedTender?.id}?tab=projects`, '_blank')}
                    >
                      Bearbeiten
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={cn(
                        "space-y-4 cursor-pointer",
                        selectedSection === 'projects' && "ring-2 ring-primary rounded-lg p-2"
                      )}
                      onClick={() => handleSectionClick('projects')}
                    >
                      {projectsData?.length ? (
                        projectsData.map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{project.project.title}</h4>
                              <p className="text-sm text-muted-foreground">{project.role}</p>
                              {project.description && (
                                <p className="text-sm mt-2">{project.description}</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Keine Projekte gefunden</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Mitarbeiter</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/tenders/${selectedTender?.id}?tab=employees`, '_blank')}
                    >
                      Bearbeiten
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={cn(
                        "space-y-4 cursor-pointer",
                        selectedSection === 'employees' && "ring-2 ring-primary rounded-lg p-2"
                      )}
                      onClick={() => handleSectionClick('employees')}
                    >
                      {employeesData?.length ? (
                        employeesData.map((employee) => (
                          <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">
                                {employee.employee.foreName} {employee.employee.lastName}
                              </h4>
                              <p className="text-sm text-muted-foreground">{employee.employeeCallToTenderRole}</p>
                              {employee.description && (
                                <p className="text-sm mt-2">{employee.description}</p>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Keine Mitarbeiter gefunden</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Liefergegenstände</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/tenders/${selectedTender?.id}?tab=deliverables`, '_blank')}
                    >
                      Bearbeiten
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className={cn(
                        "space-y-4 cursor-pointer",
                        selectedSection === 'deliverables' && "ring-2 ring-primary rounded-lg p-2"
                      )}
                      onClick={() => handleSectionClick('deliverables')}
                    >
                      {deliverablesData?.length ? (
                        deliverablesData.map((deliverable) => (
                          <div key={deliverable.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{deliverable.deliverables.title}</h4>
                              <p className="text-sm text-muted-foreground">{deliverable.deliverables.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground">Keine Liefergegenstände gefunden</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Available Placeholders (2/3) */}
              {selectedSection === 'employees' && (
                <div className="col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verfügbare Mitarbeiterinformationen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="select" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="select">Auswählen</TabsTrigger>
                          <TabsTrigger value="copy">Kopieren</TabsTrigger>
                        </TabsList>

                        <TabsContent value="select">
                          <div className="space-y-6">
                            {['basic', 'experience', 'education', 'certificates', 'skills', 'projects'].map((category) => (
                              <div key={category} className="space-y-4">
                                {renderPlaceholderSection(category, 'employees')}
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="copy" className="mt-0">
                          <PlaceholderCopy type="employee" />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
              {selectedSection === 'deliverables' && (
                <div className="col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verfügbare Liefergegenstände</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="select" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="select">Auswählen</TabsTrigger>
                          <TabsTrigger value="copy">Kopieren</TabsTrigger>
                        </TabsList>

                        <TabsContent value="select">
                          <div className="space-y-6">
                            {['basic', 'content', 'templates', 'tenders'].map((category) => (
                              <div key={category} className="space-y-4">
                                {renderPlaceholderSection(category, 'deliverables')}
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="copy" className="mt-0">
                          <PlaceholderCopy type="deliverable" />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
              {selectedSection === 'projects' && (
                <div className="col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verfügbare Projektinformationen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="select" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="select">Auswählen</TabsTrigger>
                          <TabsTrigger value="copy">Kopieren</TabsTrigger>
                        </TabsList>

                        <TabsContent value="select">
                          <div className="space-y-6">
                            {['basic', 'details', 'volume', 'dates', 'standards', 'contacts', 'organizations', 'activities', 'tenders'].map((category) => (
                              <div key={category} className="space-y-4">
                                {renderPlaceholderSection(category, 'projects')}
                              </div>
                            ))}
                          </div>
                        </TabsContent>

                        <TabsContent value="copy" className="mt-0">
                          <PlaceholderCopy type="project" />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
              >
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!selectedTemplate}
              >
                Weiter
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Template Selection (1/3) */}
              <div className="col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Vorlagen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="tender" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="tender">Ausschreibung</TabsTrigger>
                        <TabsTrigger value="company">Unternehmen</TabsTrigger>
                        <TabsTrigger value="custom">Eigene</TabsTrigger>
                      </TabsList>

                      <TabsContent value="tender" className="space-y-4">
                        {selectedTender?.template?.length ? (
                          <div className="space-y-2">
                            {selectedTender.template.map((template) => (
                              <div
                                key={template.id}
                                className={cn(
                                  "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                                  selectedTemplate?.id === template.id && "bg-accent"
                                )}
                                onClick={() => handleTemplateSelect({
                                  id: template.id,
                                  name: template.title,
                                  type: 'word', // Assuming tender templates are Word docs
                                  source: 'tender'
                                })}
                              >
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span>{template.title}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-4">
                            Keine Vorlagen in der Ausschreibung vorhanden
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="company" className="space-y-4">
                        <div className="text-center text-muted-foreground py-4">
                          Unternehmensvorlagen werden hier angezeigt
                        </div>
                      </TabsContent>

                      <TabsContent value="custom" className="space-y-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="template-upload" className="cursor-pointer">
                              <div className="flex items-center gap-2 text-primary hover:text-primary/80">
                                <Upload className="h-4 w-4" />
                                Vorlage hochladen
                              </div>
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                            >
                              {showFavoritesOnly ? "Alle anzeigen" : "Nur Favoriten"}
                            </Button>
                          </div>
                          <Input
                            id="template-upload"
                            type="file"
                            accept=".docx,.xlsx"
                            className="hidden"
                            onChange={handleTemplateUpload}
                            multiple
                          />
                          <ScrollArea className="h-[300px]">
                            <div className="space-y-2">
                              {filteredTemplates.length > 0 ? (
                                filteredTemplates.map((template) => (
                                  <div
                                    key={template.id}
                                    className={cn(
                                      "flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent",
                                      selectedTemplate?.id === template.id && "bg-accent"
                                    )}
                                    onClick={() => handleTemplateSelect(template)}
                                  >
                                    <div className="flex items-center gap-2">
                                      {template.type === 'word' ? (
                                        <FileText className="h-4 w-4" />
                                      ) : (
                                        <FileSpreadsheet className="h-4 w-4" />
                                      )}
                                      <span>{template.name}</span>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFavorite(template.id);
                                      }}
                                    >
                                      {template.isFavorite ? (
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      ) : (
                                        <StarOff className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center text-muted-foreground py-4">
                                  Keine Vorlagen hochgeladen
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Template Details (2/3) */}
              <div className="col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Vorlagendetails</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderTemplateDetails()}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center h-16 w-16">
                    <Image
                      src="/merlin-logo-dark.png"
                      alt="Merlin Logo"
                      width={64}
                      height={64}
                      className="rounded-full bg-white p-2 shadow"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-800">KI-Verbesserung kommt bald</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Wir arbeiten an einer KI-gestützten Verbesserung Ihrer Angebote. Diese Funktion wird in Kürze verfügbar sein.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                Zurück
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
              >
                Weiter
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Ausschreibung</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTender?.title || 'Keine Ausschreibung ausgewählt'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Vorlage</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedTemplate?.name || 'Keine Vorlage ausgewählt'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Ausgewählte Platzhalter</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Mitarbeiter</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {employeePlaceholders
                            .filter(p => p.selected)
                            .map(p => (
                              <li key={p.id}>{p.title}</li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Projekte</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {projectPlaceholders
                            .filter(p => p.selected)
                            .map(p => (
                              <li key={p.id}>{p.title}</li>
                            ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-2">Liefergegenstände</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {deliverablesPlaceholders
                            .filter(p => p.selected)
                            .map(p => (
                              <li key={p.id}>{p.title}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                    >
                      Zurück
                    </Button>
                    <Button
                      onClick={handleExport}
                      disabled={!selectedTemplate || !selectedTender}
                    >
                      Exportieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const renderTemplateDetails = () => {
    if (!selectedTemplate) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedTemplate.type === 'word' ? (
              <FileText className="h-6 w-6" />
            ) : (
              <FileSpreadsheet className="h-6 w-6" />
            )}
            <div>
              <h3 className="font-semibold">{selectedTemplate.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.source === 'tender' 
                  ? 'Ausschreibungsvorlage'
                  : selectedTemplate.source === 'company'
                  ? 'Unternehmensvorlage'
                  : 'Eigene Vorlage'}
              </p>
            </div>
          </div>
        </div>

        {templatePlaceholders.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Verfügbare Platzhalter</h4>
            <ScrollArea className="h-[600px] border rounded-md p-4">
              <div className="space-y-4">
                {templatePlaceholders.map((placeholder) => (
                  <div key={placeholder.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{placeholder.key}</p>
                        <p className="text-xs text-muted-foreground">{placeholder.description}</p>
                      </div>
                      <Select
                        value={placeholder.value || 'none'}
                        onValueChange={(value) => {
                          setTemplatePlaceholders(prev =>
                            prev.map(p =>
                              p.key === placeholder.key
                                ? { ...p, value: value === 'none' ? '' : value }
                                : p
                            )
                          );
                        }}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Wert auswählen" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Kein Wert</SelectItem>
                          {placeholder.matchingData?.map((match, index) => (
                            <SelectItem 
                              key={`${match.source}-${index}`} 
                              value={match.value || `value-${index}`}
                            >
                              {match.value || 'Kein Wert'} ({match.source})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {placeholder.matchingData && placeholder.matchingData.length > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {placeholder.matchingData.length} mögliche Werte gefunden
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  // Update template selection to include placeholder extraction
  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    if (template.file) {
      await extractPlaceholders(template);
    }
  };

  // Add this function near the top of the component, after the state declarations
  const handleExport = async () => {
    if (!selectedTemplate || !selectedTender) {
      toast.error('Bitte wählen Sie eine Vorlage und eine Ausschreibung aus.');
      return;
    }

    try {
      // Create a FormData object to send the template and placeholder data
      const formData = new FormData();
      if (selectedTemplate.file) {
        formData.append('file', selectedTemplate.file);
      } else {
        toast.error('Keine Vorlagendatei gefunden');
        return;
      }
      
      formData.append('placeholders', JSON.stringify(templatePlaceholders));

      // Show loading toast
      const loadingToast = toast.loading('Export wird vorbereitet...');

      // Send the export request
      const response = await fetch('/api/templates/export', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.name}-exported.${selectedTemplate.type === 'word' ? 'docx' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Update loading toast to success
      toast.dismiss(loadingToast);
      toast.success('Export erfolgreich');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export fehlgeschlagen');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Step Indicator */}
      <StepIndicator 
        steps={STEPS} 
        currentStep={currentStep} 
        onStepClick={handleStepClick}
      />

      {/* Main Content */}
      {renderStepContent()}
    </div>
  );
} 