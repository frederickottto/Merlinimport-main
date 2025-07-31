import { FormFieldSchema } from "@/types/form";

export const divisionFormConfig: FormFieldSchema[] = [
  {
    name: "title",
    label: "Titel",
    type: "text",
    required: true,
    position: 1,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "abbreviation",
    label: "Abkürzung",
    type: "text",
    required: false,
    position: 2,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "managedById",
    label: "Leiter",
    type: "command",
    required: false,
    position: 3,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
    command: {
      type: "organisation",
      label: "Leiter",
      placeholder: "Mitarbeiter suchen...",
      createLabel: "Neuer Mitarbeiter",
      createPath: "/profiles/new",
      multiple: false
    },
    options: {
      endpoint: "profiles.all",
      labelField: "foreName",
      valueField: "id",
      formatLabel: (item: unknown) => {
        const employee = item as { foreName: string; lastName: string };
        return `${employee.foreName} ${employee.lastName}`;
      },
    },
  },
  {
    name: "parentDivisionId",
    label: "Übergeordnete Abteilung",
    type: "command",
    required: false,
    position: 4,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
    command: {
      type: "organisation",
      label: "Übergeordnete Abteilung",
      placeholder: "Abteilung suchen...",
      createLabel: "Neue Abteilung",
      createPath: "/settings/divisions/new",
      multiple: false
    },
    options: {
      endpoint: "division.getAll",
      labelField: "title",
      valueField: "id",
    },
  },
  {
    name: "employeeIDs",
    label: "Mitarbeiter",
    type: "command",
    required: false,
    position: 5,
    width: "full",
    section: {
      id: "overview",
      title: "Übersicht",
    },
    command: {
      type: "organisation",
      label: "Mitarbeiter",
      placeholder: "Mitarbeiter suchen...",
      createLabel: "Neuer Mitarbeiter",
      createPath: "/profiles/new",
      multiple: true
    },
    options: {
      endpoint: "profiles.all",
      labelField: "foreName",
      valueField: "id",
      multiple: true,
      formatLabel: (item: unknown) => {
        const employee = item as { foreName: string; lastName: string };
        return `${employee.foreName} ${employee.lastName}`;
      },
    },
  },
]; 