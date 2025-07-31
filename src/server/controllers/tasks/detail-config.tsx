import React from "react";
import { type DetailSchema } from "@/types/detail";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export const taskDetailConfig: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
  ],
  fields: [
    {
      name: "title",
      label: "Titel",
      type: "text",
      position: 1,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "description",
      label: "Beschreibung",
      type: "textarea",
      position: 2,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
    },
    {
      name: "status",
      label: "Status",
      type: "text",
      position: 3,
      width: "half",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        const status = value as string;
        const variants = {
          TODO: "destructive",
          IN_PROGRESS: "secondary",
          DONE: "default",
        } as const;
        return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
      },
    },
    {
      name: "assignedTo",
      label: "Zugewiesen an",
      type: "text",
      position: 4,
      width: "half",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        if (!value) return "Nicht zugewiesen";
        const assignedTo = value as { foreName: string; lastName: string };
        return `${assignedTo.foreName} ${assignedTo.lastName}`;
      },
    },
    {
      name: "dueDate",
      label: "Fälligkeitsdatum",
      type: "date",
      position: 5,
      width: "half",
      section: { id: "overview", title: "Übersicht", position: 1 },
      format: {
        locale: "de-DE"
      },
      transform: (value: unknown) => {
        const date = value as Date | null;
        return date ? format(date, "dd.MM.yyyy", { locale: de }) : "-";
      },
    },
    {
      name: "tender",
      label: "Ausschreibung",
      type: "link",
      position: 6,
      width: "full",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        const tender = value as { id: string; title: string };
        return (
          <Link href={`/tenders/${tender.id}`} className="text-primary hover:underline">
            {tender.title}
          </Link>
        );
      },
    },
    {
      name: "createdBy",
      label: "Erstellt von",
      type: "text",
      position: 7,
      width: "half",
      section: { id: "overview", title: "Übersicht", position: 1 },
      transform: (value: unknown) => {
        const createdBy = value as { foreName: string; lastName: string };
        return `${createdBy.foreName} ${createdBy.lastName}`;
      },
    },
  ],
}; 