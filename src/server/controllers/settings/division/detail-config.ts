import { DetailSchema } from "@/types/detail";

type Employee = {
  id: string;
  foreName: string;
  lastName: string;
  description?: string | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  pseudonym?: string | null;
  employeerCompany: string;
  divisionId?: string | null;
};

type Division = {
  id: string;
  title: string;
  abbreviation?: string | null;
  managedBy?: Employee | null;
  parentDivision?: Division | null;
  subDivisions?: Division[];
  employees?: Employee[];
};

export const detailSchema: DetailSchema = {
  sections: [
    {
      id: "overview",
      title: "Übersicht",
      position: 1,
    },
    {
      id: "related",
      title: "Beziehungen",
      position: 2,
    },
  ],
  fields: [
    {
      name: "title",
      label: "Titel",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "abbreviation",
      label: "Abkürzung",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
    },
    {
      name: "managedBy",
      label: "Leiter",
      type: "text",
      position: 3,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      transform: (value: unknown) => {
        const employee = value as Employee | null;
        return employee ? `${employee.foreName} ${employee.lastName}` : "-";
      },
    },
    {
      name: "parentDivision",
      label: "Übergeordnete Abteilung",
      type: "text",
      position: 4,
      width: "full",
      section: {
        id: "overview",
        title: "Übersicht",
        position: 1
      },
      transform: (value: unknown) => {
        const division = value as Division | null;
        return division ? division.title : "-";
      },
    },
    {
      name: "subDivisions",
      label: "Untergeordnete Abteilungen",
      type: "text",
      position: 1,
      width: "full",
      section: {
        id: "related",
        title: "Beziehungen",
        position: 2
      },
      transform: (value: unknown) => {
        const divisions = value as Division[] | null;
        if (!divisions || !Array.isArray(divisions)) return "-";
        return divisions.map(division => division.title).join(", ") || "-";
      },
    },
    {
      name: "employees",
      label: "Mitarbeiter",
      type: "text",
      position: 2,
      width: "full",
      section: {
        id: "related",
        title: "Beziehungen",
        position: 2
      },
      transform: (value: unknown) => {
        const employees = value as Employee[] | null;
        if (!employees || !Array.isArray(employees)) return "-";
        return employees.map(employee => `${employee.foreName} ${employee.lastName}`).join(", ") || "-";
      },
    },
  ],
}; 