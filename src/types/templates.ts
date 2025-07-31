export type DocumentCategory = 'Referenzen' | 'Profile' | 'Konzepte';

export interface DocumentType {
  id: string;
  category: DocumentCategory;
  name: string;
  description: string;
  models: {
    tender: string;  // CallToTender model
    base: string;    // Base model
  };
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    id: 'projects',
    category: 'Referenzen',
    name: 'Projekte',
    description: 'Projektreferenzen und Ausschreibungsprojekte',
    models: {
      tender: 'CallToTenderProjects',
      base: 'Projects'
    }
  },
  {
    id: 'employees',
    category: 'Profile',
    name: 'Mitarbeiter',
    description: 'Mitarbeiterprofile und Ausschreibungsmitarbeiter',
    models: {
      tender: 'CallToTenderEmployee',
      base: 'Employee'
    }
  },
  {
    id: 'deliverables',
    category: 'Konzepte',
    name: 'Liefergegenstände',
    description: 'Liefergegenstände und Ausschreibungsliefergegenstände',
    models: {
      tender: 'CallToTenderDeliverables',
      base: 'Deliverables'
    }
  }
];

export interface DocumentSelection {
  type: DocumentType;
  quantity: number;
  selectedItems: string[];  // IDs of selected items
}

export interface TemplatePlaceholder {
  key: string;
  description: string;
  value?: string;
  category?: DocumentCategory;
  type?: string;
} 