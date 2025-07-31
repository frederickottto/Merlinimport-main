'use client';

import { useState } from 'react';
import { EMPLOYEE_PLACEHOLDERS } from '@/lib/employee-placeholders';
import { PROJECT_PLACEHOLDERS } from '@/lib/project-placeholders';
import { DELIVERABLES_PLACEHOLDERS } from '@/lib/deliverables-placeholders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

type PlaceholderType = 'employee' | 'project' | 'deliverable';

interface PlaceholderCopyProps {
  type: PlaceholderType;
}

export function PlaceholderCopy({ type }: PlaceholderCopyProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedPlaceholder, setCopiedPlaceholder] = useState<string | null>(null);

  const handleCopy = (placeholder: string) => {
    const formattedPlaceholder = `{{${placeholder}}}`;
    navigator.clipboard.writeText(formattedPlaceholder);
    setCopiedPlaceholder(placeholder);
    setTimeout(() => setCopiedPlaceholder(null), 2000);
  };

  const getPlaceholders = () => {
    switch (type) {
      case 'employee':
        return EMPLOYEE_PLACEHOLDERS;
      case 'project':
        return PROJECT_PLACEHOLDERS;
      case 'deliverable':
        return DELIVERABLES_PLACEHOLDERS;
      default:
        return [];
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      // Employee categories
      case 'basic':
        return 'Allg.';
      case 'experience':
        return 'Erf.';
      case 'education':
        return 'Ausb.';
      case 'certificates':
        return 'Zert.';
      case 'skills':
        return 'Skills';
      case 'projects':
        return 'Projekte';
      case 'training':
        return 'Schulungen';
      case 'tasks':
        return 'Tasks';
      case 'division':
        return 'Abt.';
      case 'callToTender':
        return 'Tender';
      // Project categories
      case 'details':
        return 'Details';
      case 'volume':
        return 'Volumen';
      case 'dates':
        return 'Daten';
      case 'standards':
        return 'Standards';
      case 'contacts':
        return 'Kontakte';
      case 'organizations':
        return 'Org.';
      case 'activities':
        return 'Aktiv.';
      case 'tenders':
        return 'Tender';
      // Deliverable categories
      case 'content':
        return 'Inhalt';
      case 'templates':
        return 'Templates';
      default:
        return category;
    }
  };

  const placeholders = getPlaceholders();
  const filteredPlaceholders = placeholders.filter(placeholder => {
    const searchLower = searchTerm.toLowerCase();
    return (
      placeholder.title.toLowerCase().includes(searchLower) ||
      placeholder.description.toLowerCase().includes(searchLower) ||
      placeholder.fields?.some(field => 
        field.title.toLowerCase().includes(searchLower) ||
        field.description.toLowerCase().includes(searchLower)
      )
    );
  });

  const categories = Array.from(new Set(placeholders.map(p => p.category)));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Placeholder Kopieren</CardTitle>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Placeholdern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={categories[0]} className="w-full">
          <TabsList className="w-full justify-start">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {getCategoryLabel(category)}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredPlaceholders
                    .filter(p => p.category === category)
                    .map((placeholder) => (
                      <div key={placeholder.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{placeholder.title}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(placeholder.id)}
                            className={copiedPlaceholder === placeholder.id ? 'bg-green-100' : ''}
                          >
                            {copiedPlaceholder === placeholder.id ? 'Kopiert!' : 'Kopieren'}
                          </Button>
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopy(field.id)}
                                  className={copiedPlaceholder === field.id ? 'bg-green-100' : ''}
                                >
                                  {copiedPlaceholder === field.id ? 'Kopiert!' : 'Kopieren'}
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 