"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormSchema, createFormValidationSchema } from "@/types/form";
import { DynamicFormField } from "./form-field";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface DynamicFormProps {
  schema: FormSchema;
  defaultValues?: Record<string, unknown>;
  context?: Record<string, unknown>;
  className?: string;
}

export function DynamicForm({
  schema,
  defaultValues = {},
  context = {},
  className,
}: DynamicFormProps) {
  const validationSchema = createFormValidationSchema(schema.fields);
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      ...defaultValues,
      ...context,
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (schema.onSubmit) {
        await schema.onSubmit(data);
      }
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  // Group fields by section, preserving order
  const groupedFieldsMap: Record<string, { sectionTitle: string; fields: typeof schema.fields }> = {};
  const sectionOrder: string[] = [];
  schema.fields.forEach(field => {
    const sectionId = field.section.id;
    if (!groupedFieldsMap[sectionId]) {
      groupedFieldsMap[sectionId] = { sectionTitle: field.section.title, fields: [] };
      sectionOrder.push(sectionId);
    }
    groupedFieldsMap[sectionId].fields.push(field);
  });
  const groupedFields = sectionOrder.map(sectionId => ({
    section: sectionId,
    sectionTitle: groupedFieldsMap[sectionId].sectionTitle,
    fields: groupedFieldsMap[sectionId].fields,
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        {groupedFields.map(group => (
          <div key={group.section} className="space-y-4" >
            <h2 className="text-lg font-semibold mb-2">{group.sectionTitle}</h2>
            <div className="grid grid-cols-2 gap-4">
              {group.fields.map(field => (
                <div key={field.name} className={cn(
                  field.width === "full" ? "col-span-2" : "col-span-1"
                )}>
                  <DynamicFormField
                    field={field}
                    control={form.control}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <Separator className="my-6" />
        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
} 