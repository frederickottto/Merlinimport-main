import { FormFieldSchema } from "@/types/form";

export const getFormFields = (): FormFieldSchema[] => [
  {
    name: "employeePositionShort",
    label: "Positionsbezeichnung (Kurz)",
    type: "text",
    required: true,
    position: 1,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "employeePositionLong",
    label: "Positionsbezeichnung (Lang)",
    type: "text",
    required: true,
    position: 2,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
  {
    name: "employeeCostStraight",
    label: "Kostensatz in Euro",
    type: "number",
    required: false,
    position: 3,
    section: {
      id: "overview",
      title: "Übersicht",
    },
  },
];

export const defaultValues = {
  employeePositionShort: " ",
  employeePositionLong: " ",
  employeeCostStraight: undefined,
}; 