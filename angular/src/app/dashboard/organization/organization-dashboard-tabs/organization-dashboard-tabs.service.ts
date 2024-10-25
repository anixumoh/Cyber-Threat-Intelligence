import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { getRequestOptions } from 'app/shared/utils/common.utils';

@Injectable()
export class OrganizationDashboardTabsService {
  constructor(private httpUtils: HttpUtilsService) {}

  getGlobalCharts(dateRangeToBe: any) {
    const params = getRequestOptions(dateRangeToBe);
    const globalChartsUrl = `${path}/chart`;
    return this.httpUtils.get(globalChartsUrl, params);
  }

  getOrganizationCharts(orgId) {
    const organizationCharts = `${path}/chart/organization/${orgId}?moduleWildcard=true`;
    return this.httpUtils.get(organizationCharts);
  }

  getChart(orgId: number, id: number, dateRangeToBe: any) {
    const params = getRequestOptions(dateRangeToBe);
    const chartUrl = `${path}/chart/organization/${orgId}/chart/${id}`;
    return this.httpUtils.get(chartUrl, params).pipe(catchError(() => throwError(new Error(`Try later`))));
  }

  getSettingsPerOrganizationChart(orgId, selectedModule = 'all') {
    let chartUrl = `${path}/chart/default/settings-per-organization/${orgId}`;
    if (selectedModule === 'enabled') {
      return this.httpUtils.get(`${chartUrl}?enabled=true`);
    } else if (selectedModule === 'disabled') {
      return this.httpUtils.get(`${chartUrl}?enabled=false`);
    } else {
      return this.httpUtils.get(chartUrl);
    }
  }

  downloadChart(orgId, chartId) {
    const params = getRequestOptions(
      undefined,
      new HttpHeaders().set('Cache-Control', 'no-cache, no-store, must-revalidate')
    );
    const url = `${path}/chart/organization/${orgId}/chart/${chartId}/csv`;
    return this.httpUtils.getFileBinary(url, params);
  }
}
