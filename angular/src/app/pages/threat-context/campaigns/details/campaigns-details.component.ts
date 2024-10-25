import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, finalize, take, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import { CampaignsService } from '../../../../core/models/campaigns.service';
import * as moment from 'moment';
import { convertToCSV, exportClientFile, proccesLinkToUpdateRedirection } from '../../../../utils/functions';
import { DomSanitizer } from '@angular/platform-browser';
import { ActorsService } from '../../../../core/models/actors.service';

enum CampaignsTabs {
  DESCRIPTION,
  CONTEXT,
  ACTORS,
  TOOL,
  CVE,
  ATTACK_PATTERN,
  SIGNATURES
}

@Component({
  selector: 'app-campaigns-details',
  templateUrl: './campaigns-details.component.html',
  styleUrls: ['./campaigns-details.component.scss']
})
export class CampaignsDetailsComponent implements OnInit, OnDestroy {
  id;
  name = '';
  path = '';
  item;
  activeModule;
  activeOrganization;
  loading = false;
  tabs = [];
  entries = [];
  canStartToLoadActors = false;
  canStartToLoadContext = false;
  canStartToLoadCVE = false;
  canStartToLoadAttackPatterns = false;
  canStartToLoadSignatures = false;
  canStartToLoadTools = false;
  activeTab;
  campaignsTabs = CampaignsTabs;
  description;
  actorId;
  backendData;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private campaignsService: CampaignsService,
    private actorsService: ActorsService,
    protected sanitizer: DomSanitizer
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.id = this.route.snapshot.paramMap.get('campaignId');
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

  actorsListSource = (params) =>
    this.actorsService
      .details(this.actorId)
      .pipe(map((item) => ({ data: [item.data], meta: { pagination: { count: 1 } } })));
  iocSource = (params) => this.campaignsService.getRelations({ id: this.id, relation: 'ioc', params });
  toolsListSource = (params) => this.campaignsService.getRelations({ id: this.id, relation: 'tool', params });
  signaturesListSource = (params) => this.campaignsService.getRelations({ id: this.id, relation: 'signature', params });
  cveListSource = (params) => this.campaignsService.getRelations({ id: this.id, relation: 'cve', params });
  attackPatternsSource = (params) =>
    this.campaignsService.getRelations({ id: this.id, relation: 'attack-pattern', params });

  updateTab(tabData) {
    this.tabs = this.tabs.map((tab) => {
      if (tab.id === tabData.id) {
        return { ...tab, ...tabData };
      }
      return tab;
    });
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData);
      exportClientFile(convertToCSV([csvInfo]), 'campaign-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'campaign-details', 'json');
    }
  }

  backToList() {
    const { dork } = this.route.snapshot.queryParams;
    this.router.navigate(
      [
        `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/campaigns`
      ],
      { queryParams: { dork } }
    );
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case CampaignsTabs.ACTORS:
        this.canStartToLoadActors = true;
        break;
      case CampaignsTabs.CVE:
        this.canStartToLoadCVE = true;
        break;
      case CampaignsTabs.SIGNATURES:
        this.canStartToLoadSignatures = true;
        break;
      case CampaignsTabs.ATTACK_PATTERN:
        this.canStartToLoadAttackPatterns = true;
        break;
      case CampaignsTabs.TOOL:
        this.canStartToLoadTools = true;
        break;
      case CampaignsTabs.CONTEXT:
        this.canStartToLoadContext = true;
        break;
    }
  }

  private getDetails(id) {
    this.loading = true;
    this.campaignsService
      .details(id)
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }: any) => {
        if (data && data.attributes) {
          this.backendData = data;
          const { name, description, ...rest } = data.attributes;
          this.name = name;
          this.path = `campaigns/${id}`;
          this.item = { ...rest, id, name, relationships: data.relationships };
          this.description = this.buildDescription(description);
          this.createEntries(rest);
          this.processRelationships(data.relationships);
        }
      });
  }

  private buildDescription(description) {
    return proccesLinkToUpdateRedirection(description, this.activeModule.id, this.activeOrganization.id);
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { threat_actor, attack_patterns, tools, cves, signatures, malware, fqdns, ips } = relationships;

      const contextCount =
        (malware ? malware.meta.count || 0 : 0) + (fqdns ? fqdns.meta.count || 0 : 0) + (ips ? ips.meta.count || 0 : 0);
      const malwareTab: Partial<ITabsItem> = {
        id: CampaignsTabs.CONTEXT,
        loading: false,
        count: contextCount
      };
      this.updateTab(malwareTab);

      if (attack_patterns) {
        const tab: Partial<ITabsItem> = {
          id: CampaignsTabs.ATTACK_PATTERN,
          loading: false,
          count: attack_patterns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (signatures) {
        const tab: Partial<ITabsItem> = {
          id: CampaignsTabs.SIGNATURES,
          loading: false,
          count: signatures.meta.count || 0
        };
        this.updateTab(tab);
      }

      const actorsLink = threat_actor ? threat_actor.links.related : '';
      const actorsTab: Partial<ITabsItem> = {
        id: CampaignsTabs.ACTORS,
        loading: false,
        count: 0
      };
      if (actorsLink) {
        const aux = actorsLink.split('/');
        this.actorId = aux.pop();
        if (!this.actorId) {
          this.actorId = aux.pop();
        }
        actorsTab.count = 1;
      }
      this.updateTab(actorsTab);

      if (tools) {
        const tab: Partial<ITabsItem> = {
          id: CampaignsTabs.TOOL,
          loading: false,
          count: tools.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (cves) {
        const tab: Partial<ITabsItem> = {
          id: CampaignsTabs.CVE,
          loading: false,
          count: cves.meta.count || 0
        };
        this.updateTab(tab);
      }
    }
  }

  private createEntries({ first_seen, last_seen, tlp }) {
    const firstSeen = first_seen ? moment(first_seen).format('DD/MM/YYYY') : '-';
    const lastSeen = last_seen ? moment(last_seen).format('DD/MM/YYYY') : '-';
    this.entries = [];
    this.entries.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
    this.entries.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: tlp });
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: CampaignsTabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Indicators',
        id: CampaignsTabs.CONTEXT,
        icon: 'icon-newspaper',
        loading: true,
        count: 0
      },
      {
        title: 'Threat Actors',
        id: CampaignsTabs.ACTORS,
        icon: 'icon-users',
        loading: true,
        count: 0
      },
      {
        title: 'Tools',
        id: CampaignsTabs.TOOL,
        icon: 'icon-wrench',
        loading: true,
        count: 0
      },
      {
        title: 'CVE',
        id: CampaignsTabs.CVE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Attack Patterns',
        id: CampaignsTabs.ATTACK_PATTERN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Signatures',
        id: CampaignsTabs.SIGNATURES,
        icon: 'icon-server',
        loading: true,
        count: 0
      }
    ];
    this.onTabChange(this.tabs[0].id);
  }

  private extractCsvData(data) {
    const { attributes, relationships } = data;

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      NAME: attributes.name,
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      DESCRIPTION: attributes.description,
      IOCS_HASHES: relationships.malware ? relationships.malware.meta.count : 0,
      IOCS_IPS: relationships.ips ? relationships.ips.meta.count : 0,
      IOCS_FQDNS: relationships.fqdns ? relationships.fqdns.meta.count : 0,
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      TOOLS: relationships.tools ? relationships.tools.meta.count : 0,
      CVES: relationships.cves ? relationships.cves.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      ATTACK_PATTERNS: relationships.attack_patterns ? relationships.attack_patterns.meta.count : 0
    };
  }
}
