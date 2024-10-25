import { dev } from '$app/environment';
import { type ModuleNameType, MODULE_NAME } from '$lib/constants/modules';
import type Module from '$lib/types/module';
import type Organization from '$lib/types/organization';
import notifications from '$stores/notification';

export type Item = {
  text: string;
  link: string;
  active: boolean;
  icon?: string;
  enabled?: boolean;
  action?: (e: PointerEvent) => void;
  selector?: string;
  submenu?: {
    text: string;
    link: string;
    active: boolean;
  }[];
  hasChevronIcons: boolean;
};

export const allowedModuleTypes: ModuleNameType[] = [
  'credential',
  'credentials',
  'domain_protection',
  'malware',
  'data_leakage',
  'credit_card',
  'hacktivism',
  'dark_web',
  'social_media',
  'custom',
  'mobile_apps',
  'media_tracker',
  'threat_context',
  'explorer'
];

export const moduleIconMap = {
  [MODULE_NAME.CREDENTIAL]: 'assets/icons/sidebar/botnets.svg',
  [MODULE_NAME.CREDENTIALS]: 'assets/icons/sidebar/botnets.svg',
  [MODULE_NAME.SOCIAL_MEDIA]: 'assets/icons/sidebar/brand-abuse.svg',
  [MODULE_NAME.CREDIT_CARD]: 'assets/icons/sidebar/card-broken.svg',
  [MODULE_NAME.DOMAIN_PROTECTION]: 'assets/icons/sidebar/phishing.svg',
  [MODULE_NAME.MOBILE_APPS]: 'assets/icons/sidebar/mobile.svg',
  [MODULE_NAME.MALWARE]: 'assets/icons/sidebar/bug.svg',
  [MODULE_NAME.DATA_LEAKAGE]: 'assets/icons/sidebar/dataleakage.svg',
  [MODULE_NAME.HACKTIVISM]: 'assets/icons/sidebar/hacktivism.svg',
  [MODULE_NAME.MEDIA_TRACKER]: 'assets/icons/sidebar/media-tracker.svg',
  [MODULE_NAME.DARK_WEB]: 'assets/icons/sidebar/dark-web.svg',
  [MODULE_NAME.CUSTOM]: 'assets/icons/sidebar/custom.svg',
  [MODULE_NAME.THREAT_CONTEXT]: 'assets/icons/sidebar/intelligence.svg',
  [MODULE_NAME.EXPLORER]: 'assets/icons/sidebar/radar.svg'
};

export function makeItem(text: string, link: string, currentUrl: string): Item {
  return {
    text,
    link,
    active: currentUrl === link
  };
}

export function makeItemDetails(text: string, link: string, currentUrl: string, word: string): Item {
  return {
    text,
    link,
    active: currentUrl === link || currentUrl.includes(word)
  };
}

export function getModulesMenu(
  modules: Module[],
  organization: Organization,
  selectedModule: number,
  currentUrl: string,
  canCreateModules: boolean,
  isHigherRole: boolean,
  showAlerts: boolean
): Item[] {
  if (!organization?.id || !modules) return [];
  const modulesItems: Item[] = [];

  modules.forEach((m) => {
    if (!allowedModuleTypes.includes(m.moduleName)) return;
    if (m.moduleName === 'threat_context') {
      modulesItems.push(getThreatContextMenu(m, organization.id, selectedModule, currentUrl));

      if (
        dev ||
        window.location.hostname.includes('master.blueliv.com') ||
        window.location.hostname.includes('onliners.blueliv.com')
      ) {
        modulesItems.push(getTCXMenu(m, organization.id, selectedModule, currentUrl));
      }
    } else {
      modulesItems.push(getModuleMenu(m, organization.id, selectedModule, currentUrl, showAlerts));
    }
  });

  if (canCreateModules) {
    const link = `/dashboard/organizations/${organization.id}/create-module`;
    const newModuleItem: Item = {
      text: 'NEW MODULE',
      link,
      active: link === currentUrl,
      action: (e) => {
        if (!organization.enabled && !isHigherRole) {
          e.preventDefault();
          notifications.notify({
            kind: 'warning-alt',
            title: 'This organization is disabled so you cannot create a new module'
          });
        }
      },
      hasChevronIcons: false,
      icon: 'assets/icons/sidebar/plus.svg'
    };
    modulesItems.push(newModuleItem);
  }

  return modulesItems;
}

function getModuleMenu(
  m: Module,
  organizationId: number,
  selectedModule: number,
  currentUrl: string,
  showAlerts: boolean
): Item {
  if (!allowedModuleTypes.includes(m.moduleName)) return;
  const defaultSetting =
    m.moduleName === MODULE_NAME.SOCIAL_MEDIA || m.moduleName === MODULE_NAME.CUSTOM ? 'terms' : 'parameters';
  if (m.type.indexOf('credit_card') >= 0) {
    m.type = 'credit_card_25';
  }
  const icon = moduleIconMap[m.moduleName];
  let submenu: Item[] = [];
  if (m.moduleName === MODULE_NAME.EXPLORER) {
    submenu = getExplorerMenu(m, organizationId, selectedModule, currentUrl);
  } else {
    submenu = [
      makeItemDetails('Threats', `/dashboard/organizations/${organizationId}/modules/${m.id}`, currentUrl, 'resource'),

      ...(dev ||
      window.location.hostname.includes('master.blueliv.com') ||
      window.location.hostname.includes('onliners.blueliv.com')
        ? [
            makeItemDetails(
              'Panintelligence',
              `/dashboard/organizations/${organizationId}/modules/${m.id}/panintelligence`,
              currentUrl,
              'panintelligence'
            )
          ]
        : []),

      ...(showAlerts
        ? [
            makeItemDetails(
              'Alerts',
              `/dashboard/organizations/${organizationId}/modules/${m.id}/alerts`,
              currentUrl,
              'alerts'
            )
          ]
        : []),
      makeItemDetails(
        'Incidents',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/incidents`,
        currentUrl,
        'incidents'
      ),
      makeItemDetails(
        'Settings',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/settings/${defaultSetting}`,
        currentUrl,
        'settings'
      )
    ];
    if (m.moduleName === MODULE_NAME.SOCIAL_MEDIA) {
      submenu.splice(
        1,
        0,
        makeItem('Thumbnails', `/dashboard/organizations/${organizationId}/modules/${m.id}/thumbnails`, currentUrl)
      );
    }
    if (m.moduleName === MODULE_NAME.DARK_WEB) {
      submenu.splice(
        1,
        0,
        makeItem('Search', `/dashboard/organizations/${organizationId}/modules/${m.id}/search`, currentUrl)
      );
    }
  }

  return {
    selector: m.moduleName,
    text: m.name,
    link: `/dashboard/organizations/${organizationId}/modules/${m.id}${m.moduleName === 'explorer' ? '/cve' : ''}`,
    active: m.id === selectedModule,
    enabled: m.enabled,
    icon,
    hasChevronIcons: true,
    submenu
  };
}

function getThreatContextMenu(m: Module, organizationId: number, selectedModule: number, currentUrl: string): Item {
  return {
    text: m.name.toUpperCase(),
    link: `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/actors`,
    icon: moduleIconMap[m.moduleName],
    enabled: m.enabled,
    active: currentUrl.includes('/threat_context'),
    hasChevronIcons: true,
    submenu: [
      makeItemDetails(
        'Actors',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/actors`,
        currentUrl,
        'actors'
      ),
      makeItemDetails(
        'Campaigns',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/campaigns`,
        currentUrl,
        'campaigns'
      ),
      makeItemDetails(
        'Tools',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/tools`,
        currentUrl,
        'tools'
      ),
      makeItemDetails(
        'Indicators',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/indicators`,
        currentUrl,
        'indicators'
      ),
      makeItemDetails(
        'CVEs',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/cves`,
        currentUrl,
        'cves'
      ),
      makeItemDetails(
        'Attack Patterns',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/attack-patterns`,
        currentUrl,
        'attack-patterns'
      ),
      makeItemDetails(
        'Signatures',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/signatures`,
        currentUrl,
        'signatures'
      ),
      makeItemDetails(
        'Malware Hunting',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/malwares`,
        currentUrl,
        'malwares'
      ),
      makeItemDetails(
        'Malware Analysis',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/malware-analysis`,
        currentUrl,
        'malware-analysis'
      ),
      makeItemDetails(
        'Threat Intel Reports',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/threat_context/intel-reports`,
        currentUrl,
        'intel-reports'
      )
    ]
  };
}

function getTCXMenu(m: Module, organizationId: number, selectedModule: number, currentUrl: string): Item {
  return {
    text: `TCX (NEW)`,
    link: `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/dashboard`,
    icon: moduleIconMap[m.type.toLowerCase()],
    enabled: m.enabled,
    hasChevronIcons: true,
    active: currentUrl.includes('/tcx') || currentUrl.includes(`${m.id}/settings/parameters`),
    submenu: [
      makeItemDetails(
        'Dashboard',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/dashboard`,
        currentUrl,
        'tcx/dashboard'
      ),
      makeItemDetails(
        'Global search',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/global-search`,
        currentUrl,
        'tcx/global-search'
      ),
      makeItemDetails(
        'CVE',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/cve`,
        currentUrl,
        'tcx/cve'
      ),
      makeItemDetails(
        'Attack Patterns',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/attack-patterns`,
        currentUrl,
        'tcx/attack-patterns'
      ),
      makeItemDetails(
        'Indicators',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/tcx/indicators`,
        currentUrl,
        'tcx/indicators'
      ),
      makeItemDetails(
        'Settings',
        `/dashboard/organizations/${organizationId}/modules/${m.id}/settings/parameters`,
        currentUrl,
        'settings/parameters'
      )
    ]
  };
}

export function getExplorerMenu(
  explorerModule: Module,
  organizationId: number,
  selectedModule: number,
  currentUrl: string
): Item[] {
  if (!organizationId) return [];

  if (!explorerModule) {
    return [];
  }

  return [
    makeItem('Threats', `/dashboard/organizations/${organizationId}/modules/${explorerModule.id}/cve`, currentUrl),
    makeItem('Alerts', `/dashboard/organizations/${organizationId}/modules/${explorerModule.id}/alerts`, currentUrl),
    makeItem(
      'Settings',
      `/dashboard/organizations/${organizationId}/modules/${explorerModule.id}/settings/parameters`,
      currentUrl
    )
  ];
}
