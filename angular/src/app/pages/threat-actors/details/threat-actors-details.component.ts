import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';

import * as FileSaver from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

import { ActorsService } from '../../../core/models/actors.service';
import { OrganizationService } from '../../../dashboard/organization/organization.service';
import { IFlushListItem } from '../../../shared/components/flush-list/flush-list.component';
import { ITabsItem } from '../../../shared/components/tabs/tabs.component';
import { convertToCSV, exportClientFile, proccesLinkToUpdateRedirection } from '../../../utils/functions';

enum ActorsTabs {
  CONTEXT = 1,
  DESCRIPTION = 2,
  CAMPAIGN = 3,
  ATTACK_PATTERN = 4,
  SIGNATURE = 5,
  TOOL = 6,
  TARGETS = 7,
  CVE
}

@Component({
  selector: 'app-threat-actors-details',
  templateUrl: './threat-actors-details.component.html',
  styleUrls: ['./threat-actors-details.component.scss']
})
export class ThreatActorsDetailsComponent implements OnInit, OnDestroy {
  id;
  name = '';
  path = '';
  item;
  activeModule;
  activeOrganization;
  loading = false;
  ActorsTabs = ActorsTabs;
  entries: IFlushListItem[] = [];
  entries2: IFlushListItem[] = [];
  tabs: ITabsItem[] = [];
  canStartToLoadTarget = false;
  canStartToLoadIOC = false;
  canStartToLoadSignatures = false;
  canStartToLoadAttackPatterns = false;
  canStartToLoadCampaigns = false;
  canStartToLoadTools = false;
  canStartToLoadCVEs = false;
  activeTab;
  backendData;
  loadingReport = false;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actorsService: ActorsService,
    private organizationService: OrganizationService,
    private toastrService: ToastrService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.id = this.route.snapshot.params['actorId'];
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

  cveListSource = (params) => this.actorsService.getRelations({ id: this.id, relation: 'cve', params });
  toolsListSource = (params) => this.actorsService.getRelations({ id: this.id, relation: 'tool', params });
  signaturesListSource = (params) => this.actorsService.getRelations({ id: this.id, relation: 'signature', params });
  iocSource = (params) => this.actorsService.getRelations({ id: this.id, relation: 'ioc', params });
  campaingsListSource = (params) => this.actorsService.getRelations({ id: this.id, relation: 'campaign', params });
  attackPatternsSource = (params) =>
    this.actorsService.getRelations({ id: this.id, relation: 'attack-pattern', params });

  backToList() {
    const { dork } = this.route.snapshot.queryParams;
    this.router.navigate(
      [`/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/actors`],
      { queryParams: { dork } }
    );
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData);
      exportClientFile(convertToCSV([csvInfo]), 'threat-actor-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'threat-actor-details', 'json');
    }
  }

  onTargetTabChange({ isLoading, length }) {
    const tab: Partial<ITabsItem> = { id: ActorsTabs.TARGETS };
    if (typeof length !== 'undefined') {
      tab.count = length;
    }
    if (typeof isLoading !== 'undefined') {
      tab.loading = isLoading;
    }
    this.updateTab(tab);
  }

  updateTab(tabData) {
    this.tabs = this.tabs.map((tab) => {
      if (tab.id === tabData.id) {
        return { ...tab, ...tabData };
      }
      return tab;
    });
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case ActorsTabs.CONTEXT:
        this.canStartToLoadIOC = true;
        break;
      case ActorsTabs.TARGETS:
        this.canStartToLoadTarget = true;
        break;
      case ActorsTabs.SIGNATURE:
        this.canStartToLoadSignatures = true;
        break;
      case ActorsTabs.CAMPAIGN:
        this.canStartToLoadCampaigns = true;
        break;
      case ActorsTabs.ATTACK_PATTERN:
        this.canStartToLoadAttackPatterns = true;
        break;
      case ActorsTabs.TOOL:
        this.canStartToLoadTools = true;
        break;
      case ActorsTabs.CVE:
        this.canStartToLoadCVEs = true;
        break;
    }
  }

  getDetails(id) {
    this.loading = true;
    this.actorsService
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
          const descriptionUpdated = proccesLinkToUpdateRedirection(
            description,
            this.activeModule.id,
            this.activeOrganization.id
          );
          this.item = { ...rest, id, name, description: descriptionUpdated, relationships: data.relationships };
          this.path = `actors/${id}`;
          this.createEntries(rest);
          this.processRelationships(data.relationships);
        }
      });
  }

  downloadReport() {
    this.loadingReport = true;
    const body = {
      type: 'ACTOR',
      name: this.name,
      dork: this.item.id
    };

    this.actorsService
      .getReport(this.activeOrganization.id, this.activeModule.id, body)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          this.loadingReport = false;
          if (res && res.error) {
            this.toastrService.error('The reporting server is too busy, please try again later.', 'Error');
            return;
          }

          if ((res && res.status === 204) || res == null) {
            this.toastrService.warning('No data available for this Threat Actor.');
            return;
          }
          const name = this.name.replace(/(-| )/g, '_');
          const filename = `Blueliv_Strategic_Threat_Actor_Report_${name}.pdf`;

          const blob = new Blob([res], {
            type: 'application/octet-stream'
          });
          FileSaver.saveAs(blob, filename);
          this.loadingReport = false;
          this.toastrService.success(`Report generated!`);
        },
        (e) => {
          this.loadingReport = false;
          this.toastrService.error('There was a problem downloading the report', 'Error');
        }
      );
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { targets, attack_patterns, tools, malware, campaigns, signatures, cves, fqdns, ips } = relationships;
      if (targets) {
        const tab: Partial<ITabsItem> = { id: ActorsTabs.TARGETS, loading: false, count: targets.meta.count || 0 };
        this.updateTab(tab);
      }

      if (cves) {
        const tab: Partial<ITabsItem> = { id: ActorsTabs.CVE, loading: false, count: cves.meta.count || 0 };
        this.updateTab(tab);
      }

      if (attack_patterns) {
        const tab: Partial<ITabsItem> = {
          id: ActorsTabs.ATTACK_PATTERN,
          loading: false,
          count: attack_patterns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (campaigns) {
        const tab: Partial<ITabsItem> = {
          id: ActorsTabs.CAMPAIGN,
          loading: false,
          count: campaigns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (signatures) {
        const tab: Partial<ITabsItem> = {
          id: ActorsTabs.SIGNATURE,
          loading: false,
          count: signatures.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (tools) {
        const tab: Partial<ITabsItem> = {
          id: ActorsTabs.TOOL,
          loading: false,
          count: tools.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (malware) {
        const contextCount =
          (malware ? malware.meta.count || 0 : 0) +
          (fqdns ? fqdns.meta.count || 0 : 0) +
          (ips ? ips.meta.count || 0 : 0);
        const tab: Partial<ITabsItem> = {
          id: ActorsTabs.CONTEXT,
          loading: false,
          count: contextCount
        };
        this.updateTab(tab);
      }
    }
  }

  private createEntries({ first_seen, last_seen, country_name, types, sophistication, active, tlp }) {
    const firstSeen = first_seen ? moment(first_seen).format('DD/MM/YYYY') : '-';
    const lastSeen = last_seen ? moment(last_seen).format('DD/MM/YYYY') : '-';
    this.entries = [];
    const country: IFlushListItem = {
      icon: 'icon-desktop_windows bg-primary',
      title: 'Origin',
      value: country_name || '-'
    };
    if (country_name && country_name !== '-') {
      country.link = [
        `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/actors`
      ];
      country.queryParams = { dork: `country:"${country_name}"` };
    }
    this.entries.push(country);
    this.entries.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
    this.entries.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: tlp });

    this.entries2.push({ icon: 'icon-power bg-danger', title: 'Status', value: active ? 'Active' : 'Inactive' });
    this.entries2.push({
      icon: 'icon-desktop_windows bg-primary',
      title: 'Types',
      value: types.join(', ') || '-'
    });
    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'Sophistication', value: sophistication });
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: ActorsTabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Indicators',
        id: ActorsTabs.CONTEXT,
        icon: 'icon-newspaper',
        loading: true,
        count: 0
      },
      {
        title: 'Campaigns',
        id: ActorsTabs.CAMPAIGN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Tools',
        id: ActorsTabs.TOOL,
        icon: 'icon-wrench',
        loading: true,
        count: 0
      },
      {
        title: 'CVEs',
        id: ActorsTabs.CVE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Attack Patterns',
        id: ActorsTabs.ATTACK_PATTERN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Signatures',
        id: ActorsTabs.SIGNATURE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },

      {
        title: 'Targets',
        id: ActorsTabs.TARGETS,
        icon: 'icon-bullseye',
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
      ORIGIN: attributes.country_name || ' ',
      STATUS: attributes.active ? 'Active' : 'Inactive',
      TYPES: (attributes.types || []).join(', '),
      SOPHISTICATION: attributes.sophistication || ' ',
      ALIASES: attributes.aliases || ' ',
      DESCRIPTION: attributes.description,
      OBJECTIVE: attributes.objective || ' ',
      MODUS_OPERANDI: attributes.modus_operandi || ' ',
      REFERENCES: references,
      IOCS_HASHES: relationships.malware ? relationships.malware.meta.count : 0,
      IOCS_IPS: relationships.ips ? relationships.ips.meta.count : 0,
      IOCS_FQDNS: relationships.fqdns ? relationships.fqdns.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      TOOLS: relationships.tools ? relationships.tools.meta.count : 0,
      TARGETS: relationships.targets ? relationships.targets.meta.count : 0,
      CVES: relationships.cves ? relationships.cves.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      ATTACK_PATTERNS: relationships.attack_patterns ? relationships.attack_patterns.meta.count : 0
    };
  }
}
