import { FormFieldSchema, FieldType } from "@/types/form";
import { z } from "zod";

// Define sections for the profile form
export const sections = [
  { id: "overview", title: "Übersicht", position: 1 },
  { id: "contact", title: "Kontaktinformationen", position: 2 },
  { id: "experience", title: "Erfahrung", position: 3 },
  { id: "description", title: "Beschreibung", position: 4 },
];

// Define all fields, each referencing its section by id and having a position
export const fields: FormFieldSchema[] = [
  // Overview
  { name: "foreName", label: "Vorname", required: true, type: "text" as FieldType, position: 1, placeholder: "Vorname eingeben", section: { id: "overview", title: "Übersicht" } },
  { name: "lastName", label: "Nachname", required: true, type: "text" as FieldType, position: 2, placeholder: "Nachname eingeben", section: { id: "overview", title: "Übersicht" } },
  { name: "pseudonym", label: "Pseudonym", required: true, type: "text" as FieldType, position: 3, placeholder: "Pseudonym eingeben", section: { id: "overview", title: "Übersicht" } },
  { name: "employeerCompany", label: "Arbeitgeber", type: "text" as FieldType, position: 4, placeholder: "Arbeitgeber eingeben", section: { id: "overview", title: "Übersicht" } },
  { name: "counselorIDs", label: "Counselor", type: "command" as FieldType, position: 5, placeholder: "Counselor auswählen", options: { endpoint: "profiles.all", labelField: "foreName", valueField: "id", multiple: false, formatLabel: (item: unknown) => { const employee = item as { foreName: string; lastName: string }; return `${employee.foreName} ${employee.lastName}`; } }, section: { id: "overview", title: "Übersicht" } },
  { name: "salutationIDs", label: "Anreden", type: "command" as FieldType, position: 0, placeholder: "Anreden auswählen", options: { endpoint: "salutation.getAll", labelField: "salutationShort", valueField: "id", multiple: true }, section: { id: "overview", title: "Übersicht" } },
  { name: "divisionId", label: "Abteilung", type: "command" as FieldType, position: 6, placeholder: "Abteilung auswählen", options: { endpoint: "division.getAll", labelField: "title", valueField: "id", multiple: false, formatLabel: (item: unknown) => { const division = item as { title: string; abbreviation?: string }; return division.abbreviation ? `${division.title} (${division.abbreviation})` : division.title; } }, section: { id: "overview", title: "Übersicht" } },
  { name: "employeeRankIDs", label: "Mitarbeiter-Rang", type: "command" as FieldType, position: 7, placeholder: "Mitarbeiter-Rang auswählen", options: { endpoint: "employeeRank.getAll", labelField: "employeePositionShort", valueField: "id", multiple: false }, section: { id: "overview", title: "Übersicht" } },
  { name: "locationIDs", label: "Standort", type: "command" as FieldType, position: 8, placeholder: "Standort auswählen", options: { endpoint: "location.getAll", labelField: "name", valueField: "id", multiple: false }, section: { id: "overview", title: "Übersicht" } },
  { name: "contractStartDate", label: "Vertragsbeginn", type: "date" as FieldType, position: 9, placeholder: "Vertragsbeginn auswählen", section: { id: "overview", title: "Übersicht" } },
  // Contact
  { name: "mobile", label: "Mobil", required: true, type: "text" as FieldType, position: 1, placeholder: "Mobilnummer eingeben", section: { id: "contact", title: "Kontaktinformationen" } },
  { name: "telephone", label: "Telefon", required: true, type: "text" as FieldType, position: 2, placeholder: "Telefonnummer eingeben", section: { id: "contact", title: "Kontaktinformationen" } },
  { name: "linkedInURL", label: "LinkedIn", type: "text" as FieldType, position: 3, placeholder: "LinkedIn URL eingeben", validation: z.string().url().optional(), section: { id: "contact", title: "Kontaktinformationen" } },
  { name: "xingURL", label: "Xing", type: "text" as FieldType, position: 4, placeholder: "Xing URL eingeben", validation: z.string().url().optional(), section: { id: "contact", title: "Kontaktinformationen" } },
  { name: "discoverURL", label: "Discover", type: "text" as FieldType, position: 5, placeholder: "Discover URL eingeben", validation: z.string().url().optional(), section: { id: "contact", title: "Kontaktinformationen" } },
  // Experience
  { name: "experienceIt", label: "IT-Erfahrung", type: "number" as FieldType, position: 1, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  { name: "experienceIs", label: "IS-Erfahrung", type: "number" as FieldType, position: 2, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  { name: "experienceItGs", label: "IT-GS-Erfahrung", type: "number" as FieldType, position: 3, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  { name: "experienceGps", label: "GPS-Erfahrung", type: "number" as FieldType, position: 4, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  { name: "experienceOther", label: "Sonstige Erfahrung", type: "number" as FieldType, position: 5, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  { name: "experienceAll", label: "Gesamterfahrung", type: "number" as FieldType, position: 6, placeholder: "0", defaultValue: 0, validation: z.number().min(0), section: { id: "experience", title: "Erfahrung" } },
  // Description
  { name: "description", label: "Beschreibung", type: "textarea" as FieldType, position: 1, placeholder: "Beschreibung eingeben", section: { id: "description", title: "Beschreibung" } },
];

// Return all fields, ordered by section position and then field position
export function getFormFields(): FormFieldSchema[] {
  return sections
    .sort((a, b) => a.position - b.position)
    .flatMap(section =>
      fields
        .filter(f => f.section.id === section.id)
        .sort((a, b) => a.position - b.position)
    );
}

// Default values for profile form
export const defaultValues = {
  foreName: "",
  lastName: "",
  pseudonym: "",
  employeerCompany: "Ernst & Young GmbH WPG",
  mobile: "",
  telephone: "",
  linkedInURL: "https://www.linkedin.de",
  xingURL: "https://www.xing.de",
  discoverURL: "https://www.discover.de",
  experienceIt: 0,
  experienceIs: 0,
  experienceItGs: 0,
  experienceGps: 0,
  experienceOther: 0,
  experienceAll: 0,
  description: "",
  employeeRankIDs: "",
  securityClearance: "",
  employeeTraining: [],
  salutationIDs: "",
  counselorIDs: "",
  locationIDs: "",
  divisionId: "",
  contractStartDate: undefined,
};

// Define the type for the form data (what the form component uses)
export type FormProfileData = {
    foreName: string;
    lastName: string;
    pseudonym?: string;
    employeerCompany?: string;
    mobile?: string;
    telephone?: string;
    linkedInURL?: string;
    xingURL?: string;
    discoverURL?: string;
    experienceIt: number;
    experienceIs: number;
    experienceItGs: number;
    experienceGps: number;
    experienceOther: number;
    experienceAll: number;
    description?: string;
    employeeRankIDs?: string;
    securityClearance?: string;
    employeeTraining?: string[];
    salutationIDs?: string[];
    counselorIDs?: string;
    locationIDs?: string;
    divisionId?: string;
    contractStartDate?: Date;
};

// Define the type for the API data (what gets sent to the server)
export type UpdateProfileData = {
    foreName: string;
    lastName: string;
    pseudonym?: string;
    employeerCompany?: string;
    mobile?: string;
    telephone?: string;
    linkedInURL?: string;
    xingURL?: string;
    discoverURL?: string;
    experienceIt: number;
    experienceIs: number;
    experienceItGs: number;
    experienceGps: number;
    experienceOther: number;
    experienceAll: number;
    description?: string;
    employeeRankIDs?: string;
    securityClearance?: string;
    employeeTraining?: string[];
    salutationIDs?: string[];
    counselorIDs?: string;
    locationIDs?: string;
    divisionId?: string;
    contractStartDate?: Date;
};

// Update schema for profile form (matches FormProfileData)
export const updateSchema = z.object({
  foreName: z.string(),
  lastName: z.string(),
  pseudonym: z.string(),
  employeerCompany: z.string().optional(),
  mobile: z.string(),
  telephone: z.string(),
  linkedInURL: z.string().url().optional(),
  xingURL: z.string().url().optional(),
  discoverURL: z.string().url().optional(),
  experienceIt: z.number().min(0).optional(),
  experienceIs: z.number().min(0).optional(),
  experienceItGs: z.number().min(0).optional(),
  experienceGps: z.number().min(0).optional(),
  experienceOther: z.number().min(0).optional(),
  experienceAll: z.number().min(0).optional(),
  description: z.string().optional(),
  employeeRankIDs: z.string().optional(),
  securityClearance: z.string().optional(),
  employeeTraining: z.array(z.string()).optional(),
  salutationIDs: z.string().optional(),
  counselorIDs: z.string().optional(),
  locationIDs: z.string().optional(),
  divisionId: z.string().optional(),
  contractStartDate: z.coerce.date().optional(),
});
