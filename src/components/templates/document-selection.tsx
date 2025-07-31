import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus } from 'lucide-react';
import { DocumentType, DocumentSelection, DOCUMENT_TYPES } from '@/types/templates';
import { ItemSelection } from './item-selection';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import type { BaseItem } from './item-selection';

type DocumentSelectionProps = {
  onSelectionChange: (selections: DocumentSelection[]) => void;
  initialSelections?: DocumentSelection[];
  callToTenderId: string;
};

export function DocumentSelectionStep({ onSelectionChange, initialSelections = [], callToTenderId }: DocumentSelectionProps) {
  const [selections, setSelections] = useState<DocumentSelection[]>(initialSelections);
  const [selectedDocumentIndex, setSelectedDocumentIndex] = useState<number | null>(null);

  // Query for tender-related items
  const tenderProjects = api.callToTenderProject.getByTenderId.useQuery(
    { callToTenderId: callToTenderId },
    { enabled: !!callToTenderId }
  );

  const tenderDeliverables = api.callToTenderDeliverables.getByTenderId.useQuery(
    { callToTenderId: callToTenderId },
    { enabled: !!callToTenderId }
  );

  const tenderEmployees = api.callToTenderEmployee.getByTenderId.useQuery(
    { tenderId: callToTenderId },
    { enabled: !!callToTenderId }
  );

  // Pre-select items when tender is loaded
  useEffect(() => {
    const preSelectedItems: DocumentSelection[] = [];

    // Add projects (category: 'Referenzen')
    if (tenderProjects.data?.length) {
      const projectType = DOCUMENT_TYPES.find(t => t.id === 'projects' && t.category === 'Referenzen');
      if (projectType) {
        preSelectedItems.push({
          type: projectType,
          quantity: 1,
          selectedItems: Array.from(new Set(tenderProjects.data
            .filter(item => item.project)
            .map(item => item.project.id)))
        });
      }
    }

    // Add deliverables (category: 'Konzepte')
    if (tenderDeliverables.data?.length) {
      const deliverableType = DOCUMENT_TYPES.find(t => t.id === 'deliverables' && t.category === 'Konzepte');
      if (deliverableType) {
        preSelectedItems.push({
          type: deliverableType,
          quantity: 1,
          selectedItems: Array.from(new Set(tenderDeliverables.data
            .filter(item => item.deliverables)
            .map(item => item.deliverables!.id)))
        });
      }
    }

    // Add employees (category: 'Profile')
    if (tenderEmployees.data?.length) {
      const employeeType = DOCUMENT_TYPES.find(t => t.id === 'employees' && t.category === 'Profile');
      if (employeeType) {
        preSelectedItems.push({
          type: employeeType,
          quantity: 1,
          selectedItems: Array.from(new Set(tenderEmployees.data
            .filter(item => item.employee)
            .map(item => item.employee.id)))
        });
      }
    }

    if (preSelectedItems.length > 0) {
      setSelections(preSelectedItems);
      onSelectionChange(preSelectedItems);
    }
  }, [callToTenderId, tenderProjects.data, tenderDeliverables.data, tenderEmployees.data, onSelectionChange]);

  const handleAddDocument = () => {
    const firstType = DOCUMENT_TYPES[0];
    if (firstType) {
      setSelections([
        ...selections,
        {
          type: firstType,
          quantity: 1,
          selectedItems: [],
        },
      ]);
      setSelectedDocumentIndex(selections.length);
    }
  };

  const handleRemoveDocument = (index: number) => {
    const newSelections = selections.filter((_, i) => i !== index);
    setSelections(newSelections);
    onSelectionChange(newSelections);
    if (selectedDocumentIndex === index) {
      setSelectedDocumentIndex(null);
    } else if (selectedDocumentIndex !== null && selectedDocumentIndex > index) {
      setSelectedDocumentIndex(selectedDocumentIndex - 1);
    }
  };

  const handleDocumentTypeChange = (index: number, type: DocumentType) => {
    const newSelections = [...selections];
    newSelections[index] = {
      ...newSelections[index],
      type,
      selectedItems: [], // Clear selected items when type changes
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const newSelections = [...selections];
    newSelections[index] = {
      ...newSelections[index],
      quantity,
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  const handleSelectionChange = (index: number, selectedItems: BaseItem[]) => {
    const uniqueIds = Array.from(new Set(selectedItems.map(item => item.id)));
    const newSelections = [...selections];
    newSelections[index] = {
      ...newSelections[index],
      selectedItems: uniqueIds,
    };
    setSelections(newSelections);
    onSelectionChange(newSelections);
  };

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left Column - Document Types (1/3) */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Dokumenttypen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selections.map((selection, index) => (
                <div
                  key={index}
                  className={cn(
                    "p-4 rounded-lg border cursor-pointer",
                    selectedDocumentIndex === index ? "border-primary" : "border-border"
                  )}
                  onClick={() => setSelectedDocumentIndex(index)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{selection.type.name}</h3>
                      <p className="text-sm text-muted-foreground">{selection.type.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDocument(index);
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddDocument}
              >
                <Plus className="h-4 w-4 mr-2" />
                Dokumenttyp hinzufügen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Document Details (2/3) */}
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Dokumentdetails</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDocumentIndex !== null ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Dokumenttyp</Label>
                    <Select
                      value={selections[selectedDocumentIndex].type.id}
                      onValueChange={(value) => {
                        const type = DOCUMENT_TYPES.find(t => t.id === value);
                        if (type) {
                          handleDocumentTypeChange(selectedDocumentIndex, type);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Menge</Label>
                    <Input
                      type="number"
                      min="1"
                      value={selections[selectedDocumentIndex].quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        const parsedValue = parseInt(value);
                        handleQuantityChange(selectedDocumentIndex, isNaN(parsedValue) ? 1 : parsedValue);
                      }}
                    />
                  </div>

                  <div>
                    <Label>Ausgewählte Elemente</Label>
                    <ItemSelection
                      documentType={selections[selectedDocumentIndex].type}
                      tenderId={callToTenderId}
                      selectedItems={selections[selectedDocumentIndex].selectedItems.map(id => {
                        // Find the item in the appropriate data source
                        const item = selections[selectedDocumentIndex].type.models.tender === 'CallToTenderProjects'
                          ? tenderProjects.data?.find(p => p.project?.id === id)?.project
                          : tenderDeliverables.data?.find(d => d.deliverables?.id === id)?.deliverables;
                        
                        return {
                          id,
                          title: item?.title || 'Untitled',
                          type: item?.type || null,
                          description: item?.description || null
                        };
                      })}
                      onSelectionChange={(items) => handleSelectionChange(selectedDocumentIndex, items)}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Wählen Sie einen Dokumenttyp aus, um Details anzuzeigen
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 