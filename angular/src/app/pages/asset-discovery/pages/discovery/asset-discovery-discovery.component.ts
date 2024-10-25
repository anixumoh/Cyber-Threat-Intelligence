import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ToastrService } from 'ngx-toastr';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { AssetDiscoveryService } from '../../asset-discovery.service';
import { domainTooltip, getStatus } from '../../utils';
import { StatusType } from '../../types';

declare function initChart(arg, chartData): any;

@Component({
  selector: 'app-asset-discovery-discovery',
  templateUrl: './asset-discovery-discovery.component.html',
  styleUrls: ['./asset-discovery-discovery.component.scss']
})
export class AssetDiscoveryDiscoveryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('inputSearch') inputSearch: ElementRef;
  chartData = {};
  showAll = false;

  activeTab;

  loading = true;
  activeOrganization;
  canLaunchDiscovery = false;
  discoveryStatus;
  configuredSettings;
  configuredDomains = [];
  allowedModules;
  allowedData = ['subdomain', 'ip'];
  tableData = {
    subdomain: [],
    ip: [],
    email: []
  };
  isTableDisabled = true;
  isNotStarted = false;
  progressBar = false;

  filterByOptions = [
    { name: null, value: 'None' },
    { name: 'new', value: 'New' },
    { name: 'updated', value: 'Updated' },
    { name: 'deleted', value: 'Deleted' },
    { name: 'discarded', value: 'Discarded' }
  ];

  sortByOptions = [
    { name: null, value: 'None' },
    { name: 'NEW_FIRST', value: 'New first' },
    { name: 'OLD_FIRST', value: 'Deleted first' },
    { name: 'DISCARDED_FIRST', value: 'Discarded first' }
  ];

  params = {
    filterBy: '',
    sortBy: '',
    search: '',
    domain: ''
  };

  private readonly destroy$ = new Subject<void>();

  constructor(
    private discoveryService: AssetDiscoveryService,
    private organizationService: OrganizationService,
    private toastrService: ToastrService
  ) {
    this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentModule && context.currentOrganization) {
        this.activeOrganization = context.currentOrganization;
      }
    });

    this.organizationService.getCurrentModules().subscribe((modules) => {
      this.allowedModules = modules;
    });
  }

  get areThereDomains() {
    return this.configuredDomains.length;
  }

  ngAfterViewInit() {
    this.discoveryService
      .getChartData(this.activeOrganization.id, this.showAll)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => this.parseResponse(res, true));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCanvas();
    this.discoveryService.closeSse();
  }

  parseDomains(domains: any, finished: number[], ongoing: number[], pending: number[]) {
    const domainsKeys = Object.keys(domains);
    return domainsKeys.length
      ? domainsKeys.map?.((key) => {
          const status = getStatus(+key, finished, ongoing, pending);
          return { value: domains[key], id: key, status };
        })
      : [];
  }

  updateData(
    domains: any,
    finished: number[],
    ongoing: number[],
    pending: number[],
    status: StatusType,
    allowNewSearch: boolean
  ) {
    this.configuredDomains = this.parseDomains(domains, finished, ongoing, pending);
    this.discoveryStatus = status;
    this.isTableDisabled = this.discoveryStatus !== 'FINISHED';
    this.canLaunchDiscovery = allowNewSearch;
  }

  onGoingSse() {
    this.discoveryService.getServerSentEvent(this.activeOrganization.id).subscribe((res: any) => {
      this.destroyCanvas();
      this.parseResponse(res, false);
    });
  }

  initChartData(data: any) {
    this.chartData = data;
    if (!!this.chartData[this.activeTab]) {
      initChart(true, this.chartData[this.activeTab]);
    }
  }

  parseResponse(res: any, initTabs?) {
    const { domains, finished, ongoing, pending, status: generalStatus, allowNewSearch, data } = res;

    this.updateData(domains, finished, ongoing, pending, generalStatus, allowNewSearch);

    switch (generalStatus) {
      case 'FINISHED': {
        this.activeTab = initTabs ? res.finished[0].toString() : this.activeTab;
        this.isNotStarted = false;
        this.discoveryService.isOpenSseChannel = false;
        this.initChartData(data);
        break;
      }

      case 'NOT_STARTED': {
        this.isNotStarted = true;
        break;
      }

      case 'ONGOING': {
        this.activeTab = initTabs && !!res?.ongoing?.length ? res.ongoing[0].toString() : this.activeTab;
        this.isNotStarted = false;
        this.initChartData(data);
        !this.discoveryService.isOpenSseChannel && this.onGoingSse();
        break;
      }
    }
  }

  runDiscovery() {
    if (this.discoveryStatus !== 'ONGOING') {
      this.discoveryService
        .discover(this.activeOrganization.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.discoveryStatus = 'ONGOING';
          this.activeTab = this.configuredDomains[0].id;
          this.configuredDomains.forEach((domain, index) => {
            domain.status = index === 0 ? 'ongoing' : 'pending';
          });
          this.isTableDisabled = true;
          this.destroyCanvas();
          this.onGoingSse();
        });
    } else {
      this.discoveryService
        .cancelDiscovery(this.activeOrganization.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.discoveryService.closeSse();
        });
    }
  }

  reloadChart(id: string, isPending: boolean) {
    if (!isPending) {
      this.activeTab = id;
      initChart(false, this.chartData[id]);
    }
  }

  addToSettingsInBulk(event) {
    this.progressBar = true;
    this.discoveryService
      .saveSettingsData(this.activeOrganization.id, event.type, event.values, event.modules, event.tag)
      .subscribe(
        () => {
          this.progressBar = false;
          this.toastrService.success(
            'You can go to the Global Settings section to see the newly added settings',
            'Success'
          );
        },
        () => {
          this.progressBar = false;
          this.toastrService.error('Could not add settings', 'Error');
        }
      );
  }

  disCardItems(e) {
    const items = e.items;
    const data = [];
    items.map((element) => {
      data.push({
        value: element.value,
        discarded: element.assetStatus === 'DISCARDED' ? false : true,
        type: e.type.toUpperCase()
      });
    });

    this.discoveryService
      .discardItems(this.activeOrganization.id, data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.load(e['type']);
      });
  }

  changeParams($event) {
    this.params[$event.type] = $event.value;
    this.load($event.asset);
  }

  tabChange(e) {
    if (e.index === 1) {
      this.loadTable();
    }
  }

  loadTable() {
    if (!this.tableData.subdomain.length && !this.tableData.ip.length) {
      this.load();
    }
  }

  changeDomain(e) {
    this.params = {
      filterBy: '',
      sortBy: '',
      search: '',
      domain: e === this.params.domain ? '' : e
    };
    this.load();
  }

  isShowAllActive() {
    return this.activeTab[this.activeTab.domain];
  }

  getDomainTooltip(status) {
    return domainTooltip[status];
  }

  getDiscoveryTooltip() {
    if (this.discoveryStatus === 'ONGOING') {
      return 'Cancel ongoing discovery';
    } else {
      return this.canLaunchDiscovery ? 'Launch a discovery' : 'You can only launch a discovery every 24h';
    }
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
    this.destroyCanvas();
    this.discoveryService
      .getChartData(this.activeOrganization.id, this.showAll)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.chartData = res.data;
        initChart(true, this.chartData[this.activeTab]);
      });
  }

  destroyCanvas() {
    const canvas = document.getElementById('mainCanvas');
    if (canvas) {
      canvas.remove();
    }
  }

  getInfoMessage() {
    return this.discoveryStatus === 'FINISHED'
      ? 'Showing only first 100 results by default'
      : 'There’s an ongoing discovery. The graph will automatically update once there’s new data';
  }

  private load(type?) {
    const urlParams = `?status=${this.params.filterBy ? this.params.filterBy.toUpperCase() : ''}&${
      type === 'ip' ? 'is' : 'ss'
    }=${this.params.sortBy ? this.params.sortBy.toUpperCase() : ''}&q=${this.params.domain}&type=${
      type ? type.toUpperCase() : ''
    }&sq=${this.params.search}`;
    this.discoveryService
      .loadTable(this.activeOrganization.id, urlParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const dictionary = {
          subdomain: 'hosts',
          ip: 'ips'
        };
        if (type) {
          this.tableData[type] = res[dictionary[type]];
        } else {
          this.tableData.ip = res.ips;
          this.tableData.subdomain = res.hosts;
        }

        this.loading = false;
      });
  }
}
