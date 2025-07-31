import { z } from "zod";

// Base schema for route items
export const routeItemSchema = z.object({
  label: z.string(),
  path: z.string(),
  type: z.string(),
  breadcrumb: z.object({
    label: z.string(),
    href: z.string(),
  }),
  new: z.object({
    label: z.string(),
    href: z.string(),
  }),
});

export type RouteItem = z.infer<typeof routeItemSchema>;

// Unified route configuration
export const routeConfig = {
  tenders: {
    all: {
      label: "Alle Ausschreibungen",
      path: "/tenders/all",
      type: "overview",
      breadcrumb: { label: "Alle Ausschreibungen", href: "/tenders/all" },
      new: { label: "Neue Ausschreibung", href: "/tenders/new" },
    },
    current: {
      label: "Aktuelle Ausschreibungen",
      path: "/tenders/current",
      type: "overview",
      breadcrumb: { label: "Aktuelle Ausschreibungen", href: "/tenders/current" },
      new: { label: "Neue Ausschreibung", href: "/tenders/new" },
    },
    lessonsLearned: {
      label: "Lessons Learned",
      path: "/tenders/lessons-learned",
      type: "overview",
      breadcrumb: { label: "Lessons Learned", href: "/tenders/lessons-learned" },
      new: { label: "Neue Lessons Learned", href: "/tenders/lessons-learned/new" },
    },
  },
  
  concepts: {
    label: "Konzept",
    path: "/concepts",
    type: "concept",
    breadcrumb: { label: "Konzepte", href: "/concepts" },
    new: { label: "Neues Konzept", href: "/concepts/new" },
  },
  templates: {
    label: "Vorlage",
    path: "/templates",
    type: "template",
    breadcrumb: { label: "Vorlagen", href: "/templates" },
    new: { label: "Neue Vorlage", href: "/templates/new" },
  },
  trainings: {
    label: "Training",
    path: "/trainings",
    type: "training",
    breadcrumb: { label: "Trainings", href: "/trainings" },
    new: { label: "Neues Training", href: "/trainings/new" },
  },
  profiles: {
    label: "Profil",
    path: "/profiles",
    type: "profile",
    breadcrumb: { label: "Profile", href: "/profiles" },
    new: { label: "Neues Profil", href: "/profiles/new" },
  },
  organisations: {
    label: "Organisation",
    path: "/organisations",
    type: "organisation",
    breadcrumb: { label: "Organisationen", href: "/organisations" },
    new: { label: "Neue Organisation", href: "/organisations/new" },
  },
  projects: {
    label: "Projekt",
    path: "/projects",
    type: "project",
    breadcrumb: { label: "Projekte", href: "/projects" },
    new: { label: "Neues Projekt", href: "/projects/new" },
  },
  contacts: {
    label: "Kontakt",
    path: "/organisations/contacts",
    type: "contact",
    breadcrumb: { label: "Kontakte", href: "/organisations/contacts" },
    new: { label: "Neuer Kontakt", href: "/organisations/contacts/new" },
  },
  certificates: {
    label: "Zertifikat",
    path: "/settings/certificates",
    type: "certificate",
    breadcrumb: { label: "Zertifikate", href: "/settings/certificates" },
    new: { label: "Neues Zertifikat", href: "/settings/certificates/new" },
  },
  employeeRoles: {
    label: "Mitarbeiterrolle",
    path: "/settings/employee-roles",
    type: "employeeRole",
    breadcrumb: { label: "Mitarbeiterrollen", href: "/settings/employee-roles" },
    new: { label: "Neue Mitarbeiterrolle", href: "/settings/employee-roles/new" },
  },
  employeeRanks: {
    label: "Mitarbeiterrang",
    path: "/settings/employee-ranks",
    type: "employeeRank",
    breadcrumb: { label: "Mitarbeiterränge", href: "/settings/employee-ranks" },
    new: { label: "Neuer Mitarbeiterrang", href: "/settings/employee-ranks/new" },
  },
  industrySectors: {
    label: "Branche",
    path: "/settings/industry-sectors",
    type: "industrySector",
    breadcrumb: { label: "Branchen", href: "/settings/industry-sectors" },
    new: { label: "Neue Branche", href: "/settings/industry-sectors/new" },
  },
  locations: {
    label: "Standort",
    path: "/settings/locations",
    type: "location",
    breadcrumb: { label: "Standorte", href: "/settings/locations" },
    new: { label: "Neuer Standort", href: "/settings/locations/new" },
  },
  salutations: {
    label: "Anrede",
    path: "/settings/salutations",
    type: "salutation",
    breadcrumb: { label: "Anreden", href: "/settings/salutations" },
    new: { label: "Neue Anrede", href: "/settings/salutations/new" },
  },
  divisions: {
    label: "Abteilung",
    path: "/settings/divisions",
    type: "division",
    breadcrumb: { label: "Abteilungen", href: "/settings/divisions" },
    new: { label: "Neue Abteilung", href: "/settings/divisions/new" },
  },
  organisationRoles: {
    label: "Organisationsrolle",
    path: "/settings/organisation-roles",
    type: "organisationRole",
    breadcrumb: { label: "Organisationsrollen", href: "/settings/organisation-roles" },
    new: { label: "Neue Organisationsrolle", href: "/settings/organisation-roles/new" },
  },
  securityClearance: {
    label: "Sicherheitscheck",
    path: "/settings/security-clearance",
    type: "securityClearance",
    breadcrumb: { label: "Sicherheitscheck", href: "/settings/security-clearance" },
    new: { label: "Neuer Sicherheitscheck", href: "/settings/security-clearance/new" },
  },
  skills: {
    label: "Skill",
    path: "/settings/skills",
    type: "skill",
    breadcrumb: { label: "Skills", href: "/settings/skills" },
    new: { label: "Neuer Skill", href: "/settings/skills/new" },
  },
  user: {
    account: {
      label: "Account",
      path: "/account",
      type: "user",
      breadcrumb: { label: "Account", href: "/account" },
      new: { label: "Account", href: "/account" },
    },
    profile: {
      label: "Profile",
      path: "/profile",
      type: "user",
      breadcrumb: { label: "Profile", href: "/profile" },
      new: { label: "Profile", href: "/profile" },
    },
    settings: {
      label: "Settings",
      path: "/settings",
      type: "user",
      breadcrumb: { label: "Settings", href: "/settings" },
      new: { label: "Settings", href: "/settings" },
    },
    logout: {
      label: "Logout",
      path: "/logout",
      type: "user",
      breadcrumb: { label: "Logout", href: "/logout" },
      new: { label: "Logout", href: "/logout" },
    },
  },
  pitch: {
    label: "Pitch-Modul",
    path: "/settings/pitch",
    type: "pitch",
    breadcrumb: { label: "Pitch-Module", href: "/settings/pitch" },
    new: { label: "Neues Pitch-Modul", href: "/settings/pitch/new" },
  },
  tasks: {
    label: "Aufgabe",
    path: "/tasks",
    type: "task",
    breadcrumb: { label: "Aufgaben", href: "/tasks" },
    new: { label: "Neue Aufgabe", href: "/tasks/new" },
  },
} as const;

export type RouteConfig = typeof routeConfig;
export type RouteKey = keyof RouteConfig;

type BreadcrumbConfig = {
  home: { label: string; href: string };
  tenders: { label: string; href: string };
  concepts: { label: string; href: string };
  templates: { label: string; href: string };
  profiles: { label: string; href: string };
  organisations: { label: string; href: string };
  projects: { label: string; href: string };
  contacts: { label: string; href: string };
  new: {
    tender: { label: string; href: string };
    concept: { label: string; href: string };
    template: { label: string; href: string };
    profile: { label: string; href: string };
    organisation: { label: string; href: string };
    project: { label: string; href: string };
    contact: { label: string; href: string };
  };
  user: {
    account: { label: string; path: string; type: string; breadcrumb: { label: string; href: string }; new: { label: string; href: string } };
    profile: { label: string; path: string; type: string; breadcrumb: { label: string; href: string }; new: { label: string; href: string } };
    settings: { label: string; path: string; type: string; breadcrumb: { label: string; href: string }; new: { label: string; href: string } };
    logout: { label: string; path: string; type: string; breadcrumb: { label: string; href: string }; new: { label: string; href: string } };
  };
};

// Helper functions
export const getBreadcrumbConfig = (): BreadcrumbConfig => {
  return {
    home: { label: "Home", href: "/" },
    tenders: routeConfig.tenders.all.breadcrumb,
    concepts: routeConfig.concepts.breadcrumb,
    templates: routeConfig.templates.breadcrumb,
    profiles: routeConfig.profiles.breadcrumb,
    organisations: routeConfig.organisations.breadcrumb,
    projects: routeConfig.projects.breadcrumb,
    contacts: routeConfig.contacts.breadcrumb,
    new: {
      tender: routeConfig.tenders.all.new,
      concept: routeConfig.concepts.new,
      template: routeConfig.templates.new,
      profile: routeConfig.profiles.new,
      organisation: routeConfig.organisations.new,
      project: routeConfig.projects.new,
      contact: routeConfig.contacts.new,
    },
    user: routeConfig.user,
  };
};

export const getAddButtonConfig = () => {
  const config = {
    tenders: {
      all: {
        label: routeConfig.tenders.all.label,
        path: routeConfig.tenders.all.new.href,
        type: routeConfig.tenders.all.type,
      },
      current: {
        label: routeConfig.tenders.current.label,
        path: routeConfig.tenders.current.new.href,
        type: routeConfig.tenders.current.type,
      },
    },
    concepts: {
      label: routeConfig.concepts.label,
      path: routeConfig.concepts.new.href,
      type: routeConfig.concepts.type,
    },
    templates: {
      label: routeConfig.templates.label,
      path: routeConfig.templates.new.href,
      type: routeConfig.templates.type,
    },
    profiles: {
      label: routeConfig.profiles.label,
      path: routeConfig.profiles.new.href,
      type: routeConfig.profiles.type,
    },
    organisations: {
      label: routeConfig.organisations.label,
      path: routeConfig.organisations.new.href,
      type: routeConfig.organisations.type,
    },
    projects: {
      label: routeConfig.projects.label,
      path: routeConfig.projects.new.href,
      type: routeConfig.projects.type,
    },
    contacts: {
      label: routeConfig.contacts.label,
      path: routeConfig.contacts.new.href,
      type: routeConfig.contacts.type,
    },
  };
  return config;
}; 