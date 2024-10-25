import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import * as moment from 'moment';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import { SignaturesService } from '../../../../core/models/signatures.service';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';

enum SignaturesTabs {
  DESCRIPTION = 1,
  ACTORS,
  CAMPAIGN = 3,
  TOOL = 4,
  ATTACK_PATTERN = 5,
  CVE = 6
}

@Component({
  selector: 'app-signatures-details',
  templateUrl: './signatures-details.component.html',
  styleUrls: ['./signatures-details.component.scss']
})
export class SignaturesDetailsComponent implements OnInit, OnDestroy {
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
  canStartToLoadActors = false;
  canStartToLoadCVE = false;
  canStartToLoadAttackPatterns = false;
  canStartToLoadCampaigns = false;
  canStartToLoadTools = false;
  activeTab;
  signaturesTabs = SignaturesTabs;
  description;
  backendData;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private signaturesService: SignaturesService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.id = this.route.snapshot.paramMap.get('signatureId');
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

  actorsListSource = (params) => this.signaturesService.getRelations({ id: this.id, relation: 'threat-actor', params });
  toolsListSource = (params) => this.signaturesService.getRelations({ id: this.id, relation: 'tool', params });
  campaingsListSource = (params) => this.signaturesService.getRelations({ id: this.id, relation: 'campaign', params });
  cveListSource = (params) => this.signaturesService.getRelations({ id: this.id, relation: 'cve', params });
  attackPatternsSource = (params) =>
    this.signaturesService.getRelations({ id: this.id, relation: 'attack-pattern', params });

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
      [
        `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/signatures`
      ],
      { queryParams: { dork } }
    );
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData);
      exportClientFile(convertToCSV([csvInfo]), 'signature-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'signature-details', 'json');
    }
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case SignaturesTabs.ACTORS:
        this.canStartToLoadActors = true;
        break;
      case SignaturesTabs.CVE:
        this.canStartToLoadCVE = true;
        break;
      case SignaturesTabs.CAMPAIGN:
        this.canStartToLoadCampaigns = true;
        break;
      case SignaturesTabs.ATTACK_PATTERN:
        this.canStartToLoadAttackPatterns = true;
        break;
      case SignaturesTabs.TOOL:
        this.canStartToLoadTools = true;
        break;
    }
  }

  private getDetails(id) {
    this.loading = true;
    this.signaturesService
      .details({ id })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }: any) => {
        if (data && data.attributes) {
          this.backendData = data;
          const { name, signature, references, ...rest } = data.attributes;
          this.name = name;
          this.path = `signatures/${id}`;
          this.item = { ...rest, id, name, relationships: data.relationships };
          this.description = { signature, references };
          this.createEntries(rest);
          this.processRelationships(data.relationships);
        }
      });
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { threat_actors, attack_patterns, tools, cves, campaigns } = relationships;
      if (attack_patterns) {
        const tab: Partial<ITabsItem> = {
          id: SignaturesTabs.ATTACK_PATTERN,
          loading: false,
          count: attack_patterns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (campaigns) {
        const tab: Partial<ITabsItem> = {
          id: SignaturesTabs.CAMPAIGN,
          loading: false,
          count: campaigns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (threat_actors) {
        const tab: Partial<ITabsItem> = {
          id: SignaturesTabs.ACTORS,
          loading: false,
          count: threat_actors.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (tools) {
        const tab: Partial<ITabsItem> = {
          id: SignaturesTabs.TOOL,
          loading: false,
          count: tools.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (cves) {
        const tab: Partial<ITabsItem> = {
          id: SignaturesTabs.CVE,
          loading: false,
          count: cves.meta.count || 0
        };
        this.updateTab(tab);
      }
    }
  }

  private createEntries({ type, sid, version, tlp }) {
    this.entries = [];
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'Type', value: type || '-' });
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: tlp });
    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'SID', value: sid || '-' });
    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'Version', value: version || '-' });
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: SignaturesTabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Threat Actors',
        id: SignaturesTabs.ACTORS,
        icon: 'icon-users',
        loading: true,
        count: 0
      },
      {
        title: 'Campaigns',
        id: SignaturesTabs.CAMPAIGN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Tools',
        id: SignaturesTabs.TOOL,
        icon: 'icon-wrench',
        loading: true,
        count: 0
      },
      {
        title: 'Attack Patterns',
        id: SignaturesTabs.ATTACK_PATTERN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'CVE',
        id: SignaturesTabs.CVE,
        icon: 'icon-server',
        loading: true,
        count: 0
      }
    ];
    this.onTabChange(this.tabs[0].id);
  }

  private extractCsvData(data) {
    const { attributes, relationships } = data;
    const references = (attributes.references || [])
      .map((item) => (typeof item === 'string' ? item : item.link || ' '))
      .join(', ');

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      NAME: attributes.name,
      SIGNATURE_TYPE: attributes.type || ' ',
      CREATED_AT: moment(attributes.created_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      SID: attributes.sid || ' ',
      VERSION: attributes.version || ' ',
      PURPOSE: attributes.purpose || ' ',
      SIGNATURE: attributes.signature || ' ',
      REFERENCES: references,
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      TOOLS: relationships.tools ? relationships.tools.meta.count : 0,
      ATTACK_PATTERNS: relationships.attack_patterns ? relationships.attack_patterns.meta.count : 0,
      CVES: relationships.cves ? relationships.cves.meta.count : 0
    };
  }
}
