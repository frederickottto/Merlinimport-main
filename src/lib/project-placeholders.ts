export type ProjectPlaceholderCategory = 'basic' | 'details' | 'volume' | 'dates' | 'standards' | 'contacts' | 'organizations' | 'activities' | 'tenders';

export interface ProjectPlaceholderField {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

export interface ProjectPlaceholder {
  id: string;
  title: string;
  description: string;
  category: ProjectPlaceholderCategory;
  selected: boolean;
  fields?: ProjectPlaceholderField[];
}

export const PROJECT_PLACEHOLDERS: ProjectPlaceholder[] = [
  // Basic Info
  { 
    id: 'project_title', 
    title: 'Titel', 
    description: 'Projekttitel', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'project_type', 
    title: 'Typ', 
    description: 'Projekttyp', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'project_description', 
    title: 'Beschreibung', 
    description: 'Projektbeschreibung', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'project_keywords', 
    title: 'Schlagworte', 
    description: 'Projektrelevante Schlagworte', 
    category: 'basic', 
    selected: false 
  },

  // Details
  { 
    id: 'project_team_size', 
    title: 'Teamgröße', 
    description: 'Größe des Projektteams', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_scope_audit_hours', 
    title: 'Scope Audit Stunden', 
    description: 'Stunden für Scope Audit', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_it', 
    title: 'Projekt IT', 
    description: 'IT-Projekt', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_is', 
    title: 'Projekt IS', 
    description: 'IS-Projekt', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_gs', 
    title: 'Projekt GS', 
    description: 'GS-Projekt', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_evb_it_contract_number', 
    title: 'EVB-IT Vertragsnummer', 
    description: 'Vertragsnummer nach EVB-IT', 
    category: 'details', 
    selected: false 
  },
  { 
    id: 'project_evb_it_contract_location', 
    title: 'EVB-IT Vertragsstandort', 
    description: 'Vertragsstandort nach EVB-IT', 
    category: 'details', 
    selected: false 
  },

  // Volume
  { 
    id: 'project_total_volume_euro', 
    title: 'Gesamtvolumen in Euro', 
    description: 'Gesamtvolumen in Euro', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_retrieved_volume_euro', 
    title: 'Abgerufenes Volumen in Euro', 
    description: 'Abgerufenes Volumen in Euro', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_total_volume_person_days', 
    title: 'Gesamtvolumen in Personentagen', 
    description: 'Gesamtvolumen in Personentagen', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_retrieved_volume_person_days', 
    title: 'Abgerufenes Volumen in Personentagen', 
    description: 'Abgerufenes Volumen in Personentagen', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_total_volume_hours', 
    title: 'Gesamtvolumen in Stunden', 
    description: 'Gesamtvolumen in Stunden', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_retrieved_volume_hours', 
    title: 'Abgerufenes Volumen in Stunden', 
    description: 'Abgerufenes Volumen in Stunden', 
    category: 'volume', 
    selected: false 
  },
  { 
    id: 'project_approved_margin', 
    title: 'Genehmigter Aufschlag', 
    description: 'Genehmigter Aufschlag', 
    category: 'volume', 
    selected: false 
  },

  // Dates
  { 
    id: 'project_contract_start', 
    title: 'Vertragsbeginn', 
    description: 'Beginn des Vertrags', 
    category: 'dates', 
    selected: false 
  },
  { 
    id: 'project_contract_end', 
    title: 'Vertragsende', 
    description: 'Ende des Vertrags', 
    category: 'dates', 
    selected: false 
  },
  { 
    id: 'project_first_contact_date', 
    title: 'Erster Kontakt', 
    description: 'Datum des ersten Kontakts', 
    category: 'dates', 
    selected: false 
  },
  { 
    id: 'project_service_date', 
    title: 'Leistungsdatum', 
    description: 'Datum der Leistung', 
    category: 'dates', 
    selected: false 
  },

  // Standards
  { 
    id: 'project_relevant_standards', 
    title: 'Relevante Standards', 
    description: 'Relevante Standards', 
    category: 'standards', 
    selected: false 
  },
  { 
    id: 'project_reference_approval', 
    title: 'Referenzgenehmigung', 
    description: 'Referenzgenehmigung', 
    category: 'standards', 
    selected: false 
  },

  // Contacts
  { 
    id: 'project_organization_contacts', 
    title: 'Organisationskontakte', 
    description: 'Kontakte in der Organisation', 
    category: 'contacts', 
    selected: false 
  },

  // Organizations
  { 
    id: 'project_involved_organizations', 
    title: 'Beteiligte Organisationen', 
    description: 'Beteiligte Organisationen', 
    category: 'organizations', 
    selected: false 
  },

  // Activities
  { 
    id: 'project_employee_activities', 
    title: 'Mitarbeiteraktivitäten', 
    description: 'Aktivitäten der Mitarbeiter', 
    category: 'activities', 
    selected: false,
    fields: [
      { id: 'project_employee_activity_description', title: 'Beschreibung', description: 'Beschreibung der Aktivität', selected: false },
      { id: 'project_employee_activity_operational_period_start', title: 'Operativer Zeitraum Start', description: 'Beginn des operativen Zeitraums', selected: false },
      { id: 'project_employee_activity_operational_period_end', title: 'Operativer Zeitraum Ende', description: 'Ende des operativen Zeitraums', selected: false },
      { id: 'project_employee_activity_operational_days', title: 'Operative Tage', description: 'Anzahl der operativen Tage', selected: false },
      { id: 'project_employee_activity_roles', title: 'Mitarbeiterprojektrollen', description: 'Rollen der Mitarbeiter im Projekt', selected: false },
    ]
  },
  { 
    id: 'project_organization_activities', 
    title: 'Organisationsaktivitäten', 
    description: 'Aktivitäten der Organisationen', 
    category: 'activities', 
    selected: false,
    fields: [
      { id: 'project_organization_activity_role', title: 'Organisationsrolle', description: 'Rolle der Organisation', selected: false },
      { id: 'project_organization_activity_description', title: 'Beschreibung', description: 'Beschreibung der Aktivität', selected: false },
    ]
  },
  { 
    id: 'project_organization_roles', 
    title: 'Organisationsrollen', 
    description: 'Rollen der Organisationen', 
    category: 'activities', 
    selected: false,
    fields: [
      { id: 'project_organization_role', title: 'Organisationsrolle', description: 'Rolle der Organisation', selected: false },
    ]
  },

  // Tenders
  { 
    id: 'project_reference_tenders', 
    title: 'Referenzausschreibungen', 
    description: 'Referenzausschreibungen', 
    category: 'tenders', 
    selected: false,
    fields: [
      { id: 'project_tender_role', title: 'Rolle in der Ausschreibung', description: 'Rolle in der Ausschreibung', selected: false },
      { id: 'project_tender_description', title: 'Beschreibung', description: 'Beschreibung der Ausschreibung', selected: false },
      { id: 'project_tender_relevance', title: 'Relevanz', description: 'Relevanz der Ausschreibung', selected: false },
      { id: 'project_tender_auto_selected', title: 'Automatisch ausgewählt', description: 'Automatisch ausgewählt', selected: false },
    ]
  },
]; 