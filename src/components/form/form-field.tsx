"use client";

import { FormFieldSchema } from "@/types/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Control, FieldValues } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/trpc/react";

// Remove unused types
// type RouterInputs = inferRouterInputs<AppRouter>;
// type RouterOutputs = inferRouterOutputs<AppRouter>;

interface BaseFieldOption {
  label: string;
  value: string | number;
}

interface CommandOption {
  label: string;
  value: string;
}

type FieldOptionsType = {
  endpoint?: string;
  labelField?: string;
  valueField?: string;
  items?: BaseFieldOption[];
  formatLabel?: (item: Record<string, unknown>) => string;
  multiple?: boolean;
  filter?: Record<string, unknown>;
};

interface ExtendedFormFieldSchema extends Omit<FormFieldSchema, 'options'> {
  options?: BaseFieldOption[] | FieldOptionsType;
}

interface FormFieldProps {
  value: unknown;
  onChange: (value: unknown) => void;
}

interface CommandFieldProps {
  field: ExtendedFormFieldSchema;
  fieldProps: {
    value: string | string[];
    onChange: (value: string | string[]) => void;
  };
  control: Control<FieldValues>;
}

// Move getNestedValue to be a utility function at the top level
const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part];
    }
    return undefined;
  }, obj);
};

function CommandField({ field, fieldProps, control }: CommandFieldProps) {
  // 1. All useState hooks first - always call these in the same order
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItems, setSelectedItems] = useState<CommandOption[]>([]);
  const [selectedItem, setSelectedItem] = useState<CommandOption | null>(null);

  // 2. All derived state and props
  const fieldOptions = !Array.isArray(field.options) ? field.options : undefined;
  const isMulti = fieldOptions?.multiple;
  const endpoint = fieldOptions?.endpoint;
  
  // Resolve any template variables in the filter
  const resolveFilter = (filter: Record<string, unknown>) => {
    if (!filter) return {};
    
    const resolvedFilter: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(filter)) {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        // Extract the path from the template
        const path = value.slice(2, -2);
        // Get the value from the form context
        const formContext = control?._defaultValues || {};
        const resolvedValue = getNestedValue(formContext, path);
        // If the resolved value is undefined or null, skip this filter
        if (resolvedValue === undefined || resolvedValue === null) {
          continue;
        }
        resolvedFilter[key] = resolvedValue;
      } else {
        resolvedFilter[key] = value;
      }
    }
    return resolvedFilter;
  };

  const filter = resolveFilter(fieldOptions?.filter || {});

  // 3. All hooks that depend on props/state - always call these in the same order
  const [namespace, method] = endpoint ? endpoint.split(".") : [undefined, undefined];
  // @ts-expect-error - Dynamic access to tRPC router
  const trpcQueryHook = namespace && method ? api[namespace]?.[method]?.useQuery : undefined;
  
  // Always call the hooks, but with different parameters based on conditions
  const searchQuery = trpcQueryHook ? trpcQueryHook({ ...filter, q: search }) : { data: [] };
  const singleItemQuery = trpcQueryHook ? trpcQueryHook({ ...filter, id: fieldProps.value }) : { data: [] };
  
  // Extract data with defaults
  const endpointData = searchQuery.data || [];
  const singleItemData = useMemo(() => 
    (!search && fieldProps.value) ? (singleItemQuery.data || []) : [],
    [search, fieldProps.value, singleItemQuery.data]
  );

  // 4. Compute options
  const commandOptions = Array.isArray(field.options)
    ? field.options.map(opt => ({ ...opt, value: String(opt.value) }))
    : (fieldOptions?.items || []).map(opt => ({ ...opt, value: String(opt.value) }));

  const options: CommandOption[] = endpointData.length > 0
    ? endpointData.map((item: Record<string, unknown>) => {
        const label = fieldOptions?.formatLabel
          ? fieldOptions.formatLabel(item)
          : String(item[fieldOptions?.labelField || "name"] || "");
        return {
          label,
          value: String(item[fieldOptions?.valueField || "id"] || ""),
        };
      })
    : commandOptions;

  // 5. Single consolidated useEffect for all state updates
  useEffect(() => {
    // Handle multi-select case
    if (isMulti) {
      if (Array.isArray(fieldProps.value)) {
        const newItems = fieldProps.value
          .map((val: string) => {
            const found = options.find((o) => o.value === val);
            return found ? found : { label: val, value: val };
          })
          .filter(Boolean);
        
        // Only update if the items have actually changed
        const isDifferent = newItems.length !== selectedItems.length ||
          newItems.some((item, i) => item.value !== selectedItems[i]?.value);
        
        if (isDifferent) {
          setSelectedItems(newItems);
        }
      } else if (selectedItems.length > 0) {
        setSelectedItems([]);
      }
      return;
    }

    // Handle single-select case
    if (fieldProps.value) {
      // First try to find the item in the current options
      const found = options.find((o) => o.value === fieldProps.value);
      if (found) {
        if (selectedItem?.value !== found.value) {
          setSelectedItem(found);
          setSearch(found.label);
        }
        return;
      }

      // If not found in options and we have singleItemData, use that
      if (singleItemData.length > 0) {
        const item = singleItemData[0] as Record<string, unknown>;
        const label = fieldOptions?.formatLabel
          ? fieldOptions.formatLabel(item)
          : String(item[fieldOptions?.labelField || "name"] || "");
        const newItem = {
          label,
          value: String(fieldProps.value),
        };
        if (selectedItem?.value !== newItem.value) {
          setSelectedItem(newItem);
          setSearch(label);
        }
        return;
      }

      // If we still don't have a label, use the value as the label
      if (!selectedItem || selectedItem.value !== fieldProps.value) {
        const newItem = {
          label: String(fieldProps.value),
          value: String(fieldProps.value),
        };
        setSelectedItem(newItem);
        setSearch(newItem.label);
      }
    } else if (selectedItem || search) {
      // Clear selection if value is empty
      setSelectedItem(null);
      setSearch("");
    }
  }, [
    isMulti,
    fieldProps.value,
    options,
    selectedItems,
    selectedItem,
    singleItemData,
    fieldOptions,
    search
  ]);

  if (isMulti) {
    return (
      <div className="relative">
        <Command className="rounded-lg border shadow-md">
          <CommandInput
            placeholder={field.placeholder}
            value={search}
            onValueChange={setSearch}
            onFocus={() => setOpen(true)}
          />
          {open && (
            <CommandList>
              <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value.toString()}
                    value={option.label}
                    onSelect={() => {
                      if (!selectedItems.some((item) => item.value === option.value)) {
                        const newSelected = [...selectedItems, option];
                        setSelectedItems(newSelected);
                        fieldProps.onChange(newSelected.map((item) => item.value));
                      }
                      setSearch("");
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          )}
        </Command>
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge key={item.value} variant="secondary">
              {item.label}
              <button
                type="button"
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={() => {
                  const newSelected = selectedItems.filter((i) => i.value !== item.value);
                  setSelectedItems(newSelected);
                  fieldProps.onChange(newSelected.map((i) => i.value));
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  // Single-select (default)
  return (
    <div className="relative">
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder={field.placeholder}
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            if (!value) {
              fieldProps.onChange("");
              setSelectedItem(null);
            }
          }}
          onFocus={() => setOpen(true)}
        />
        {open && (
          <CommandList>
            <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value.toString()}
                  value={option.label}
                  onSelect={() => {
                    fieldProps.onChange(option.value);
                    setSelectedItem(option);
                    setSearch(option.label);
                    setOpen(false);
                  }}
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        )}
      </Command>
    </div>
  );
}

interface DynamicFormFieldProps {
  field: ExtendedFormFieldSchema;
  control: Control<FieldValues>;
}

export function DynamicFormField({ field, control }: DynamicFormFieldProps) {
  const resolveTemplates = (obj: Record<string, unknown>, context: Record<string, unknown>): Record<string, unknown> => {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('${') && value.endsWith('}')) {
        const path = value.slice(2, -1);
        result[key] = getNestedValue(context, path);
      } else if (value && typeof value === 'object') {
        result[key] = resolveTemplates(value as Record<string, unknown>, context);
      } else {
        result[key] = value;
      }
    }
    return result;
  };

  const renderFormControl = (fieldProps: FormFieldProps) => {
    const value = field.name.includes('.') 
      ? getNestedValue(fieldProps.value as Record<string, unknown>, field.name.split('.').slice(1).join('.'))
      : fieldProps.value;

    switch (field.type) {
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder}
            className="resize-none"
            {...fieldProps}
            value={String(value || "")}
          />
        );
      case "select":
        const selectOptions = Array.isArray(field.options) 
          ? field.options 
          : field.options?.items || [];
        
        return (
          <Select
            onValueChange={fieldProps.onChange}
            defaultValue={String(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {selectOptions.map((option) => (
                <SelectItem key={option.value.toString()} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "command": {
        // Resolve filter templates using form context (defaultValues)
        let resolvedField = field;
        if (field.options && !Array.isArray(field.options) && field.options.filter) {
          // Try to get defaultValues from control (react-hook-form)
          const formContext = control?._defaultValues || {};
          const resolvedOptions = {
            ...field.options,
            filter: resolveTemplates(field.options.filter, formContext),
          };
          resolvedField = { ...field, options: resolvedOptions };
        }
        return <CommandField field={resolvedField} fieldProps={fieldProps as { value: string | string[]; onChange: (value: string | string[]) => void }} control={control} />;
      }
      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={Boolean(value)}
              onCheckedChange={fieldProps.onChange}
            />
            <span className="text-sm text-muted-foreground">
              {field.description || "Ja"}
            </span>
          </div>
        );
      case "radio":
        if (!Array.isArray(field.options)) return null;
        const radioOptions = field.options.map(opt => ({ ...opt, value: String(opt.value) }));
        return (
          <RadioGroup
            onValueChange={fieldProps.onChange}
            defaultValue={String(value)}
            className="flex flex-col space-y-1"
          >
            {radioOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} />
                <span>{option.label}</span>
              </div>
            ))}
          </RadioGroup>
        );
      case "date":
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            {...fieldProps}
            value={String(value || "")}
            onChange={(e) => {
              fieldProps.onChange(e.target.value);
            }}
          />
        );
      case "number":
      case "currency":
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            className={cn(
              field.type === "currency" && "font-mono",
              "text-right"
            )}
            {...fieldProps}
            value={String(value || "")}
            onChange={(e) => {
              const newValue = e.target.value === "" ? "" : Number(e.target.value);
              fieldProps.onChange(newValue);
            }}
          />
        );
      case "tags":
        const tags = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: { name?: string; id?: string } | string, index: number) => (
                <Badge key={index} variant="secondary">
                  {typeof tag === 'object' ? tag.name || tag.id : tag}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => {
                      const newTags = [...tags];
                      newTags.splice(index, 1);
                      fieldProps.onChange(newTags);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder={field.placeholder}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value) {
                  e.preventDefault();
                  const newTags = [...tags, e.currentTarget.value];
                  fieldProps.onChange(newTags);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        );
      case "static": {
        // For static fields with options, try to get the label from options
        let displayValue = String(value || "");
        if (field.options && !Array.isArray(field.options)) {
          const fieldOptions = field.options;
          if (fieldOptions.endpoint && fieldOptions.labelField && value) {
            // Only make the query if we have a valid endpoint and value
            const [namespace, method] = fieldOptions.endpoint.split(".");
            if (namespace && method && value) {
              // @ts-expect-error - Dynamic access to tRPC router
              const trpcQueryHook = api[namespace]?.[method]?.useQuery;
              if (trpcQueryHook) {
                const { data } = trpcQueryHook({ id: value });
                if (data && data.length > 0) {
                  const item = data[0] as Record<string, unknown>;
                  displayValue = fieldOptions.formatLabel
                    ? fieldOptions.formatLabel(item)
                    : String(item[fieldOptions.labelField] || "");
                }
              }
            }
          }
        }
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            {...fieldProps}
            value={displayValue}
            disabled={true}
            className="bg-muted cursor-not-allowed"
          />
        );
      }
      default:
        return (
          <Input
            type="text"
            placeholder={field.placeholder}
            {...fieldProps}
            value={String(value || "")}
          />
        );
    }
  };

  const widthClasses = {
    full: "col-span-6",
    half: "col-span-3",
    third: "col-span-2",
  };

  return (
    <FormField
      control={control}
      name={field.name}
      render={({ field: fieldProps }) => (
        <FormItem className={cn(widthClasses[field.width || "full"])}>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>{renderFormControl(fieldProps as FormFieldProps)}</FormControl>
          {field.description && field.type !== "checkbox" && (
            <FormDescription>{field.description}</FormDescription>
          )}
          <FormMessage className="text-destructive" />
        </FormItem>
      )}
    />
  );
} 