import { type ReactNode } from "react";

export type DetailFieldType = 
  | "text"
  | "textarea"
  | "date"
  | "currency"
  | "number"
  | "boolean"
  | "tags"
  | "link"
  | "relation";

export interface DetailSection {
  id: string;
  title: string;
  position: number;
  subsection?: string;
  subsectionTitle?: string;
}

export interface DetailFieldSchema {
  name: string;
  label: string;
  type: "text" | "textarea" | "date" | "currency" | "boolean" | "tags" | "link" | "number";
  position: number;
  width?: "full" | "half" | "third";
  section: DetailSection;
  transform?: (value: unknown) => string | ReactNode;
  format?: {
    locale?: string;
    currencyCode?: string;
  };
}

export interface DetailSchema {
  sections: DetailSection[];
  fields: DetailFieldSchema[];
}

export interface DetailViewProps {
  schema: DetailSchema;
  data: Record<string, unknown>;
  onEdit?: () => void;
  className?: string;
} 