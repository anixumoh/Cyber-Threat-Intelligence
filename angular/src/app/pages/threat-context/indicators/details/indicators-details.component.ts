import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { take, finalize, takeUntil } from 'rxjs/operators';
import { OrganizationService } from '../../../../dashboard/organization/organization.service';
import { IndicatorsService } from '../../../../core/models/indicators.service';
import { ITabsItem } from '../../../../shared/components/tabs/tabs.component';
import * as moment from 'moment';
import { IFlushListItem } from '../../../../shared/components/flush-list/flush-list.component';
import { IndicatorTypes } from '../Indicator.types';
import { IndicatorsBackendRequestTypes } from '../indicators-backend-request.types';
import { convertToCSV, exportClientFile } from '../../../../utils/functions';

const IndicatorsTabs = {
  CONTEXT: 'Context',
  DNS: 'DNS',
  EXTERNAL: 'External',
  RELATIONS: 'Relations',
  SPARKS: 'Sparks',
  CAMPAIGNS: 'Campaigns',
  ACTORS: 'Actors',
  SIGNATURES: 'Signatures',
  SOURCES: 'Sources'
};

@Component({
  selector: 'app-indicators-details',
  templateUrl: './indicators-details.component.html',
  styleUrls: ['./indicators-details.component.scss']
})
export class IndicatorsDetailsComponent implements OnInit, OnDestroy {
  name = '';
  path = '';
  item;
  risk;
  activeModule;
  activeOrganization;
  loading = false;
  tabs: ITabsItem[] = [];
  entries: IFlushListItem[] = [];
  entries2: IFlushListItem[] = [];
  isCrimeServer = false;
  activeTab;
  canStartToLoadIOC = false;
  canStartToLoadDNS = false;
  canStartToLoadExternal = false;
  canStartToLoadRelations = false;
  canStartToLoadActors = false;
  canStartToLoadCampaigns = false;
  canStartToLoadSources = false;
  canStartToLoadSignatures = false;
  canStartToLoadSparks = false;
  indicatorsTabs = IndicatorsTabs;
  indicatorTypes = IndicatorTypes;
  indicatorId;
  indicatorName;
  indicatorType;
  indicatorTypeName;
  backendData;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private indicatorsService: IndicatorsService,
    private organizationService: OrganizationService
  ) {
    const { indicatorId, indicatorType } = this.route.snapshot.params;
    this.indicatorId = indicatorId;
    this.indicatorType = indicatorType;
    this.indicatorTypeName = indicatorType.replace('-', '');
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit() {
    this.canStartToLoadIOC = true;
    this.buildTabs(this.indicatorType);
    this.organizationService
      .getCurrentContext()
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((context) => {
        this.activeModule = context.currentModule;
        this.activeOrganization = context.currentOrganization;
      });
    this.isCrimeServer = this.indicatorType === IndicatorsBackendRequestTypes.CrimeServer;
    this.getDetails({ id: this.indicatorId, type: this.indicatorType });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  signaturesListSource = (params) =>
    this.indicatorsService.getGenericDetails({
      type: this.indicatorType,
      id: this.indicatorId,
      extension: 'signature',
      params
    });
  actorsListSource = (params) =>
    this.indicatorsService.getGenericDetails({
      type: this.indicatorType,
      id: this.indicatorId,
      extension: 'threat-actor',
      params
    });
  campaingsListSource = (params) =>
    this.indicatorsService.getGenericDetails({
      type: this.indicatorType,
      id: this.indicatorId,
      extension: 'campaign',
      params
    });
  sparksListSource = (params) =>
    this.indicatorsService.getGenericDetails({
      type: this.indicatorType,
      id: this.indicatorId,
      extension: 'spark',
      params
    });

  backToList() {
    const { dork } = this.route.snapshot.queryParams;
    this.router.navigate(
      [
        `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/indicators`
      ],
      { queryParams: { dork } }
    );
  }

  reportMalware() {
    window.open(
      `/dashboard/organizations/${this.activeOrganization.id}/modules/${this.activeModule.id}/threat_context/malwares/${this.name}/summary`,
      '_blank'
    );
  }

  exportToCSV() {
    if (this.backendData) {
      const csvInfo = this.extractCsvData(this.backendData, this.indicatorType);
      exportClientFile(convertToCSV([csvInfo]), 'indicator-details');
    }
  }

  exportToJson() {
    if (this.backendData) {
      const data = this.backendData;
      if (data.type === 'CrimeServer' && data.attributes) {
        delete data.attributes['bots_count'];
        delete data.attributes['credentials_count'];
        delete data.attributes['credit_cards_count'];
        delete data.attributes['service_scans'];
        delete data.attributes['target_status'];
      }
      exportClientFile(JSON.stringify(this.backendData), 'indicator-details', 'json');
    }
  }

  onTabChange(tabId) {
    if (typeof tabId === 'string') {
      this.activeTab = tabId;
      switch (tabId) {
        case IndicatorsTabs.CONTEXT:
          this.canStartToLoadIOC = true;
          break;
        case IndicatorsTabs.DNS:
          this.canStartToLoadDNS = true;
          break;
        case IndicatorsTabs.EXTERNAL:
          this.canStartToLoadExternal = true;
          break;
        case IndicatorsTabs.RELATIONS:
          this.canStartToLoadRelations = true;
          break;
        case IndicatorsTabs.ACTORS:
          this.canStartToLoadActors = true;
          break;
        case IndicatorsTabs.CAMPAIGNS:
          this.canStartToLoadCampaigns = true;
          break;
        case IndicatorsTabs.SOURCES:
          this.canStartToLoadSources = true;
          break;
        case IndicatorsTabs.SIGNATURES:
          this.canStartToLoadSignatures = true;
          break;
        case IndicatorsTabs.SPARKS:
          this.canStartToLoadSparks = true;
          break;
      }
    }
  }

  getDetails({ id, type }: { id: string; type: string }) {
    this.loading = true;
    this.indicatorsService
      .details({ id, type })
      .pipe(
        takeUntil(this.destroy$),
        take(1),
        finalize(() => (this.loading = false))
      )
      .subscribe(({ data }: any) => {
        if (data && data.attributes) {
          this.backendData = data;
          this.item = { ...data.attributes, id, name, links: data.links, relationships: data.relationships };
          this.risk = { score: data.attributes.risk };
          this.name = this.getName(this.item, data.type);
          this.indicatorName = this.name;
          this.path = `indicators/${type}/resource/${id}`;
          this.createEntries(this.item, data.type);
        }
        if (data && data.relationships) {
          this.processDetailsRelations(data.relationships);
        }
      });
  }

  reanalize() {
    this.indicatorsService
      .getGenericDetails({ id: this.indicatorId, type: this.indicatorType, extension: 'score', params: {} })
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe(({ data }) => {
        if (data) {
          this.risk = { score: data.score || 0 };
        }
      });
  }

  private processDetailsRelations(relations) {
    const { campaigns, sparks, threat_actors, signatures, sources } = relations;
    for (const tab of this.tabs) {
      if (tab.id === this.indicatorsTabs.CAMPAIGNS) {
        tab.loading = false;
        tab.count = campaigns.meta.count;
      }
      if (tab.id === this.indicatorsTabs.RELATIONS) {
        tab.loading = false;
      }
      if (tab.id === this.indicatorsTabs.SIGNATURES && signatures) {
        tab.loading = false;
        tab.count = signatures.meta.count;
      }
      if (tab.id === this.indicatorsTabs.SOURCES && sources) {
        tab.loading = false;
        tab.count = sources.meta.count;
      }
      if (tab.id === this.indicatorsTabs.ACTORS) {
        tab.loading = false;
        tab.count = threat_actors.meta.count;
      }
      if (tab.id === this.indicatorsTabs.SPARKS) {
        tab.loading = false;
        tab.count = sparks.meta.count;
      }
    }
  }

  private getName(item, type): string {
    switch (type) {
      case IndicatorTypes.IP:
        return item.address;
      case IndicatorTypes.FQDN:
        return item.domain;
      case IndicatorTypes.Malware:
        return item.hash;
      case IndicatorTypes.CrimeServer:
        return item.crime_server_url || '';
      default:
        return '-';
    }
  }

  private createEntries(item, type) {
    const firstSeen = item.first_seen ? moment(item.first_seen).format('DD/MM/YYYY') : '-';
    const lastSeen = item.last_seen ? moment(item.last_seen).format('DD/MM/YYYY') : '-';
    this.entries = [];
    this.entries2 = [];

    switch (type) {
      case IndicatorTypes.IP:
        this.entries.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'ASN Number',
          value: item.asn_number || '-'
        });
        this.entries.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'ASN Owner',
          value: item.asn_owner || '-'
        });
        this.entries.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
        this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'Latitude', value: item.latitude || '-' });
        this.entries2.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'Longitude',
          value: item.longitude || '-'
        });
        this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: item.tlp });
        break;
      case IndicatorTypes.FQDN:
        this.entries.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'Status',
          value: item.active ? 'Active' : '-'
        });

        this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: item.tlp });
        this.entries2.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
        this.entries2.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
        break;
      case IndicatorTypes.Malware:
        let types = [];
        if (
          item.relationships &&
          item.relationships.solr_type &&
          item.relationships.solr_type.links &&
          item.relationships.solr_type.links.related
        ) {
          const related = item.relationships.solr_type.links.related;
          const aux = related.split('/');
          let relatedType = aux.pop();
          if (!relatedType) {
            relatedType = aux.pop();
          }
          types = [relatedType];
        } else {
          types =
            item.properties && Array.isArray(item.properties) && item.properties.length > 0
              ? item.properties.map((prop) => prop.malware_type)
              : item.types_names || [];
        }

        this.entries2.push({ icon: 'icon-file-alt bg-primary', title: 'MD5', value: item.md5 || '-' });
        this.entries2.push({ icon: 'icon-file-alt bg-primary', title: 'SHA-1', value: item.sha1 || '-' });
        this.entries2.push({ icon: 'icon-file-alt bg-primary', title: 'SHA-256', value: item.sha256 || '-' });
        this.entries2.push({ icon: 'icon-file-alt bg-primary', title: 'SHA-512', value: item.sha512 || '-' });
        this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'Type', value: types.join(', ') || '-' });
        this.entries.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
        this.entries.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
        this.entries.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: item.tlp });
        break;
      case IndicatorTypes.CrimeServer:
        this.entries.push({
          icon: 'icon-power bg-danger',
          title: 'Status',
          value: item.status
        });
        this.entries.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'Type',
          value: this.processCrimeServerType(item.main_type) || '-'
        });
        this.entries.push({
          icon: 'icon-desktop_windows bg-primary',
          title: 'Subtype',
          value: item.subtype_name || '-'
        });
        this.entries2.push({ icon: 'icon-clock bg-primary', title: 'First Seen', value: firstSeen });
        this.entries2.push({ icon: 'icon-clock bg-primary', title: 'Last Seen', value: lastSeen });
        this.entries2.push({ icon: 'icon-desktop_windows bg-primary', title: 'TLP', value: item.tlp });
        break;
    }
  }

  private buildTabs(type) {
    this.tabs = [];
    this.tabs = [{ title: 'Indicators', id: this.indicatorsTabs.CONTEXT, icon: 'icon-newspaper' }];
    switch (type) {
      case IndicatorsBackendRequestTypes.IP:
        this.tabs.push({ title: 'DNS', id: this.indicatorsTabs.DNS, icon: 'icon-server' });
        this.tabs.push({ title: 'External', id: this.indicatorsTabs.EXTERNAL, icon: 'icon-server' });
        this.tabs.push({ title: 'Relations', id: this.indicatorsTabs.RELATIONS, loading: true, icon: 'icon-refresh' });
        this.tabs.push({
          title: 'Threat Actors',
          id: this.indicatorsTabs.ACTORS,
          count: 0,
          loading: true,
          icon: 'icon-users'
        });
        this.tabs.push({
          title: 'Campaigns',
          id: this.indicatorsTabs.CAMPAIGNS,
          count: 0,
          loading: true,
          icon: 'icon-server'
        });
        this.tabs.push({
          title: 'Signatures',
          id: this.indicatorsTabs.SIGNATURES,
          count: 0,
          loading: true,
          icon: 'icon-server'
        });
        break;
      case IndicatorsBackendRequestTypes.FQDN:
        this.tabs.push({ title: 'DNS', id: this.indicatorsTabs.DNS, icon: 'icon-server' });
        this.tabs.push({ title: 'External', id: this.indicatorsTabs.EXTERNAL, icon: 'icon-server' });
        this.tabs.push({ title: 'Relations', id: this.indicatorsTabs.RELATIONS, loading: true, icon: 'icon-refresh' });
        this.tabs.push({
          title: 'Threat Actors',
          id: this.indicatorsTabs.ACTORS,
          count: 0,
          loading: true,
          icon: 'icon-users'
        });
        this.tabs.push({
          title: 'Campaigns',
          id: this.indicatorsTabs.CAMPAIGNS,
          count: 0,
          loading: true,
          icon: 'icon-server'
        });
        break;
      case IndicatorsBackendRequestTypes.Malware:
        this.tabs.push({ title: 'External', id: this.indicatorsTabs.EXTERNAL, icon: 'icon-server' });
        this.tabs.push({ title: 'Relations', id: this.indicatorsTabs.RELATIONS, loading: true, icon: 'icon-refresh' });
        this.tabs.push({
          title: 'Threat Actors',
          id: this.indicatorsTabs.ACTORS,
          count: 0,
          loading: true,
          icon: 'icon-users'
        });
        this.tabs.push({
          title: 'Campaigns',
          id: this.indicatorsTabs.CAMPAIGNS,
          count: 0,
          loading: true,
          icon: 'icon-server'
        });
        this.tabs.push({
          title: 'Sources',
          id: this.indicatorsTabs.SOURCES,
          count: 0,
          loading: true,
          icon: 'icon-map-marker'
        });
        this.tabs.push({
          title: 'Signatures',
          id: this.indicatorsTabs.SIGNATURES,
          count: 0,
          loading: true,
          icon: 'icon-server'
        });
        break;
      case IndicatorsBackendRequestTypes.CrimeServer:
        this.tabs.push({ title: 'Relations', id: this.indicatorsTabs.RELATIONS, loading: true, icon: 'icon-refresh' });
        this.tabs.push({
          title: 'Sources',
          id: this.indicatorsTabs.SOURCES,
          count: 0,
          loading: true,
          icon: 'icon-map-marker'
        });
        break;
    }
    this.tabs.push({ title: 'Sparks', id: this.indicatorsTabs.SPARKS, count: 0, loading: true, icon: 'icon-server' });
    this.activeTab = this.tabs[0].id;
  }

  private processCrimeServerType(type: string): string {
    let result = type.toLocaleLowerCase();
    switch (result) {
      case 'c_and_c':
        result = 'CRIMESERVER';
        break;
      case 'exploit_kit':
        result = 'EXPLOIT KIT';
        break;
      case 'classification_pending':
        result = 'UNCLASSIFIED';
        break;
      case 'tor_ip':
        result = 'TOR IP';
        break;
      case 'malware':
        result = 'EXECUTABLE';
        break;
    }
    return result.toUpperCase();
  }

  private extractCsvData(data, type) {
    switch (type) {
      case IndicatorTypes.IP.toLowerCase():
        return this.extractCsvDataForIp(data);
      case IndicatorTypes.FQDN.toLowerCase():
        return this.extractCsvDataForFQDN(data);
      case IndicatorTypes.Malware.toLowerCase():
        return this.extractCsvDataForMalware(data);
      case 'crime-server':
        return this.extractCsvDataForCrimeServer(data);
    }
  }

  private extractCsvDataForIp(data) {
    const { attributes, relationships } = data;

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      ADDRESS: attributes.address || ' ',
      RISK_SCORE: attributes.risk || 0,
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      ASN_NUMBER: attributes.asn_number || '',
      ASN_OWNER: attributes.asn_owner || '',
      LATITUDE: attributes.latitude || '',
      LONGITUDE: attributes.longitude || '',
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      SPARKS: relationships.sparks ? relationships.sparks.meta.count : 0,
      FQDNS: relationships.fqdns ? relationships.fqdns.meta.count : 0,
      BOTS: relationships.bots ? relationships.bots.meta.count : 0
    };
  }

  private extractCsvDataForMalware(data) {
    const { attributes, relationships } = data;

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      MD5: attributes.md5,
      SHA1: attributes.sha1,
      SHA256: attributes.sha256,
      SHA512: attributes.sha512,
      RISK_SCORE: attributes.risk || 0,
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      FILE_TYPE: attributes.file_type || ' ',
      MALWARE_TYPE: attributes.subtype || ' ',
      ANALYSIS_SIGNATURES: (attributes.analysis_signatures || []).join(','),
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      SPARKS: relationships.sparks ? relationships.sparks.meta.count : 0,
      SOURCES: relationships.sources ? relationships.sources.meta.count : 0
    };
  }

  private extractCsvDataForFQDN(data) {
    const { attributes, relationships } = data;

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      FQDN: attributes.domain || ' ',
      RISK_SCORE: attributes.risk || 0,
      STATUS: attributes.active ? 'Active' : '-',
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      THREAT_ACTORS: relationships.threat_actors ? relationships.threat_actors.meta.count : 0,
      CAMPAIGNS: relationships.campaigns ? relationships.campaigns.meta.count : 0,
      SIGNATURES: relationships.signatures ? relationships.signatures.meta.count : 0,
      SPARKS: relationships.sparks ? relationships.sparks.meta.count : 0,
      IPS: relationships.ips ? relationships.ips.meta.count : 0,
      CRIMESERVERS: relationships.crime_servers ? relationships.crime_servers.meta.count : 0
    };
  }

  private extractCsvDataForCrimeServer(data) {
    const { attributes, relationships } = data;

    return {
      TYPE: data.type || ' ',
      TLP: attributes.tlp,
      URL: attributes.crime_server_url || ' ',
      RISK_SCORE: attributes.risk || 0,
      STATUS: attributes.status || ' ',
      'FIRST SEEN': moment(attributes.first_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      'LAST SEEN': moment(attributes.last_seen, 'YYYY-MM-DD[T]HH:mm:ss').format('DD/MM/YYYY'),
      CRIMESERVER_TYPE: attributes.main_type || ' ',
      CRIMESERVER_SUBTYPE: attributes.subtype_name || ' ',
      SPARKS: relationships.sparks ? relationships.sparks.meta.count : 0,
      FQDNS: relationships.fqdns ? relationships.fqdns.meta.count : 0,
      HASHES: relationships.hashes ? relationships.hashes.meta.count : 0,
      SOURCES: relationships.sources ? relationships.sources.meta.count : 0
    };
  }
}
