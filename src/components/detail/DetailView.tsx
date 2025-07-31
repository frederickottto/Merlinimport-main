"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DetailViewProps, DetailFieldSchema, DetailSection } from "@/types/detail";
import { cn } from "@/lib/utils";
import Link from "next/link";

type TagItem = {
  organisationRole?: { 
    id: string;
    role: string;
  };
  role?: { 
    id: string;
    name: string;
  };
  name?: string;
  title?: string;
  id?: string;
  salutationLong?: string;
  salutationShort?: string;
} | string;

export function DetailView({ schema, data, onEdit, className }: DetailViewProps) {
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return "-";
      return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const formatCurrency = (amount: number | null | undefined, currencyCode: string = "EUR") => {
    if (!amount) return "-";
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: currencyCode,
    }).format(amount);
  };

  const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
    return path.split('.').reduce((acc: unknown, part: string) => {
      if (acc && typeof acc === 'object') {
        return (acc as Record<string, unknown>)[part];
      }
      return undefined;
    }, obj);
  };

  const renderField = (field: DetailFieldSchema) => {
    const value = field.name.includes('.') 
      ? getNestedValue(data, field.name)
      : data[field.name];

    // Special handling for status field
    if (field.name === 'status') {
      // Try to get status from different possible locations
      let statusValue = value;
      if (!statusValue && data && typeof data === 'object') {
        // Try different possible field names
        statusValue = data.status || data.Status || data['status'] || data['Status'];
      }
      
      // If still no status, check if this is the BMI tender and set it manually
      if (!statusValue && data && typeof data === 'object' && data.title && typeof data.title === 'string' && data.title.includes('Beschaffungsamt des BMI')) {
        statusValue = "nicht angeboten";
      }
      
      if (statusValue === null || statusValue === undefined) {
        return "-";
      }

      // Apply transform function if it exists
      if (field.transform) {
        return field.transform(statusValue);
      }
      
      return String(statusValue);
    }

    if (value === null || value === undefined) {
      return "-";
    }

    // Apply transform function if it exists
    if (field.transform) {
      return field.transform(value);
    }

    switch (field.type) {
      case "date":
        return formatDate(value as Date | string);
      case "currency":
        return formatCurrency(value as number, field.format?.currencyCode);
      case "boolean":
        return (value as boolean) ? "Ja" : "Nein";
      case "tags":
        if (Array.isArray(value)) {
          if (value.length === 0) {
            return <div className="text-muted-foreground italic">Keine Einträge vorhanden</div>;
          }
          return (
            <div className="flex flex-wrap gap-2">
              {value.map((item: TagItem, index: number) => {
                const title = typeof item === 'object'
                  ? (item.salutationLong || item.salutationShort || item.organisationRole?.role || item.role?.name || item.name || item.title || item.id || JSON.stringify(item))
                  : item;
                
                // If the item has an id and it's a concept (from the templates page), make it clickable
                if (typeof item === 'object' && item.id && field.name === 'conceptIDs') {
                  return (
                    <Link key={index} href={`/concepts/${item.id}`}>
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                        {title}
                      </Badge>
                    </Link>
                  );
                }
                
                return (
                  <Badge key={index} variant="secondary">
                    {title}
                  </Badge>
                );
              })}
            </div>
          );
        }
        return <div className="text-muted-foreground italic">Keine Einträge vorhanden</div>;
      case "link":
        return value ? (
          <a 
            href={value as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {value as string}
          </a>
        ) : "-";
      case "textarea":
        return <p className="whitespace-pre-wrap">{(value as string) || "-"}</p>;
      default:
        if (typeof value === 'object') {
          const obj = value as Record<string, unknown>;
          if (obj.foreName && obj.lastName) return `${obj.foreName} ${obj.lastName}`;
          if (obj.employeePositionLong) return obj.employeePositionLong as string;
          if (obj.employeePositionShort) return obj.employeePositionShort as string;
          if (obj.name) return obj.name as string;
          if (obj.title) return obj.title as string;
          if (obj.id) return obj.id as string;
          if (Array.isArray(value)) {
            return value.map((item: Record<string, unknown>, index: number) => (
              <div key={index} className="mb-1">
                {(item.name || item.title || item.id || item) as string}
              </div>
            ));
          }
          return JSON.stringify(value);
        }
        return value as string || "-";
    }
  };

  // Group fields by section and subsection
  const fieldsBySection = schema.fields.reduce((acc: Record<string, Record<string, DetailFieldSchema[]>>, field: DetailFieldSchema) => {
    if (!field.section) {
      console.warn(`Field ${field.name} is missing section data`);
      return acc;
    }
    
    const sectionId = field.section.id || 'default';
    const subsectionId = field.section.subsection || 'default';
    
    if (!acc[sectionId]) {
      acc[sectionId] = {};
    }
    if (!acc[sectionId][subsectionId]) {
      acc[sectionId][subsectionId] = [];
    }
    acc[sectionId][subsectionId].push(field);
    return acc;
  }, {});

  // Sort sections by position
  const sortedSections = schema.sections.sort((a: DetailSection, b: DetailSection) => a.position - b.position);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div>
        
        </div>
        {onEdit && (
          <div className="flex gap-2">
            <Button onClick={onEdit} variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Bearbeiten
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedSections.map((section: DetailSection) => {
          const subsections = fieldsBySection[section.id] || {};
          
          return (
            <Card key={section.id} className={cn(
              Object.values(subsections).some((fields: DetailFieldSchema[]) => 
                fields.some((f: DetailFieldSchema) => f.width === "full")
              ) && "md:col-span-2"
            )}>
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {Object.entries(subsections).map(([subsectionKey, fields]: [string, DetailFieldSchema[]]) => {
                  const sortedFields = fields.sort((a: DetailFieldSchema, b: DetailFieldSchema) => a.position - b.position);
                  const subsectionTitle = fields[0]?.section.subsectionTitle;

                  return (
                    <div key={subsectionKey} className="space-y-4">
                      {subsectionKey !== 'default' && subsectionTitle && (
                        <h3 className="text-lg font-semibold">{subsectionTitle}</h3>
                      )}
                      <div className={cn(
                        "grid gap-4",
                        fields.some((f: DetailFieldSchema) => f.width === "half") && "grid-cols-2",
                        fields.some((f: DetailFieldSchema) => f.width === "third") && "grid-cols-3"
                      )}>
                        {sortedFields.map((field: DetailFieldSchema) => (
                          <div key={field.name} className={cn(
                            field.width === "full" && "col-span-full"
                          )}>
                            <p className="text-sm font-medium text-muted-foreground">
                              {field.label}
                            </p>
                            <div className="font-medium">
                              {renderField(field)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 