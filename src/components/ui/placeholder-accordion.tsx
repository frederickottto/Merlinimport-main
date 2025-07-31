"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Check, ChevronDown } from "lucide-react"

interface PlaceholderAccordionProps {
  placeholder: {
    id: string;
    title: string;
    category: string;
    fields?: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  };
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onFieldSelect?: (fieldId: string) => void;
  selectedFields?: string[];
}

export function PlaceholderAccordion({
  placeholder,
  isSelected,
  onSelect,
  onFieldSelect,
  selectedFields = []
}: PlaceholderAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem 
        value={placeholder.id} 
        className={cn(
          "border rounded-lg transition-all duration-200",
          isSelected && "ring-2 ring-primary/50 bg-primary/5"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onSelect(!isSelected)}
              className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                isSelected 
                  ? "bg-primary border-primary text-primary-foreground" 
                  : "border-muted-foreground/25 hover:border-primary/50"
              )}
            >
              {isSelected && <Check className="h-4 w-4" />}
            </button>
            <label
              htmlFor={placeholder.id}
              className="text-sm font-medium leading-none cursor-pointer"
            >
              {placeholder.title}
            </label>
          </div>
          {placeholder.fields && placeholder.fields.length > 0 && (
            <AccordionTrigger className="py-0 hover:no-underline">
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
            </AccordionTrigger>
          )}
        </div>
        
        {placeholder.fields && placeholder.fields.length > 0 && (
          <AccordionContent>
            <div className="px-4 pb-4 space-y-2">
              {placeholder.fields.map((field) => (
                <div key={field.id} className="flex items-center space-x-3 pl-9">
                  <button
                    onClick={() => onFieldSelect?.(field.id)}
                    className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      selectedFields.includes(field.id)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    )}
                  >
                    {selectedFields.includes(field.id) && <Check className="h-3 w-3" />}
                  </button>
                  <label
                    htmlFor={field.id}
                    className="text-sm leading-none cursor-pointer"
                  >
                    {field.title}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        )}
      </AccordionItem>
    </Accordion>
  );
} 