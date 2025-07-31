import {
  BookCheck,
  BookOpen,
  Bot,
 
  Building2,
  Cone,
  Microscope,
  BookMarked,
  Settings2,

  UserCheck2,
  HelpCircle,
  WorkflowIcon,
  Presentation,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface ProjectItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export const getMainNavConfig = (): NavItem[] => [
  {
    title: "Ausschreibungen",
    url: "/tender",
    icon: BookCheck,
    items: [
      {
        title: "Aktuell",
        url: "/tenders/current",
      },
      {
        title: "Alle",
        url: "/tenders/all",
      },
      {
        title: "Lessons Learned",
        url: "/tenders/lessons-learned",
      },
    ],
  },
  {
    title: "Profile",
    url: "/profiles",
    icon: Bot,
    items: [
      {
        title: "Übersicht",
        url: "/profiles",
      },
    ],
  },
  {
    title: "Projekte",
    url: "/projects",
    icon: BookOpen,
    items: [
      {
        title: "Übersicht",
        url: "/projects",
      },
    ],
  },
  {
    title: "Organisationen",
    url: "/organisations",
    icon: Building2,
    items: [
      {
        title: "Übersicht",
        url: "/organisations",
      },
      {
        title: "Kontakte",
        url: "/organisations/contacts",
      },
    ],
  },
];

export const getProjectsConfig = (): ProjectItem[] => [
  {
    name: "Suchen",
    url: "/search",
    icon: Cone,
  },
  {
    name: "Anlegen",
    url: "/dashboard",
    icon: Microscope,
  },
    
    {
      name: "Angebot",
      url: "/pitch",
      icon: Presentation,
    },
  
]; 

export const getTrainingsConfig = (): ProjectItem[] => [
  {
    name: "Konzepte",
    url: "/concepts",
    icon: BookCheck,
  },
  {
    name: "Vorlagen",
    url: "/templates",
    icon: BookMarked,
  },
  
  {
    name: "Schulungen",
    url: "/trainings",
    icon: BookOpen,
  },
]; 

export const getSettingsConfig = (): ProjectItem[] => [
 
  
  {
    name: "Profil",
    url: "/profile",
    icon: UserCheck2,
  },
  {
    name: "Einstellungen",
    url: "/settings",
    icon: Settings2,
  },
  {
    name: "Support",
    url: "/support",
    icon: HelpCircle,
  }, 
];


export const getTasksConfig = (): ProjectItem[] => [
  {
    name: "Tasks",
    url: "/tasks",
    icon: WorkflowIcon,
  }
]; 