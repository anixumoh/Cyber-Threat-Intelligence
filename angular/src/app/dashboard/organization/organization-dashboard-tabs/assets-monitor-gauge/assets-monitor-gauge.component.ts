import { Component, Input, OnDestroy } from '@angular/core';
import { OrganizationDashboardTabsService } from '../organization-dashboard-tabs.service';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

interface AssetsChart {
  values: {
    IP: number;
    IP_RANGE: number;
    DOMAIN: number;
    SUBDOMAIN: number;
    KEYWORD: number;
    BINCODES: number;
  };
  width: any;
  marginLeft: number;
  marginRight: number;
  isLoading: boolean;
}

@Component({
  selector: 'app-assets-monitor-gauge',
  templateUrl: './assets-monitor-gauge.component.html',
  styleUrls: ['./assets-monitor-gauge.component.scss']
})
export class AssetsMonitorGaugeComponent implements OnDestroy {
  @Input()
  get orgId() {
    return this._orgId;
  }
  set orgId(id: number) {
    if (id) {
      this._orgId = id;
      this.getAssetsChartInfo();
    }
  }
  state: AssetsChart = {
    values: {
      IP: 0,
      IP_RANGE: 0,
      DOMAIN: 0,
      SUBDOMAIN: 0,
      KEYWORD: 0,
      BINCODES: 0
    },
    width: 0,
    marginLeft: 0,
    marginRight: 0,
    isLoading: true
  };
  selectedModule = 'all';
  chartHeight = 168;
  _orgId;
  private readonly destroy$ = new Subject<void>();

  constructor(private organizationDashboardService: OrganizationDashboardTabsService) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getAssetsChartInfo() {
    this.organizationDashboardService
      .getSettingsPerOrganizationChart(this._orgId, this.selectedModule)
      .pipe(takeUntil(this.destroy$), take(1))
      .subscribe((res) => {
        for (const property in this.state.values) {
          this.state.values[property] = 0;
        }
        for (const property in res) {
          if (property in this.state.values) {
            this.state.values[property] = res[property];
          }
        }
        this.state.isLoading = false;
      });
  }
}
