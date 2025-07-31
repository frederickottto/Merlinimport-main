export type DeliverablesPlaceholderCategory = 'basic' | 'content' | 'templates' | 'tenders';

export interface DeliverablesPlaceholderField {
  id: string;
  title: string;
  description: string;
  selected: boolean;
}

export interface DeliverablesPlaceholder {
  id: string;
  title: string;
  description: string;
  category: DeliverablesPlaceholderCategory;
  selected: boolean;
  fields?: DeliverablesPlaceholderField[];
}

export const DELIVERABLES_PLACEHOLDERS: DeliverablesPlaceholder[] = [
  // Basic Info
  { 
    id: 'deliverable_type', 
    title: 'Typ', 
    description: 'Typ des Deliverables', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'deliverable_title', 
    title: 'Titel', 
    description: 'Titel des Deliverables', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'deliverable_description', 
    title: 'Beschreibung', 
    description: 'Beschreibung des Deliverables', 
    category: 'basic', 
    selected: false 
  },
  { 
    id: 'deliverable_keywords', 
    title: 'Schlüsselwörter', 
    description: 'Relevante Schlüsselwörter', 
    category: 'basic', 
    selected: false 
  },

  // Content
  { 
    id: 'deliverable_content', 
    title: 'Inhaltsdetails', 
    description: 'Detaillierte Informationen zum Inhalt', 
    category: 'content', 
    selected: false,
    fields: [
      { id: 'deliverable_status', title: 'Status', description: 'Status des Deliverables', selected: false },
      { id: 'deliverable_text_maturity', title: 'Textreife', description: 'Reife des Textes', selected: false },
      { id: 'deliverable_word_count', title: 'Wortanzahl', description: 'Anzahl der Wörter', selected: false },
      { id: 'deliverable_language', title: 'Sprache', description: 'Sprache des Deliverables', selected: false },
      { id: 'deliverable_gender_neutral', title: 'Gendergerecht', description: 'Gendergerechte Formulierung', selected: false },
      { id: 'deliverable_professional_tone', title: 'Professioneller Ton', description: 'Professioneller Schreibstil', selected: false },
      { id: 'deliverable_contains_graphics', title: 'Grafiken', description: 'Enthält Grafiken', selected: false },
      { id: 'deliverable_notes', title: 'Notizen', description: 'Zusätzliche Notizen', selected: false },
    ]
  },

  // Templates
  { 
    id: 'deliverable_templates', 
    title: 'Vorlagen', 
    description: 'Zugeordnete Vorlagen', 
    category: 'templates', 
    selected: false,
    fields: [
      { id: 'deliverable_template_id', title: 'Vorlage', description: 'Zugeordnete Vorlage', selected: false },
      { id: 'deliverable_template_file_path', title: 'Dateipfad', description: 'Pfad zur Vorlagendatei', selected: false },
      { id: 'deliverable_template_type', title: 'Vorlagentyp', description: 'Typ der Vorlage', selected: false },
      { id: 'deliverable_template_title', title: 'Vorlagentitel', description: 'Titel der Vorlage', selected: false },
      { id: 'deliverable_template_description', title: 'Vorlagenbeschreibung', description: 'Beschreibung der Vorlage', selected: false },
      { id: 'deliverable_template_keywords', title: 'Vorlagenschlüsselwörter', description: 'Schlüsselwörter der Vorlage', selected: false },
      { id: 'deliverable_template_notes', title: 'Vorlagennotizen', description: 'Notizen zur Vorlage', selected: false },
    ]
  },

  // Tenders
  { 
    id: 'deliverable_tender', 
    title: 'Ausschreibungsdeliverables', 
    description: 'Zugeordnete Ausschreibungsdeliverables', 
    category: 'tenders', 
    selected: false,
    fields: [
      { id: 'deliverable_call_to_tender_id', title: 'Ausschreibung', description: 'Zugeordnete Ausschreibung', selected: false },
      { id: 'deliverable_auto_selected', title: 'Automatisch ausgewählt', description: 'Automatisch ausgewähltes Deliverable', selected: false },
    ]
  },
]; 