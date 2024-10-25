import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, finalize, map, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import {
  convertNumberToNumberWithK,
  convertToCSV,
  exportClientFile,
  proccesLinkToUpdateRedirection
} from '../../../../utils/functions';
import { DomSanitizer } from '@angular/platform-browser';
import { AttackPatternsService } from '../../../../core/models/attack-patterns.service';
import { MalwaresService } from '../../../../core/models/malwares.service';

enum tabs {
  DESCRIPTION,
  MALWARE,
  ACTORS,
  CAMPAIGNS,
  CVE,
  SIGNATURES
}

@Component({
  selector: 'app-tools-details',
  templateUrl: './attack-patterns-details.component.html',
  styleUrls: ['./attack-patterns-details.component.scss']
})
export class AttackPatternsDetailsComponent implements OnInit {
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
  canStartToLoadCampaigns = false;
  canStartToLoadCVE = false;
  canStartToLoadSignatures = false;
  activeTab;
  attackPatternsTabs = tabs;
  description;
  prerequisites = [];
  attackerSkillsOrKnowledgeRequired = [];
  attackPhases = [];
  solutionsAndMitigations = [];
  actorId;
  references = [];
  backendData;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private attackPatternsService: AttackPatternsService,
    private malwaresService: MalwaresService,
    protected sanitizer: DomSanitizer
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.id = this.route.snapshot.paramMap.get('attackPatternsId');
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

  malwareSource = (params) =>
    this.malwaresService.fullList({ ...params, ...{ dork: `ioa.attack_patterns.name.keyword:"${this.name}"` } }).pipe(
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
          id: tabs.MALWARE,
          loading: false,
          count
        };
        this.updateTab(tab);
        return result;
      }),
      finalize(() => {
        const tab: Partial<ITabsItem> = {
          id: tabs.MALWARE,
          loading: false
        };
        this.updateTab(tab);
      })
    );
  actorsListSource = (params) =>
    this.attackPatternsService.getRelations({ id: this.id, relation: 'threat-actor', params });
  signaturesListSource = (params) =>
    this.attackPatternsService.getRelations({ id: this.id, relation: 'signature', params });
  cveListSource = (params) => this.attackPatternsService.getRelations({ id: this.id, relation: 'cve', params });
  campaignsSource = (params) => this.attackPatternsService.getRelations({ id: this.id, relation: 'campaign', params });

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
        `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/attack-patterns`
      ],
      { queryParams: { dork } }
    );
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData);
      exportClientFile(convertToCSV([csvInfo]), 'attack-pattern-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'attack-pattern-details', 'json');
    }
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case tabs.ACTORS:
        this.canStartToLoadActors = true;
        break;
      case tabs.CVE:
        this.canStartToLoadCVE = true;
        break;
      case tabs.SIGNATURES:
        this.canStartToLoadSignatures = true;
        break;
      case tabs.CAMPAIGNS:
        this.canStartToLoadCampaigns = true;
        break;
    }
  }

  private getDetails(id) {
    this.loading = true;
    this.attackPatternsService
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
          this.path = `attack-patterns/${id}`;
          this.item = { ...rest, id, name, relationships: data.relationships };
          this.showMalwareTab(!rest.capec_id);
          this.references = references || [];
          this.prerequisites = this.item.prerequisites || [];
          this.attackerSkillsOrKnowledgeRequired = this.item.attacker_skills_or_knowledge_required || [];
          this.attackPhases = this.item.attack_phases || [];
          this.solutionsAndMitigations = this.item.solutions_and_mitigations || [];
          this.description = this.buildDescription(description);
          this.createEntries({ name, ...rest });
          this.processRelationships(data.relationships);
        }
      });
  }

  private showMalwareTab(isATTCK) {
    if (isATTCK) {
      const tab = {
        title: 'Malware',
        id: tabs.MALWARE,
        icon: 'icon-bug',
        loading: true,
        count: 0
      };
      this.tabs.splice(1, 0, tab);
    }
  }

  private buildDescription(description) {
    return proccesLinkToUpdateRedirection(description, this.activeModule.id, this.activeOrganization.id);
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { threat_actors, campaigns, cves, signatures } = relationships;

      if (campaigns) {
        const tab: Partial<ITabsItem> = {
          id: tabs.CAMPAIGNS,
          loading: false,
          count: campaigns.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (signatures) {
        const tab: Partial<ITabsItem> = {
          id: tabs.SIGNATURES,
          loading: false,
          count: signatures.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (threat_actors) {
        const tab: Partial<ITabsItem> = {
          id: tabs.ACTORS,
          loading: false,
          count: threat_actors.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (cves) {
        const tab: Partial<ITabsItem> = {
          id: tabs.CVE,
          loading: false,
          count: cves.meta.count || 0
        };
        this.updateTab(tab);
      }
    }
  }

  private createEntries({ name, capec_id, purposes, attack_phases, tlp, severity, technique_id }) {
    this.entries = [];
    this.entries2 = [];

    this.entries.push({ icon: 'icon-clock bg-primary', title: 'Name', value: name });
    let attackPhases = [];
    if (attack_phases && Array.isArray(attack_phases)) {
      attackPhases = (attack_phases || []).map((item) => item.name);
    }
    this.entries.push({
      icon: 'icon-clock bg-primary',
      title: 'Attack Phases',
      value: attackPhases && attackPhases.length === 0 ? '-' : attackPhases.join(', ')
    });

    this.entries.push({
      icon: 'icon-code bg-primary',
      title: 'Technique ID',
      value: technique_id
    });
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'Type', value: capec_id ? 'CAPEC' : 'ATT&CK' });

    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'Severity', value: severity || '-' });
    this.entries2.push({
      icon: 'icon-desktop_windows bg-primary',
      title: 'Purpose',
      value: purposes && purposes.length === 0 ? '-' : purposes.join(', ')
    });
    this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: tlp });
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: tabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Threat Actors',
        id: tabs.ACTORS,
        icon: 'icon-users',
        loading: true,
        count: 0
      },
      {
        title: 'Campaigns',
        id: tabs.CAMPAIGNS,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'CVE',
        id: tabs.CVE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Signatures',
        id: tabs.SIGNATURES,
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
    let attackPhases = [];
    if (attributes.attack_phases && Array.isArray(attributes.attack_phases)) {
      attackPhases = (attributes.attack_phases || []).map((item) => item.name);
    }

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      NAME: attributes.name,
      ATTACK_PATTERN_TYPE: attributes.capec_id ? 'CAPEC' : 'ATT&CK',
      ATTACK_PHASES: attackPhases.join(','),
      SEVERITY: attributes.severity,
      PURPOSE: (attributes.purposes || []).join(','),
      DESCRIPTION: attributes.description,
      REFERENCES: references,
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      CVES: relationships.cves ? relationships.cves.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0
    };
  }
}
