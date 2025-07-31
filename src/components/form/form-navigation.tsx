"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Building2, ClipboardList, FileText, LucideIcon, Package, Settings, Users } from "lucide-react";

import type { FormFieldSchema } from "@/types/form";

interface FormNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  className?: string;
  fields: FormFieldSchema[];
}

const iconMap: Record<string, LucideIcon> = {
  overview: FileText,
  conditions: ClipboardList,
  description: FileText,
  deliverables: Package,
  processes: Settings,
  partners: Building2,
  team: Users,
};

export function FormNavigation({ activeSection, onSectionChange, className, fields }: FormNavigationProps) {
  // Get unique sections from fields
  const sections = Array.from(
    new Set(fields.map((field) => field.section.id))
  ).map((sectionId) => {
    const field = fields.find((f) => f.section.id === sectionId);
    return {
      id: sectionId,
      title: field?.section.title || sectionId,
      icon: iconMap[sectionId] || FileText,
    };
  });

  // Sort sections by the position of their first field
  sections.sort((a, b) => {
    const aField = fields.find((f) => f.section.id === a.id);
    const bField = fields.find((f) => f.section.id === b.id);
    return (aField?.position || 0) - (bField?.position || 0);
  });

  return (
    <div className={cn("w-64 border-r bg-muted/40", className)}>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="space-y-1 p-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-2",
                activeSection === section.id && "bg-secondary"
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <section.icon className="h-4 w-4" />
              {section.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 