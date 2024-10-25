import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, finalize, map, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import * as moment from 'moment';
import {
  convertNumberToNumberWithK,
  convertToCSV,
  exportClientFile,
  proccesLinkToUpdateRedirection
} from '../../../../utils/functions';
import { DomSanitizer } from '@angular/platform-browser';
import { ToolsService } from '../../../../core/models/tools.service';
import { MalwaresService } from '../../../../core/models/malwares.service';

enum ToolsTabs {
  DESCRIPTION,
  MALWARE,
  ACTORS,
  CAMPAIGNS,
  CVE,
  SIGNATURES
}

@Component({
  selector: 'app-tools-details',
  templateUrl: './tools-details.component.html',
  styleUrls: ['./tools-details.component.scss']
})
export class ToolsDetailsComponent implements OnInit, OnDestroy {
  id;
  name = '';
  path = '';
  item;
  activeModule;
  activeOrganization;
  loading = false;
  tabs = [];
  entries = [];
  entries2 = [];
  canStartToLoadMalware = true;
  canStartToLoadActors = false;
  canStartToLoadCampaigns = false;
  canStartToLoadCVE = false;
  canStartToLoadSignatures = false;
  activeTab;
  toolsTabs = ToolsTabs;
  description;
  actorId;
  references = [];
  backendData;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private toolsService: ToolsService,
    private malwaresService: MalwaresService,
    protected sanitizer: DomSanitizer
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.id = this.route.snapshot.paramMap.get('toolId');
    this.startTab();
  }

  ngOnInit() {
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });

    this.getDetails(this.id);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  malwareSource = (params) =>
    this.malwaresService.fullList({ ...params, ...{ dork: `type:~"${this.name.toUpperCase()}"` } }).pipe(
      map((response) => {
        const result = {
          data: response.data.map((item) => ({
            id: item.id,
            type: item.type,
            attributes: {
              risk:
                item.attributes.risk || typeof item.attributes.cerberus === 'number'
                  ? item.attributes.cerberus * 10
                  : '-',
              type: 'Malware',
              value: item.attributes.sha256,
              ioc_types: item.attributes.types_names,
              first_seen: item.attributes.first_seen,
              last_seen: item.attributes.last_seen
            }
          })),
          meta: response.meta
        };
        const count = convertNumberToNumberWithK(response.meta.pagination.count || 0);
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.MALWARE,
          loading: false,
          count
        };
        this.updateTab(tab);
        return result;
      }),
      finalize(() => {
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.MALWARE,
          loading: false
        };
        this.updateTab(tab);
      })
    );
  actorsListSource = (params) => this.toolsService.getRelations({ id: this.id, relation: 'threat-actor', params });
  signaturesListSource = (params) => this.toolsService.getRelations({ id: this.id, relation: 'signature', params });
  cveListSource = (params) => this.toolsService.getRelations({ id: this.id, relation: 'cve', params });
  campaignsSource = (params) => this.toolsService.getRelations({ id: this.id, relation: 'campaign', params });

  updateTab(tabData) {
    this.tabs = this.tabs.map((tab) => {
      if (tab.id === tabData.id) {
        return { ...tab, ...tabData };
      }
      return tab;
    });
  }

  backToList() {
    const { dork } = this.route.snapshot.queryParams;
    this.router.navigate(
      [`/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/tools`],
      { queryParams: { dork } }
    );
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case ToolsTabs.MALWARE:
        this.canStartToLoadMalware = true;
        break;
      case ToolsTabs.ACTORS:
        this.canStartToLoadActors = true;
        break;
      case ToolsTabs.CVE:
        this.canStartToLoadCVE = true;
        break;
      case ToolsTabs.SIGNATURES:
        this.canStartToLoadSignatures = true;
        break;
      case ToolsTabs.CAMPAIGNS:
        this.canStartToLoadCampaigns = true;
        break;
    }
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData);
      exportClientFile(convertToCSV([csvInfo]), 'tool-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'tool-details', 'json');
    }
  }

  private getDetails(id) {
    this.loading = true;
    this.toolsService
      .details(id)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }: any) => {
        if (data && data.attributes) {
          this.backendData = data;
          const { name, description, references, ...rest } = data.attributes;
          this.name = name;
          this.path = `tools/${id}`;
          this.item = { ...rest, id, name, relationships: data.relationships };
          this.references = references || [];
          this.description = this.buildDescription(description);
          this.createEntries({ name, ...rest });
          this.processRelationships(data.relationships);
        }
      });
  }

  private buildDescription(description) {
    return proccesLinkToUpdateRedirection(description, this.activeModule.id, this.activeOrganization.id);
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { threat_actors, campaigns, cves, signatures } = relationships;

      if (campaigns) {
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.CAMPAIGNS,
          loading: false,
          count: campaigns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (signatures) {
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.SIGNATURES,
          loading: false,
          count: signatures.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (threat_actors) {
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.ACTORS,
          loading: false,
          count: threat_actors.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (cves) {
        const tab: Partial<ITabsItem> = {
          id: ToolsTabs.CVE,
          loading: false,
          count: cves.meta.count || 0
        };
        this.updateTab(tab);
      }
    }
  }

  private createEntries({ first_seen, last_seen, tlp, version, targeted_platforms }) {
    const firstSeen = first_seen ? moment(first_seen).format('DD/MM/YYYY') : '-';
    const lastSeen = last_seen ? moment(last_seen).format('DD/MM/YYYY') : '-';
    this.entries = [];

    this.entries.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
    this.entries.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: tlp });

    this.entries2.push({
      icon: 'icon-clock bg-primary',
      title: 'Targeted Platforms',
      value: targeted_platforms && targeted_platforms.length > 0 ? targeted_platforms.join(', ') : '-'
    });
    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'Version', value: version || '-' });
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: ToolsTabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Malware',
        id: ToolsTabs.MALWARE,
        icon: 'icon-bug',
        loading: true,
        count: 0
      },
      {
        title: 'Threat Actors',
        id: ToolsTabs.ACTORS,
        icon: 'icon-users',
        loading: true,
        count: 0
      },
      {
        title: 'Campaigns',
        id: ToolsTabs.CAMPAIGNS,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'CVE',
        id: ToolsTabs.CVE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Signatures',
        id: ToolsTabs.SIGNATURES,
        icon: 'icon-server',
        loading: true,
        count: 0
      }
    ];
    this.onTabChange(this.tabs[0].id);
  }

  private extractCsvData(data) {
    const { attributes, relationships } = data;
    const references = (attributes.references || []).map((item) => item.link || item.url || ' ').join(', ');

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      NAME: attributes.name,
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      TARGETED_PLATFORMS: (attributes.targeted_platforms || []).join(', '),
      VERSION: attributes.version || '',
      DESCRIPTION: attributes.description || ' ',
      REFERENCES: references,
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      CVES: relationships.cves ? relationships.cves.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0
    };
  }
}
