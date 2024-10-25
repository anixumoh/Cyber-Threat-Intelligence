import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { ReplaySubject } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export type ThreatContextNavigationItem = {
  name: string;
  url: string;
  icon: string;
  title: string;
};

const ICON_MAP = {
  'actors/': 'icon-users',
  'attack-patterns/': 'icon-server',
  'campaigns/': 'icon-server',
  'cves/': 'icon-server',
  'indicators/ip/resource/': 'icon-newspaper',
  'indicators/malware/resource/': 'icon-newspaper',
  'indicators/crime-server/resource/': 'icon-newspaper',
  'indicators/fqdn/resource/': 'icon-newspaper',
  'signatures/': 'icon-server',
  'tools/': 'icon-wrench'
};

const TITLE_MAP = {
  'actors/': 'Actor',
  'attack-patterns/': 'Attack Pattern',
  'campaigns/': 'Campaign',
  'cves/': 'CVE',
  'indicators/ip/resource/': 'IP',
  'indicators/malware/resource/': 'Malware',
  'indicators/crime-server/resource/': 'Crime server',
  'indicators/fqdn/resource/': 'FQDN',
  'signatures/': 'Sigdature',
  'tools/': 'Tool'
};

@Injectable()
export class ThreatContextNavigationService {
  private items$ = new ReplaySubject<ThreatContextNavigationItem[]>(1);
  currentItems$ = this.items$.asObservable();

  private initialName: string;
  private initialPath: string;

  private queryParam = 'navigation';
  private separator = '\t';
  private blockSeparator = '\n';
  private maxLength = 7;

  private currentSearchParams = '';
  private orgId: number;
  private moduleId: number;

  constructor(router: Router, private organizationService: OrganizationService) {
    this.organizationService
      .getCurrentContext()
      .pipe(
        switchMap((context) => {
          this.orgId = context.currentOrganization.id;
          this.moduleId = context.currentModule.id;
          this._navigationToItems();
          return router.events;
        }),
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this.currentSearchParams = new URL(window.location.href).searchParams.get(this.queryParam);
        this._navigationToItems();
      });
  }

  setInitialName(value: string) {
    this.initialName = value;
  }
  setInitialPath(value: string) {
    this.initialPath = value;
  }

  getNavigation(name: string, path: string) {
    try {
      const blocks = this.currentSearchParams ? atob(this.currentSearchParams).split(this.blockSeparator) : [];

      if (!blocks.length) {
        blocks.push(`${this.cleanString(this.initialName)}${this.separator}${this.initialPath}`);
      }
      blocks.push(`${this.cleanString(name)}${this.separator}${path}`);
      return btoa(blocks.slice(-this.maxLength).join(this.blockSeparator));
    } catch (e) {
      console.warn('getNavigation', e);
      return '';
    }
  }

  cleanString(value: string) {
    // Remove separator characters
    return value.split(this.separator).join(' ').split(this.blockSeparator).join(' ');
  }

  getIcon(path: string) {
    const key = Object.keys(ICON_MAP).find((key) => path.startsWith(key));
    if (key) {
      return ICON_MAP[key];
    }
    return 'icon-desktop_windows';
  }

  getTitle(path: string, name: string) {
    const key = Object.keys(TITLE_MAP).find((key) => path.startsWith(key));
    if (key) {
      return `${TITLE_MAP[key]}: ${name}`;
    }
    return name;
  }

  _navigationToItems() {
    if (!this.currentSearchParams) {
      return this.items$.next([]);
    }

    try {
      const blocks = this.currentSearchParams ? atob(this.currentSearchParams).split(this.blockSeparator) : [];
      const items = blocks.map((block, i) => {
        const navigation = new URLSearchParams({
          [this.queryParam]: btoa(blocks.slice(0, i + 1).join(this.blockSeparator))
        });
        const [name, path] = block.split(this.separator, 2);
        const baseUrl = `/dashboard/organizations/${this.orgId}/modules/${this.moduleId}/threat_context`;
        const url = `${baseUrl}/${path}?${i === 0 ? '' : navigation}`;
        const icon = this.getIcon(path);
        const title = this.getTitle(path, name);
        return { name, url, icon, title };
      });

      this.items$.next(items);
    } catch (e) {
      console.warn('Failed to retrieve navigation', e);
    }
  }
}
