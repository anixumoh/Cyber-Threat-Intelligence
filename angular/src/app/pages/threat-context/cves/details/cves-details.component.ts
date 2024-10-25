import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from 'app/services/resources.service';
import { SvelteService } from 'app/services/svelte.service';
import * as moment from 'moment';
import { Subject, of as observableOf } from 'rxjs';
import { finalize, take, takeUntil } from 'rxjs/operators';
import { CvesService } from '../../../../core/models/cves.service';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import {
  getMentionsCategoryLabel,
  mentionsCategoriesKeys
} from '../../../../shared/components/details-tabs/mentions-list/mentions-categories-keys';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';

enum CVETabs {
  MALWARE,
  DESCRIPTION,
  ATTACK_PATTERN,
  SIGNATURE,
  MENTION,
  ACTORS,
  CAMPAIGN,
  TOOL
}

@Component({
  selector: 'app-cves-details',
  templateUrl: './cves-details.component.html',
  styleUrls: ['./cves-details.component.scss']
})
export class CvesDetailsComponent implements OnInit, OnDestroy {
  @Input() cve;
  @Input() resourceid;
  @Input() fromexplorer;
  @Input() contracted = true;
  @Input() moduleid;
  @Input() filterparams;

  @Output() closeModal = new EventEmitter();
  @Output() cveIsRead = new EventEmitter();

  id;
  name = '';
  path = '';
  risk;
  item: any = {};
  activeModule;
  activeOrganization;
  loading = false;
  tabs = [];
  entries = [];
  canStartToLoadContext = false;
  canStartToLoadDescription = false;
  canStartToLoadAttackPatterns = false;
  canStartToLoadSignatures = false;
  canStartToLoadMentions = false;
  canStartToLoadActors = false;
  canStartToLoadCampaigns = false;
  canStartToLoadTools = false;
  activeTab;
  cveTabs = CVETabs;
  description;
  cvssV2Collapsed = true;
  cvssV3Collapsed = true;
  mentionsCollapsed = true;
  forattedCvssV2: string;
  forattedCvssV3: string;
  msBulletins: any = [];
  darkWebModuleId;
  mentionsCount = 0;
  mentionsCategories = [];
  mentionsCategoriesKeys = mentionsCategoriesKeys;
  mentionsFilterBy = [];
  v2Score = '';
  v3Score = '';
  backendData;
  closeModalSubscribers;
  loadNewCVEElementsToArray;
  currentPage = 1;
  explorerResourcesList = [];
  selectedResource: { id: number; labels: any[] };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private cvesService: CvesService,
    private resourcesService: ResourcesService,
    private svelteService: SvelteService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  async ngOnInit() {
    await this.loadCVE();
  }
  async loadCVE(cveToLoad = null) {
    this.id = cveToLoad ? cveToLoad.cve : this.route.snapshot.paramMap.get('cveId') ?? this.cve;
    this.fromexplorer = this.route.snapshot.queryParams['fromExplorer'] ?? this.fromexplorer;
    if (cveToLoad) this.resourceid = cveToLoad.id;

    this.startTab();
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
        this.setDarkWebModuleId();
      });

    this.contracted ? this.getThiappDetails(this.id) : this.getApiDetails(this.resourceid);
    this.prepareFilterParams();
    //if its the first time we open a CVE or we are currenctly in the last CVE of the list
    if ((cveToLoad == null && this.fromexplorer) || this.verifyIfCurrentCVEIsLastInList()) {
      await this.loadNavigationCVEs(true);
    }
    if (cveToLoad) {
      this.cveIsRead.emit(this.resourceid);
    }

    this.getSelectedExplorerResource();
  }

  getSelectedExplorerResource() {
    this.selectedResource = this.explorerResourcesList.find((r) => r.cve === this.id);
  }

  openEditLabels() {
    const moduleId = this.moduleid | this.route.snapshot.queryParams['explorerId'];
    this.svelteService.safeSendEvent('open-cve-edit-labels', { cve: this.selectedResource, moduleId });
  }

  @HostListener('document:cve-reload', ['$event'])
  async onSendToken(event: CustomEvent) {
    await this.loadNavigationCVEs(true);
    this.getSelectedExplorerResource()
  }

  verifyIfCurrentCVEIsLastInList() {
    // Get the id from the route parameters or the default resource id
    const id = this.route.snapshot.queryParams['selectedcveid'] || this.resourceid;
    // Check if the last item in the list is the same from the current id, means we are out of elements to scroll
    if (this.resourcesService.CVE_Navigation.list[this.resourcesService.CVE_Navigation.list.length - 1].id == id) {
      return true;
    }
    return false;
  }
  async loadNavigationCVEs(replaceListInStore: boolean) {
    const moduleId = this.moduleid | this.route.snapshot.queryParams['explorerId'];
    const response = await this.resourcesService
      .getExplorerResources(this.organizationService.currentOrganizationId, moduleId, {
        ...this.filterparams,
        page: this.currentPage
      })
      .pipe(takeUntil(this.destroy$))
      .toPromise();
    this.explorerResourcesList = response.list;
    this.resourcesService.setNavigableCVEsData(response.list, this.loadNewCVEElementsToArray, replaceListInStore);
    this.loadNewCVEElementsToArray = false;
    if (this.verifyIfCurrentCVEIsLastInList()) {
      this.increasePageNumberBy1();
      this.loadNewCVEElementsToArray = true;
      this.loadNavigationCVEs(false);
    }
  }
  increasePageNumberBy1() {
    this.currentPage += 1;
  }
  prepareFilterParams() {
    if (!this.filterparams) {
      const read = this.route.snapshot.queryParams['read'];
      const since = this.route.snapshot.queryParams['since'];
      const to = this.route.snapshot.queryParams['to'];
      const sortDirection = this.route.snapshot.queryParams['sortDirection'];
      const excludeLabels = this.route.snapshot.queryParams['excludeLabels'];
      const labels = this.route.snapshot.queryParams['labels'];
      const labelsAnd = this.route.snapshot.queryParams['labelsAnd'];
      const maxRows = this.route.snapshot.queryParams['maxRows'];
      const page = this.route.snapshot.queryParams['p'];
      const priority = this.route.snapshot.queryParams['selectedRisk'];
      const terms = this.route.snapshot.queryParams['selectedTerms'];
      const startScore = this.route.snapshot.queryParams['startScore'];
      const endScore = this.route.snapshot.queryParams['endScore'];
      const q = this.route.snapshot.queryParams['q'];
      this.filterparams = {
        excludeLabels,
        labels,
        labelsAnd,
        maxRows,
        page,
        read,
        priority,
        terms,
        sortDirection,
        startScore,
        endScore,
        since,
        to,
        q
      };
    }
    this.currentPage = JSON.parse(JSON.stringify(this.filterparams)).page;
  }

  previousCVEClick() {
    const targetIndex = this.resourcesService.CVE_Navigation.list.findIndex((a) =>
      this.contracted ? a.cve == this.item.id : a.id == this.item.id
    );
    const prevElement = targetIndex !== -1 && this.resourcesService.CVE_Navigation.list[targetIndex - 1];
    if (prevElement) this.loadCVE(prevElement);
  }
  nextCVEClick() {
    const targetIndex = this.resourcesService.CVE_Navigation.list.findIndex((a) =>
      this.contracted ? a.cve == this.item.id : a.id == this.item.id
    );
    const nextElement = targetIndex !== -1 && this.resourcesService.CVE_Navigation.list[targetIndex + 1];
    if (nextElement) this.loadCVE(nextElement);
  }
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  actorsListSource = (params) => this.cvesService.getRelations({ id: this.id, relation: 'threat-actor', params });
  toolsListSource = (params) => this.cvesService.getRelations({ id: this.id, relation: 'tool', params });
  campaingsListSource = (params) => this.cvesService.getRelations({ id: this.id, relation: 'campaign', params });

  attackPatternsSource = (params) => {
    const attackPattern = this.tabs.find((item) => item.id === CVETabs.ATTACK_PATTERN);
    if (attackPattern.count > 0) {
      return this.cvesService.getRelations({
        id: this.id,
        relation: 'attack-pattern',
        params
      });
    }
    return observableOf({ data: [] });
  };
  signatureSource = (params) => {
    const signature = this.tabs.find((item) => item.id === CVETabs.SIGNATURE);
    if (signature.count > 0) {
      return this.cvesService.getRelations({ id: this.id, relation: 'signature', params });
    }
    return observableOf({ data: [] });
  };
  iocSource = (params) => this.cvesService.getRelations({ id: this.id, relation: 'ioc', params });
  mentionSource = (params) => this.cvesService.getRelations({ id: this.id, relation: 'mention', params });

  goToMentions(mention) {
    this.mentionsFilterBy = [mention.key];
    this.onTabChange(CVETabs.MENTION);
  }

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
      exportClientFile(convertToCSV([csvInfo]), 'cve-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      exportClientFile(JSON.stringify(this.backendData), 'cve-details', 'json');
    }
  }

  backToList() {
    const { dork } = this.route.snapshot.queryParams;
    this.router.navigate(
      [`/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/cves`],
      { queryParams: { dork } }
    );
  }

  backToThreats() {
    if (!this.contracted) {
      this.closeModal.emit();
    } else {
      const id = this.route.snapshot.queryParams['explorerId'];
      this.router.navigate([`/dashboard/organizations/${this.activeOrganization.id}/modules/${id}/cve`]);
    }
  }

  onTabChange(tabId) {
    this.activeTab = tabId;
    switch (tabId) {
      case CVETabs.MALWARE:
        this.canStartToLoadContext = true;
        break;
      case CVETabs.DESCRIPTION:
        this.canStartToLoadDescription = true;
        break;
      case CVETabs.ATTACK_PATTERN:
        this.canStartToLoadAttackPatterns = true;
        break;
      case CVETabs.ACTORS:
        this.canStartToLoadActors = true;
        break;
      case CVETabs.CAMPAIGN:
        this.canStartToLoadCampaigns = true;
        break;
      case CVETabs.TOOL:
        this.canStartToLoadTools = true;
        break;
      case CVETabs.SIGNATURE:
        this.canStartToLoadSignatures = true;
        break;
      case CVETabs.MENTION:
        this.canStartToLoadMentions = true;
        break;
    }
  }

  private getThiappDetails(id) {
    this.loading = true;
    this.cvesService
      .details({ id })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }: any) => {
        if (data && data.attributes) {
          this.backendData = data;
          this.item = { id, ...data.attributes, relationships: data.relationships };
          this.path = `cves/${id}`;
          this.name = this.item.name;
          let score = data.attributes.bl_score;
          score = score && score > 0 ? score : 0;
          this.risk = { score };
          this.forattedCvssV2 = this.formatCVSSV2(this.item);
          this.forattedCvssV3 = this.formatCVSSV3(this.item);
          this.msBulletins = this.formatMicrosoftBulletins(this.item.microsoft_bulletins);
          this.createEntries(this.item);
          this.processRelationships(data.relationships);
        }
      });
  }

  private getApiDetails(id) {
    this.loading = true;

    this.cvesService
      .getApiDetails(this.activeOrganization.id, this.moduleid || this.activeModule.id, id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        const data = response.data;
        this.loading = false;
        this.backendData = data;
        this.item = { id, ...data.attributes, relationships: data.relationships };
        let score = data.attributes.bl_score;
        score = score && score > 0 ? score : 0;
        this.risk = { score };
        this.forattedCvssV2 = this.formatCVSSV2(this.item);
        this.forattedCvssV3 = this.formatCVSSV3(this.item);
        this.createEntries(this.item);
        this.processRelationships(data.relationships);
      });
  }

  private processRelationships(relationships) {
    if (relationships) {
      const { attack_patterns, signatures, mentions, malware, campaigns, threat_actors, tools } = relationships;
      if (attack_patterns) {
        const tab: Partial<ITabsItem> = {
          id: CVETabs.ATTACK_PATTERN,
          loading: false,
          count: attack_patterns.meta.count || 0
        };
        this.updateTab(tab);
      }

      const campaignsCount = campaigns ? campaigns.meta.count || 0 : 0;
      const campaignsTab: Partial<ITabsItem> = {
        id: CVETabs.CAMPAIGN,
        loading: false,
        count: campaignsCount
      };
      this.updateTab(campaignsTab);

      const actorsCount = threat_actors ? threat_actors.meta.count || 0 : 0;
      const actorsTab: Partial<ITabsItem> = {
        id: CVETabs.ACTORS,
        loading: false,
        count: actorsCount
      };
      this.updateTab(actorsTab);

      const toolsCount = tools ? tools.meta.count || 0 : 0;
      const toolsTab: Partial<ITabsItem> = {
        id: CVETabs.TOOL,
        loading: false,
        count: toolsCount
      };
      this.updateTab(toolsTab);

      if (malware) {
        const tab: Partial<ITabsItem> = {
          id: CVETabs.MALWARE,
          loading: false,
          count: malware.meta.count || 0
        };
        this.updateTab(tab);
      }

      if (signatures) {
        const tab: Partial<ITabsItem> = {
          id: CVETabs.SIGNATURE,
          loading: false,
          count: signatures.meta.count || 0
        };
        this.updateTab(tab);
      }

      const mentionsCount = mentions ? mentions.meta.count || 0 : 0;
      this.mentionsCount = mentionsCount;
      const mentionsTab: Partial<ITabsItem> = {
        id: CVETabs.MENTION,
        loading: false,
        count: mentionsCount
      };
      this.updateTab(mentionsTab);
      if (this.contracted && this.mentionsCount > 0) {
        this.getMentionsCategories();
      }
    }
  }

  private createEntries({ name, published_at }) {
    const publishedDate = published_at ? moment(published_at).format('DD/MM/YYYY') : '-';
    this.entries = [];
    this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'Name', value: name || '-' });
    this.entries.push({ icon: 'icon-calendar bg-primary', title: 'PUBLICATION DATE', value: publishedDate });
  }

  async getMentionsCategories() {
    this.mentionsCategories = [];
    for (const item of this.mentionsCategoriesKeys) {
      const params = { page: 0, limit: 1, filterValue: item, filterField: 'feed_source_category' };
      const response = await this.cvesService
        .getRelations({ id: this.id, relation: 'mention', params })
        .pipe(takeUntil(this.destroy$), take(1))
        .toPromise();

      if (response && response.meta && response.meta.pagination.count > 0) {
        const aux = {
          key: item,
          label: getMentionsCategoryLabel(item),
          value: response.meta.pagination.count
        };
        this.mentionsCategories = this.insertSorted(aux, this.mentionsCategories);
      }
    }
  }

  private insertSorted(insertedObject, arr) {
    let isLast = true;
    if (arr.length === 0) {
      arr.push(insertedObject);
    } else {
      for (let i = 0, len = arr.length; i < len; i++) {
        if (insertedObject.key < arr[i].key) {
          isLast = false;
          arr.splice(i, 0, insertedObject);
          break;
        }
      }
      if (isLast) {
        arr.push(insertedObject);
      }
    }
    return arr;
  }

  private startTab() {
    this.tabs = [
      {
        title: 'Description',
        id: CVETabs.DESCRIPTION,
        icon: 'icon-hashtag'
      },
      {
        title: 'Malware',
        id: CVETabs.MALWARE,
        icon: 'icon-bug',
        loading: true,
        count: 0
      },
      {
        title: 'Threat Actors',
        id: CVETabs.ACTORS,
        icon: 'icon-users',
        loading: true,
        count: 0
      },
      {
        title: 'Campaigns',
        id: CVETabs.CAMPAIGN,
        icon: 'icon-bullhorn',
        loading: true,
        count: 0
      },
      {
        title: 'Tools',
        id: CVETabs.TOOL,
        icon: 'icon-wrench',
        loading: true,
        count: 0
      },
      {
        title: 'Attack Patterns',
        id: CVETabs.ATTACK_PATTERN,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Signatures',
        id: CVETabs.SIGNATURE,
        icon: 'icon-server',
        loading: true,
        count: 0
      },
      {
        title: 'Mentions',
        id: CVETabs.MENTION,
        icon: 'icon-comments',
        loading: true,
        count: 0
      }
    ];
    this.onTabChange(this.tabs[0].id);
  }

  private getScoreMarkup(cvss) {
    if (cvss && cvss['baseScore']) {
      return `${cvss['baseScore']}/10`;
    } else {
      return '<span>N/A</span>';
    }
  }

  private formatCVSSV3(item) {
    const cvss = item.cvss.v3;
    if (!cvss) {
      return '';
    }
    this.v3Score = this.getScoreMarkup(cvss);
    let result = '<ul class="list-group">';
    result += `<li class="list-group-item pt-1 pb-1">Base Score: ${this.v3Score} </li>`;
    result +=
      '<li class="list-group-item pt-1 pb-1">Base Severity: ' + this.colorMetric(cvss['baseSeverity']) + '</li>';
    result += '<li class="list-group-item pt-1 pb-1">Vector String: ' + cvss['vectorString'] + '</li>';
    result += '<li class="list-group-item pt-1 pb-1">Attack Vector: ' + cvss['attackVector'] + '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Attack complexity: ' +
      this.colorMetric(cvss['attackComplexity'], true) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Privileges required: ' +
      this.colorMetric(cvss['privilegesRequired'], true) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">User Interaction: ' +
      this.colorMetric(cvss['userInteraction'], true) +
      '</li>';
    result += '<li class="list-group-item pt-1 pb-1">Scope: ' + this.colorMetric(cvss['scope']) + '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Confidentiality Impact: ' +
      this.colorMetric(cvss['confidentialityImpact']) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Integrity Impact: ' + this.colorMetric(cvss['integrityImpact']) + '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Availability Impact: ' +
      this.colorMetric(cvss['availabilityImpact']) +
      '</li>';
    result += '</ul>';
    return result;
  }

  private formatCVSSV2(item) {
    const cvss = item.cvss.v2;
    if (!cvss) {
      return '';
    }
    this.v2Score = this.getScoreMarkup(cvss);
    let result = '<ul class="list-group">';
    result += `<li class="list-group-item pt-1 pb-1">Base Score: ${this.v2Score} </li>`;
    result += '<li class="list-group-item pt-1 pb-1">Vector String: ' + cvss['vectorString'] + '</li>';
    result += '<li class="list-group-item pt-1 pb-1">Access Vector: ' + cvss['accessVector'] + '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Access complexity: ' +
      this.colorMetric(cvss['accessComplexity'], true) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Authentication: ' +
      this.colorMetric(cvss['authentication'], true) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Confidentiality Impact: ' +
      this.colorMetric(cvss['confidentialityImpact']) +
      '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Integrity Impact: ' + this.colorMetric(cvss['integrityImpact']) + '</li>';
    result +=
      '<li class="list-group-item pt-1 pb-1">Availability Impact: ' +
      this.colorMetric(cvss['availabilityImpact']) +
      '</li>';
    result += '</ul>';
    return result;
  }

  private formatMicrosoftBulletins(microsoftBulletins) {
    const bulletins = [];
    for (const bulletin of microsoftBulletins) {
      const conf = {
        collapsed: true,
        name: bulletin.hasOwnProperty('name') ? bulletin.name : bulletin.title,
        formatted: this.formatMicrosoftBulletin(bulletin)
      };
      bulletins.push(conf);
    }
    return bulletins;
  }

  private formatMicrosoftBulletin(buletin) {
    let result = '<ul>';
    result += '<li>Impact: ' + buletin['impact'] + '</li>';
    result += '<li>Severity: ' + buletin['severity'] + '</li>';
    if (buletin.hasOwnProperty('bulletin_id')) {
      result +=
        '<li><a href="https://technet.microsoft.com/en-us/library/security/' +
        buletin['bulletin_id'] +
        '" target="_blank">Bulletin link</a></li>';
    }
    if (buletin.hasOwnProperty('cves_url')) {
      result += '<li><a href="' + buletin['cves_url'] + '" target="_blank">CVE link</a></li>';
    }
    if (buletin.hasOwnProperty('knowledgebase_id')) {
      result +=
        '<li><a href="https://support.microsoft.com/en-us/kb/' +
        buletin['knowledgebase_id'] +
        '" target="_blank">Knowledgebase link</a></li>';
    }
    result += '</ul>';
    return result;
  }

  private colorMetric(metric: string, inversed = false) {
    const successMetrics = ['NONE', 'LOW', 'SINGLE'];
    const dangerMetrics = ['HIGH', 'REQUIRED', 'COMPLETE', 'MULTIPLE'];
    if ((!inversed && dangerMetrics.includes(metric)) || (inversed && successMetrics.includes(metric))) {
      return '<span class="text-danger">' + metric + '</span>';
    }
    if (dangerMetrics.includes(metric) || successMetrics.includes(metric)) {
      return '<span class="text-success">' + metric + '</span>';
    }
    return metric;
  }

  private setDarkWebModuleId() {
    this.darkWebModuleId = null;
    this.organizationService
      .getModules(this.activeOrganization.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        for (const mod of res) {
          if (mod.type === 'DARK_WEB') {
            this.darkWebModuleId = mod.id;
            break;
          }
        }
      });
  }

  private extractCsvData(data) {
    const { attributes, relationships } = data;
    let references = (attributes.references || []).map((item) => (typeof item === 'string' ? item : item.url || ' '));
    references = [...new Set(references)];
    references = references.join(', ');

    return {
      TYPE: data.type || ' ',
      NAME: attributes.name,
      PUBLICATION_DATE: moment(attributes.published_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      UPDATED_AT: moment(attributes.updated_at, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      BLUELIV_SCORE: attributes.bl_score ? attributes.bl_score : 'N/A',
      CVSS_V2_SCORE: attributes.cvss.v2 ? attributes.cvss.v2.baseScore : 0,
      CVSS_V3_SCORE: attributes.cvss.v3 ? attributes.cvss.v3.baseScore : 0,
      DESCRIPTION: attributes.description || ' ',
      REFERENCES: references,
      EXPLOITS: (attributes.exploits || []).length || 0,
      PLATFORMS: (attributes.platforms || []).length || 0,
      MALWARE: relationships.malware ? relationships.malware.meta.count : 0,
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      TOOLS: relationships.tools ? relationships.tools.meta.count : 0,
      ATTACK_PATTERNS: relationships.attack_patterns ? relationships.attack_patterns.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      MENTIONS: relationships.mentions ? relationships.mentions.meta.count : 0
    };
  }
}
