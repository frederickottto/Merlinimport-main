import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X, Check, Search } from 'lucide-react';
import { api } from '@/trpc/react';
import { DocumentType } from '@/types/templates';
import { EMPLOYEE_PLACEHOLDERS } from '@/lib/employee-placeholders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface BaseItem {
  id: string;
  title: string;
  type?: string | null;
  description?: string | null;
}

interface ItemSelectionProps {
  documentType: DocumentType;
  tenderId: string;
  selectedItems: BaseItem[];
  onSelectionChange: (items: BaseItem[]) => void;
}

export function ItemSelection({ documentType, tenderId, selectedItems, onSelectionChange }: ItemSelectionProps) {
  const [search, setSearch] = useState('');
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'items' | 'placeholders'>('items');

  console.log('ItemSelection Props:', {
    documentType,
    tenderId,
    selectedItems,
  });

  // Query for tender-related items
  const tenderQuery = api.callToTenderProject.getByTenderId.useQuery(
    { callToTenderId: tenderId },
    { enabled: !!tenderId && documentType.models.tender === 'CallToTenderProjects' }
  );

  // Query for base items
  const baseQuery = api.callToTenderDeliverables.getAll.useQuery(
    undefined,
    { enabled: documentType.models.base === 'Deliverables' }
  );

  console.log('Query Results:', {
    tenderQuery: {
      data: tenderQuery.data,
      error: tenderQuery.error,
      isLoading: tenderQuery.isLoading,
    },
    baseQuery: {
      data: baseQuery.data,
      error: baseQuery.error,
      isLoading: baseQuery.isLoading,
    },
  });

  const handleSelect = (item: BaseItem) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    if (isSelected) {
      onSelectionChange(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      onSelectionChange([...selectedItems, item]);
    }
  };

  const handleCopyPlaceholder = (placeholder: string) => {
    const formattedPlaceholder = `{{${placeholder}}}`;
    navigator.clipboard.writeText(formattedPlaceholder);
    setCopiedPlaceholder(placeholder);
    setTimeout(() => setCopiedPlaceholder(null), 2000);
  };

  // Transform the data based on the document type
  const items = documentType.models.tender === 'CallToTenderProjects' 
    ? tenderQuery.data?.map((item) => {
        console.log('Processing tender item:', item);
        if (!item.project) {
          console.warn('Project data missing for item:', item);
          return null;
        }
        const transformedItem: BaseItem = {
          id: item.project.id,
          title: item.project.title || 'Untitled',
          type: item.project.type || null,
          description: item.project.description || null,
        };
        return transformedItem;
      }).filter((item): item is BaseItem => item !== null) ?? []
    : baseQuery.data?.map((item) => {
        console.log('Processing base item:', item);
        if (!item.deliverables) {
          console.warn('Deliverables data missing for item:', item);
          return null;
        }
        const transformedItem: BaseItem = {
          id: item.deliverables.id,
          title: item.deliverables.title || 'Untitled',
          type: item.deliverables.type || null,
          description: item.deliverables.description || null,
        };
        return transformedItem;
      }).filter((item): item is BaseItem => item !== null) ?? [];

  console.log('Transformed Items:', items);
  console.log('Search Term:', search);
  
  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );
  
  console.log('Filtered Items:', filteredItems);

  const filteredPlaceholders = EMPLOYEE_PLACEHOLDERS.filter(placeholder => {
    const searchLower = search.toLowerCase();
    return (
      placeholder.title.toLowerCase().includes(searchLower) ||
      placeholder.description.toLowerCase().includes(searchLower) ||
      placeholder.fields?.some(field => 
        field.title.toLowerCase().includes(searchLower) ||
        field.description.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">Selected Items</h3>
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item.id} variant="secondary" className="flex items-center gap-1">
              {item.title}
              <button
                onClick={() => handleSelect(item)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'items' | 'placeholders')}>
        <TabsList className="w-full">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <Command>
            <CommandInput
              placeholder="Search items..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {selectedItems.some((selected) => selected.id === item.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <div>
                      <div className="font-medium">{item.title}</div>
                      {item.type && (
                        <div className="text-sm text-muted-foreground">
                          {item.type}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedItems.some((selected) => selected.id === item.id) && (
                    <Badge variant="secondary">Selected</Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </TabsContent>

        <TabsContent value="placeholders">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <CommandInput
              placeholder="Search placeholders..."
              value={search}
              onValueChange={setSearch}
              className="pl-8"
            />
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4 mt-4">
              {filteredPlaceholders.map((placeholder) => (
                <div key={placeholder.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{placeholder.title}</h3>
                      <Badge variant="outline">{placeholder.category}</Badge>
                    </div>
                    <button
                      onClick={() => handleCopyPlaceholder(placeholder.id)}
                      className={`px-2 py-1 text-sm rounded-md border ${
                        copiedPlaceholder === placeholder.id ? 'bg-green-100' : 'hover:bg-accent'
                      }`}
                    >
                      {copiedPlaceholder === placeholder.id ? 'Kopiert!' : 'Kopieren'}
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{placeholder.description}</p>
                  {placeholder.fields && (
                    <div className="grid grid-cols-2 gap-2">
                      {placeholder.fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between rounded-md border p-2"
                        >
                          <div>
                            <p className="text-sm font-medium">{field.title}</p>
                            <p className="text-xs text-muted-foreground">{field.description}</p>
                          </div>
                          <button
                            onClick={() => handleCopyPlaceholder(field.id)}
                            className={`px-2 py-1 text-sm rounded-md border ${
                              copiedPlaceholder === field.id ? 'bg-green-100' : 'hover:bg-accent'
                            }`}
                          >
                            {copiedPlaceholder === field.id ? 'Kopiert!' : 'Kopieren'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 