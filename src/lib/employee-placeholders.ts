export type EmployeePlaceholderCategory = 'basic' | 'experience' | 'education' | 'certificates' | 'skills' | 'projects' | 'training' | 'tasks' | 'division' | 'callToTender';

export interface EmployeePlaceholderField {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

export interface EmployeePlaceholder {
  id: string;
  title: string;
  description: string;
  category: EmployeePlaceholderCategory;
  selected: boolean;
  fields?: EmployeePlaceholderField[];
}

export const EMPLOYEE_PLACEHOLDERS: EmployeePlaceholder[] = [
  // Basic Info
  { 
    id: 'employee_name', 
    title: 'Name', 
    description: 'Vollständiger Name des Mitarbeiters', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'employee_role', 
    title: 'Rolle', 
    description: 'Position im Unternehmen', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'employee_description', 
    title: 'Beschreibung', 
    description: 'Kurzbeschreibung des Mitarbeiters', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'employee_contact', 
    title: 'Kontakt', 
    description: 'Telefon und E-Mail', 
    category: 'basic', 
    selected: false 
  },
  
  // Experience
  { 
    id: 'employee_experience_it', 
    title: 'IT-Erfahrung', 
    description: 'Jahre der IT-Erfahrung', 
    category: 'experience', 
    selected: false 
  },
  { 
    id: 'employee_experience_is', 
    title: 'IS-Erfahrung', 
    description: 'Jahre der IS-Erfahrung', 
    category: 'experience', 
    selected: false 
  },
  { 
    id: 'employee_experience_itgs', 
    title: 'ITGS-Erfahrung', 
    description: 'Jahre der ITGS-Erfahrung', 
    category: 'experience', 
    selected: false 
  },
  { 
    id: 'employee_experience_gps', 
    title: 'GPS-Erfahrung', 
    description: 'Jahre der GPS-Erfahrung', 
    category: 'experience', 
    selected: false 
  },
  
  // Education
  { 
    id: 'employee_academic_degree', 
    title: 'Akademischer Grad', 
    description: 'Akademische Ausbildung', 
    category: 'education', 
    selected: false,
    fields: [
      { id: 'employee_degree_title_short', title: 'Kurzbezeichnung', description: 'Kurze Bezeichnung des Abschlusses', selected: false },
      { id: 'employee_degree_title_long', title: 'Vollständige Bezeichnung', description: 'Vollständige Bezeichnung des Abschlusses', selected: false },
      { id: 'employee_study', title: 'Studienfach', description: 'Bezeichnung des Studienfachs', selected: false },
      { id: 'employee_university', title: 'Universität', description: 'Name der Universität', selected: false },
      { id: 'employee_study_start', title: 'Studienbeginn', description: 'Beginn des Studiums', selected: false },
      { id: 'employee_study_end', title: 'Studienende', description: 'Ende des Studiums', selected: false },
      { id: 'employee_study_completed', title: 'Abgeschlossen', description: 'Studium abgeschlossen', selected: false },
      { id: 'employee_study_mint', title: 'MINT-Studium', description: 'MINT-Studiengang', selected: false },
    ]
  },
  { 
    id: 'employee_voccational', 
    title: 'Berufsausbildung', 
    description: 'Berufliche Ausbildung', 
    category: 'education', 
    selected: false,
    fields: [
      { id: 'employee_voccational_title_short', title: 'Kurzbezeichnung', description: 'Kurze Bezeichnung der Ausbildung', selected: false },
      { id: 'employee_voccational_title_long', title: 'Vollständige Bezeichnung', description: 'Vollständige Bezeichnung der Ausbildung', selected: false },
      { id: 'employee_voccational_company', title: 'Ausbildungsbetrieb', description: 'Name des Ausbildungsbetriebs', selected: false },
      { id: 'employee_voccational_start', title: 'Ausbildungsbeginn', description: 'Beginn der Ausbildung', selected: false },
      { id: 'employee_voccational_end', title: 'Ausbildungsende', description: 'Ende der Ausbildung', selected: false },
      { id: 'employee_voccational_mint', title: 'MINT-Ausbildung', description: 'MINT-Ausbildung', selected: false },
    ]
  },
  
  // Certificates
  { 
    id: 'employee_certificates', 
    title: 'Zertifikate', 
    description: 'Relevante Zertifikate', 
    category: 'certificates', 
    selected: false,
    fields: [
      { id: 'employee_certificate_title', title: 'Titel', description: 'Bezeichnung des Zertifikats', selected: false },
      { id: 'employee_certificate_issuer', title: 'Aussteller', description: 'Name des Zertifikatsausstellers', selected: false },
      { id: 'employee_certificate_date', title: 'Datum', description: 'Ausstellungsdatum des Zertifikats', selected: false },
      { id: 'employee_certificate_valid_until', title: 'Gültig bis', description: 'Gültigkeitsdatum des Zertifikats', selected: false },
      { id: 'employee_certificate_description', title: 'Beschreibung', description: 'Beschreibung des Zertifikats', selected: false },
    ]
  },
  { 
    id: 'employee_security_clearance', 
    title: 'Sicherheitsüberprüfung', 
    description: 'Sicherheitsüberprüfungsstatus', 
    category: 'certificates', 
    selected: false,
    fields: [
      { id: 'employee_security_clearance_level', title: 'Überprüfungsstufe', description: 'Stufe der Sicherheitsüberprüfung', selected: false },
      { id: 'employee_security_clearance_date', title: 'Datum', description: 'Datum der Sicherheitsüberprüfung', selected: false },
      { id: 'employee_security_clearance_valid_until', title: 'Gültig bis', description: 'Gültigkeitsdatum der Sicherheitsüberprüfung', selected: false },
      { id: 'employee_security_clearance_authority', title: 'Behörde', description: 'Ausstellende Behörde', selected: false },
    ]
  },
  
  // Skills
  { 
    id: 'employee_skills', 
    title: 'Fähigkeiten', 
    description: 'Technische und fachliche Fähigkeiten', 
    category: 'skills', 
    selected: false,
    fields: [
      { id: 'employee_skill_name', title: 'Bezeichnung', description: 'Name der Fähigkeit', selected: false },
      { id: 'employee_skill_level', title: 'Niveau', description: 'Niveau der Fähigkeit', selected: false },
      { id: 'employee_skill_category', title: 'Kategorie', description: 'Kategorie der Fähigkeit', selected: false },
      { id: 'employee_skill_years', title: 'Jahre', description: 'Jahre der Erfahrung', selected: false },
      { id: 'employee_skill_description', title: 'Beschreibung', description: 'Beschreibung der Fähigkeit', selected: false },
    ]
  },
  
  // Projects
  { 
    id: 'employee_external_projects', 
    title: 'Externe Projekte', 
    description: 'Projekte außerhalb von EY', 
    category: 'projects', 
    selected: false,
    fields: [
      { id: 'employee_external_project_title', title: 'Titel', description: 'Projekttitel', selected: false },
      { id: 'employee_external_project_role', title: 'Rolle', description: 'Rolle im Projekt', selected: false },
      { id: 'employee_external_project_start', title: 'Beginn', description: 'Projektbeginn', selected: false },
      { id: 'employee_external_project_end', title: 'Ende', description: 'Projektende', selected: false },
      { id: 'employee_external_project_description', title: 'Beschreibung', description: 'Projektbeschreibung', selected: false },
      { id: 'employee_external_project_customer', title: 'Kunde', description: 'Projektkunde', selected: false },
      { id: 'employee_external_project_industry', title: 'Branche', description: 'Projektbranche', selected: false },
      { id: 'employee_external_project_technologies', title: 'Technologien', description: 'Verwendete Technologien', selected: false },
    ]
  },
  { 
    id: 'employee_professional_background', 
    title: 'Beruflicher Werdegang', 
    description: 'Berufliche Stationen', 
    category: 'experience', 
    selected: false,
    fields: [
      { id: 'employee_professional_position', title: 'Position', description: 'Bezeichnung der Position', selected: false },
      { id: 'employee_professional_company', title: 'Unternehmen', description: 'Name des Unternehmens', selected: false },
      { id: 'employee_professional_start_date', title: 'Beginn', description: 'Beginn der Tätigkeit', selected: false },
      { id: 'employee_professional_end_date', title: 'Ende', description: 'Ende der Tätigkeit', selected: false },
      { id: 'employee_professional_description', title: 'Beschreibung', description: 'Beschreibung der Tätigkeit', selected: false },
      { id: 'employee_professional_industry', title: 'Branche', description: 'Branche des Unternehmens', selected: false },
      { id: 'employee_professional_location', title: 'Standort', description: 'Standort des Unternehmens', selected: false },
      { id: 'employee_professional_executive_position', title: 'Führungsposition', description: 'Führungsposition', selected: false },
      { id: 'employee_professional_experience_it', title: 'IT-Erfahrung', description: 'IT-Erfahrung in Jahren', selected: false },
      { id: 'employee_professional_experience_is', title: 'IS-Erfahrung', description: 'IS-Erfahrung in Jahren', selected: false },
      { id: 'employee_professional_experience_itgs', title: 'ITGS-Erfahrung', description: 'ITGS-Erfahrung in Jahren', selected: false },
      { id: 'employee_professional_experience_gps', title: 'GPS-Erfahrung', description: 'GPS-Erfahrung in Jahren', selected: false },
      { id: 'employee_professional_experience_other', title: 'Sonstige Erfahrung', description: 'Sonstige Erfahrung in Jahren', selected: false },
      { id: 'employee_professional_experience_all', title: 'Gesamterfahrung', description: 'Gesamterfahrung in Jahren', selected: false },
    ]
  },
  { 
    id: 'employee_ey_projects', 
    title: 'EY Projekte', 
    description: 'Projekte bei EY', 
    category: 'projects', 
    selected: false,
    fields: [
      { id: 'employee_ey_project_title', title: 'Titel', description: 'Projekttitel', selected: false },
      { id: 'employee_ey_project_role', title: 'Rolle', description: 'Rolle im Projekt', selected: false },
      { id: 'employee_ey_project_start', title: 'Beginn', description: 'Projektbeginn', selected: false },
      { id: 'employee_ey_project_end', title: 'Ende', description: 'Projektende', selected: false },
      { id: 'employee_ey_project_description', title: 'Beschreibung', description: 'Projektbeschreibung', selected: false },
      { id: 'employee_ey_project_customer', title: 'Kunde', description: 'Projektkunde', selected: false },
      { id: 'employee_ey_project_industry', title: 'Branche', description: 'Projektbranche', selected: false },
      { id: 'employee_ey_project_technologies', title: 'Technologien', description: 'Verwendete Technologien', selected: false },
      { id: 'employee_ey_project_team_size', title: 'Teamgröße', description: 'Größe des Projektteams', selected: false },
      { id: 'employee_ey_project_budget', title: 'Budget', description: 'Projektbudget', selected: false },
    ]
  },
  // Training
  { 
    id: 'employee_training', 
    title: 'Schulungen', 
    description: 'Besuchte und durchgeführte Schulungen', 
    category: 'training', 
    selected: false,
    fields: [
      { id: 'employee_training_title', title: 'Titel', description: 'Titel der Schulung', selected: false },
      { id: 'employee_training_content', title: 'Inhalt', description: 'Inhalt der Schulung', selected: false },
      { id: 'employee_training_type', title: 'Typ', description: 'Typ der Schulung', selected: false },
      { id: 'employee_training_date', title: 'Datum', description: 'Datum der Schulung', selected: false },
      { id: 'employee_training_passed', title: 'Bestanden', description: 'Schulung bestanden', selected: false },
      { id: 'employee_training_passed_date', title: 'Bestanden am', description: 'Datum des Bestehens', selected: false },
      { id: 'employee_training_is_trainer', title: 'Trainer', description: 'Als Trainer tätig', selected: false },
    ]
  },
  // Tasks
  { 
    id: 'employee_tasks', 
    title: 'Aufgaben', 
    description: 'Zugewiesene und erstellte Aufgaben', 
    category: 'tasks', 
    selected: false,
    fields: [
      { id: 'employee_task_title', title: 'Titel', description: 'Titel der Aufgabe', selected: false },
      { id: 'employee_task_description', title: 'Beschreibung', description: 'Beschreibung der Aufgabe', selected: false },
      { id: 'employee_task_status', title: 'Status', description: 'Status der Aufgabe', selected: false },
      { id: 'employee_task_due_date', title: 'Fälligkeitsdatum', description: 'Fälligkeitsdatum der Aufgabe', selected: false },
      { id: 'employee_task_created_by', title: 'Erstellt von', description: 'Ersteller der Aufgabe', selected: false },
      { id: 'employee_task_assigned_to', title: 'Zugewiesen an', description: 'Zuständiger für die Aufgabe', selected: false },
    ]
  },
  // Division
  { 
    id: 'employee_division', 
    title: 'Division', 
    description: 'Division und Unterteilung', 
    category: 'division', 
    selected: false,
    fields: [
      { id: 'employee_division_title', title: 'Titel', description: 'Titel der Division', selected: false },
      { id: 'employee_division_abbreviation', title: 'Abkürzung', description: 'Abkürzung der Division', selected: false },
      { id: 'employee_division_manager', title: 'Manager', description: 'Manager der Division', selected: false },
      { id: 'employee_division_parent', title: 'Übergeordnete Division', description: 'Übergeordnete Division', selected: false },
      { id: 'employee_division_members', title: 'Mitglieder', description: 'Mitglieder der Division', selected: false },
    ]
  },
  // Call to Tender
  { 
    id: 'employee_call_to_tender', 
    title: 'Ausschreibungen', 
    description: 'Beteiligte Ausschreibungen', 
    category: 'callToTender', 
    selected: false,
    fields: [
      { id: 'employee_tender_role', title: 'Rolle', description: 'Rolle in der Ausschreibung', selected: false },
      { id: 'employee_tender_description', title: 'Beschreibung', description: 'Beschreibung der Tätigkeit', selected: false },
      { id: 'employee_tender_profile_title', title: 'Profil', description: 'Profil in der Ausschreibung', selected: false },
      { id: 'employee_tender_cost_center', title: 'Kostenstelle', description: 'Kostenstelle', selected: false },
      { id: 'employee_tender_profile_price', title: 'Profilpreis', description: 'Preis des Profils', selected: false },
      { id: 'employee_tender_travel_cost', title: 'Reisekosten', description: 'Reisekosten', selected: false },
      { id: 'employee_tender_auto_selected', title: 'Automatisch ausgewählt', description: 'Automatisch ausgewählt', selected: false },
    ]
  },
]; 