import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { routeConfig } from "@/server/controllers/route-config";

type RouteKey = Exclude<keyof typeof routeConfig, 'user'>;
type SettingsTab = 
  | 'certificates' 
  | 'employeeRoles' 
  | 'employeeRanks' 
  | 'industrySectors' 
  | 'locations' 
  | 'salutations' 
  | 'organisationRoles'
  | 'securityClearance'
  | 'skills'
  | 'divisions';

export const useCreateNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getCurrentRoute = (tabValue?: string): RouteKey => {
    const pathSegments = pathname.split('/');
    
    // Handle settings with tab value
    if (pathname.includes('/settings')) {
      const tab = tabValue || searchParams.get('tab') as SettingsTab;
      if (tab) {
        return tab as RouteKey;
      }
      return 'certificates' as RouteKey; // default tab
    }
    
    // Handle tenders sub-routes
    if (pathname.includes('/tenders/')) {
      if (pathname.includes('/all')) return 'tenders';
      if (pathname.includes('/current')) return 'tenders';
      if (pathname.includes('/deliverables')) return 'tenders';
    }

    // Handle concepts, templates, trainings as their own base routes
    if (pathname.startsWith('/concepts')) return 'concepts';
    if (pathname.startsWith('/templates')) return 'templates';
    if (pathname.startsWith('/trainings')) return 'trainings';

    if (pathname.includes('/organisations/contacts')) {
      return 'contacts';
    }
    const currentSection = pathSegments[1] as RouteKey;
    return currentSection;
  };

  const handleCreate = (tabValue?: string) => {
    const currentRoute = getCurrentRoute(tabValue);
    
    if (currentRoute === 'tenders') {
      if (tabValue === 'deliverables') {
        // Stay on the current page and handle deliverables creation
        return;
      }
      const tenderType = pathname.includes('/all') ? 'all' : 'current';
      const tenderRoute = routeConfig.tenders[tenderType];
      if (tenderRoute?.new) {
        router.push(tenderRoute.new.href);
      }
    } else {
      const route = routeConfig[currentRoute];
      if (route?.new) {
        router.push(route.new.href);
      }
    }
  };

  const getCreateLabel = (tabValue?: string): string => {
    const currentRoute = getCurrentRoute(tabValue);
    
    if (currentRoute === 'tenders') {
      const tenderType = pathname.includes('/all') ? 'all' : 'current';
      const tenderRoute = routeConfig.tenders[tenderType];
      return tenderRoute?.new?.label || 'Create';
    }
    
    const route = routeConfig[currentRoute];
    return route?.new?.label || 'Create';
  };

  return {
    handleCreate,
    getCreateLabel,
    getCurrentRoute,
  };
}; 