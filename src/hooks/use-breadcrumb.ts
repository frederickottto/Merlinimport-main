import { usePathname } from "next/navigation";
import { api } from "@/trpc/react";

type BreadcrumbOptions = {
  includeHome?: boolean;
};

type BreadcrumbItem = {
  label: string;
  href: string;
};

// MongoDB ObjectId is a 24-character hex string
const isObjectId = (str: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(str);
};

const breadcrumbConfig = {
  home: { label: 'Dashboard', href: '/dashboard' },
  user: {
    account: { label: 'Account', path: '/account' },
    profile: { label: 'Profile', path: '/profile' },
    settings: { label: 'Settings', path: '/settings' }
  },
  tenders: { label: 'Ausschreibungen', href: '/tenders' },
  concepts: { label: 'Konzepte', href: '/concepts' },
  templates: { label: 'Vorlagen', href: '/templates' },
  profiles: { label: 'Profile', href: '/profiles' },
  organisations: { label: 'Organisationen', href: '/organisations' },
  contacts: { label: 'Kontakte', href: '/organisations/contacts' },
  projects: { label: 'Projekte', href: '/projects' },
  tasks: { label: 'Aufgaben', href: '/tasks' },
  search: { label: 'Suche', href: '/search' },
  new: {
    tender: { label: 'Neue Ausschreibung', href: '/tenders/new' },
    concept: { label: 'Neues Konzept', href: '/concepts/new' },
    template: { label: 'Neue Vorlage', href: '/templates/new' },
    profile: { label: 'Neues Profil', href: '/profiles/new' },
    organisation: { label: 'Neue Organisation', href: '/organisations/new' },
    contact: { label: 'Neuer Kontakt', href: '/organisations/contacts/new' },
    project: { label: 'Neues Projekt', href: '/projects/new' },
    division: { label: 'Neue Division', href: '/settings/divisions/new' },
    lessonsLearned: { label: 'Neue Lessons Learned', href: '/tenders/lessons-learned/new' },
    task: { label: 'Neue Aufgabe', href: '/tasks/new' }
  }
};

export const useBreadcrumb = (options: BreadcrumbOptions = {}) => {
  const { includeHome = true } = options;
  const pathname = usePathname();
  const paths = pathname.split('/').filter(Boolean);

  // Get the ID from the URL if it exists
  const lastSegment = paths[paths.length - 1];
  const isDetailPage = !lastSegment?.includes('new') && isObjectId(lastSegment);
  const id = isDetailPage ? lastSegment : undefined;

  // Fetch data for detail pages - always call these hooks but conditionally enable them
  const { data: tender } = api.tenders.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'tenders' && isDetailPage }
  );

  const { data: concept } = api.concepts.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'concepts' && isDetailPage }
  );

  const { data: template } = api.templates.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'templates' && isDetailPage }
  );

  const { data: profile } = api.profiles.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'profiles' && isDetailPage }
  );

  const { data: organisation } = api.organisations.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'organisations' && !paths[1] && isDetailPage }
  );

  const { data: project } = api.projects.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'projects' && isDetailPage }
  );

  const { data: contact } = api.organisationContacts.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'organisations' && paths[1] === 'contacts' && isDetailPage }
  );

  const { data: training } = api.trainings.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'trainings' && isDetailPage }
  );

  const { data: task } = api.tasks.getById.useQuery(
    { id: id! },
    { enabled: paths[0] === 'tasks' && isDetailPage }
  );

  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = includeHome ? [breadcrumbConfig.home] : [];

    // Handle user routes
    if (paths[0] === 'account' || paths[0] === 'profile' || paths[0] === 'settings') {
      const userItem = breadcrumbConfig.user[paths[0] as keyof typeof breadcrumbConfig.user];
      if (userItem) {
        items.push({ label: userItem.label, href: userItem.path });
      }
      return items;
    }

    // Handle search route
    if (paths[0] === 'search') {
      items.push(breadcrumbConfig.search);
      return items;
    }

    // Handle concepts routes
    if (paths[0] === 'concepts') {
      items.push(breadcrumbConfig.concepts);
      if (isDetailPage) {
        items.push({ label: concept?.title || 'Konzept', href: `/concepts/${id}` });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.concept);
      }
      return items;
    }

    // Handle templates routes
    if (paths[0] === 'templates') {
      items.push(breadcrumbConfig.templates);
      if (isDetailPage) {
        items.push({ label: template?.title || 'Vorlage', href: `/templates/${id}` });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.template);
      }
      return items;
    }

    // Handle tender routes
    if (paths[0] === 'tenders') {
      items.push(breadcrumbConfig.tenders);
      if (paths[1] === 'lessons-learned') {
        items.push({ label: 'Lessons Learned', href: '/tenders/lessons-learned' });
        if (isDetailPage) {
          items.push({ label: 'Lessons Learned Details', href: `/tenders/lessons-learned/${id}` });
        } else if (paths[2] === 'new') {
          items.push(breadcrumbConfig.new.lessonsLearned);
        }
      } else if (isDetailPage) {
        items.push({ label: tender?.title || 'Ausschreibung', href: `/tenders/${id}` });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.tender);
      }
      return items;
    }

    // Handle profile routes
    if (paths[0] === 'profiles') {
      items.push(breadcrumbConfig.profiles);
      if (isDetailPage) {
        items.push({ 
          label: profile ? `${profile.foreName} ${profile.lastName}` : 'Profil', 
          href: `/profiles/${id}` 
        });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.profile);
      }
    }

    // Handle organisation routes
    if (paths[0] === 'organisations') {
      items.push(breadcrumbConfig.organisations);
      if (paths[1] === 'contacts') {
        items.push(breadcrumbConfig.contacts);
        if (isDetailPage) {
          items.push({ 
            label: contact ? `${contact.foreName} ${contact.lastName}` : 'Kontakt',
            href: `/organisations/contacts/${id}` 
          });
        } else if (paths[2] === 'new') {
          items.push(breadcrumbConfig.new.contact);
        }
      } else if (isDetailPage) {
        items.push({ 
          label: organisation?.name || 'Organisation', 
          href: `/organisations/${id}` 
        });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.organisation);
      }
    }

    // Handle project routes
    if (paths[0] === 'projects') {
      items.push(breadcrumbConfig.projects);
      if (isDetailPage) {
        items.push({ label: project?.title || 'Projekt', href: `/projects/${id}` });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.project);
      }
    }

    // Handle tasks routes
    if (paths[0] === 'tasks') {
      items.push(breadcrumbConfig.tasks);
      if (isDetailPage) {
        items.push({ label: task?.title || 'Aufgabe', href: `/tasks/${id}` });
      } else if (paths[1] === 'new') {
        items.push(breadcrumbConfig.new.task);
      }
      return items;
    }

    // Handle trainings routes
    if (paths[0] === 'trainings') {
      items.push({ label: 'Trainings', href: '/trainings' });
      if (isDetailPage) {
        items.push({ label: training?.trainingTitle || 'Training', href: `/trainings/${id}` });
      } else if (paths[1] === 'new') {
        items.push({ label: 'Neues Training', href: '/trainings/new' });
      }
      return items;
    }

    return items;
  };

  return {
    items: getBreadcrumbItems(),
    currentPath: pathname,
  };
}; 