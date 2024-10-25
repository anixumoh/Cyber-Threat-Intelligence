import { allStatusOptions } from '$lib/constants/threat';
import type { InformType, TlpType } from '$lib/types';
import type Module from '$lib/types/module';
import {
  ThreatDateFilterField,
  type PanintelligenceDashboardInfoResponse,
  type ThreatDetail,
  type ThreatSearchType
} from '$lib/types/threat';
import { getSinceOrToDate } from '$lib/utils/functions';
import { parseThreatResource } from '$lib/utils/parseData';
import notifications from '$stores/notification';
import axios, { type CancelTokenSource } from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import { isNumber } from 'lodash';
import Service from '.';

const fileType = {
  'application/vnd.ms-excel': 'xlsx',
  'application/octet-stream': 'docx'
};

export type ThreatDashboardItem = {
  id: number;
  endDate: Dayjs;
  startDate: Dayjs;
  value: number;
};

export type IssueType = {
  id: number;
  title: string;
  typeId: string;
  typeName: string;
  description: string;
  remediationTips: string;
  status: string;
  risk: string;
  activities: number;
  creationDate: number;
  notificationDate: Date;
  changedAt: number;
  lastUpdateUser: string;
  moduleId: number;
  organizationId: number;
  labels: any[];
  numberOfAnalyzedResources: number;
};

export type IssueTypeType = {
  value: string;
  label: string;
};

export type IssueUserType = {
  username: string;
};

export type CreateIssueType = {
  description: string;
  remediationTips: string;
  title: string;
  typeId: string;
  username: string;
};

export default class ThreatsService extends Service {
  cancelTokengetThreatsDashboard: CancelTokenSource;
  cancelTokengetThreatsResources: CancelTokenSource;
  cancelTokengetExportAllThreatsResources: CancelTokenSource;
  cancelTokengetAllThreatsResources: CancelTokenSource;

  // TODO: improve this (automate)
  // Ideas:
  // decorators? @once
  // proxy object for Service? or for Client?
  abort() {
    this.cancelTokengetThreatsDashboard?.cancel();
    this.cancelTokengetThreatsResources?.cancel();
    this.cancelTokengetExportAllThreatsResources?.cancel();
    this.cancelTokengetAllThreatsResources?.cancel();
  }

  async getPanintelligenceDashboard(
    organizationId: number,
    moduleId: number,
    filters: ThreatSearchType,
    timezone: string
  ) {
    const url = `/api/v2/charts/organization/${organizationId}/module/${moduleId}/resource_analytics`;
    const params = this.#getFiltersForThreatDashboard(filters, timezone);
    const response = await this.client.get<PanintelligenceDashboardInfoResponse>(url, { params });
    return response.data;
  }

  async getThreatsDashboard(
    organizationId: number,
    moduleId: number,
    filters: ThreatSearchType,
    timezone: string
  ): Promise<ThreatDashboardItem[]> {
    this.cancelTokengetThreatsDashboard?.cancel();
    this.cancelTokengetThreatsDashboard = axios.CancelToken.source();

    const url = `/api/v2/chart/organization/${organizationId}/module/${moduleId}/resource_analytics`;
    const params = this.#getFiltersForThreatDashboard(filters, timezone);
    const response = await this.client.get(url, {
      params,
      cancelToken: this.cancelTokengetThreatsDashboard.token
    });

    return response.data.map((item: any) => ({
      id: +item.id,
      startDate: dayjs.tz(item.startDate),
      endDate: dayjs.tz(item.endDate),
      value: item.value
    }));
  }

  #getCommonFilters(filters: ThreatSearchType) {
    const analysisCalcResultArray = filters.filters.analysisCalcResult.length
      ? filters.filters.analysisCalcResult
      : allStatusOptions;
    const analysisCalcResult = analysisCalcResultArray.join(',');

    const params: any = { analysisCalcResult, timestamp: dayjs().utc().format() };

    if (isNumber(filters.filters.read)) {
      params.read = filters.filters.read;
    }
    if (filters.filters.modified) {
      params.userModified = filters.filters.modified;
    }
    if (filters.filters.labels?.length) {
      params.labels = filters.filters.labels.join(',');
    }
    if (filters.filters.labelsAnd?.length) {
      params.labelsAnd = filters.filters.labelsAnd.join(',');
    }
    if (filters.filters.excludeLabels?.length) {
      params.excludeLabels = filters.filters.excludeLabels.join(',');
    }
    if (filters.filters.incidents) {
      params.incidents = filters.filters.incidents;
    }
    if (filters.filters.terms?.length) {
      params.terms = filters.filters.terms.join(',');
    }
    if (filters.filters.sources?.length) {
      params.sources = filters.filters.sources.join(',');
    }
    if (filters.filters.starred) {
      params.starred = filters.filters.starred;
    }
    if (filters.filters.followed) {
      params.followed = filters.filters.followed;
    }
    if (filters.filters.targeted) {
      params.targeted = filters.filters.targeted;
    }
    if (filters.filters.userSubmitted) {
      params.userSubmitted = filters.filters.userSubmitted;
    }

    let sinceField = 'since';
    let toField = 'to';

    if (filters.dateField === ThreatDateFilterField.BREACHED_AT) {
      sinceField = 'sinceStolenAt';
      toField = 'toStolenAt';
    }

    if (filters.since) {
      params[sinceField] = getSinceOrToDate(filters.since).valueOf();
    }
    if (filters.to) {
      params[toField] = getSinceOrToDate(filters.to, false).valueOf();
    }
    return params;
  }

  #getFiltersForThreatDashboard(filters: ThreatSearchType, timezone: string) {
    const params: any = {
      timezone,
      facet: 'TIME', // TODO, check
      orderBy: 'KEY', // TODO, check
      granularity: 'DAY',
      StatFilterSort: 'ASC',
      ...this.#getCommonFilters(filters)
    };

    if (filters.since && filters.to) {
      const convertDate = (d: Date) => {
        const dateObj = dayjs(d).toDate();
        return `${dateObj.getFullYear()}${('0' + (dateObj.getMonth() + 1)).slice(-2)}${('0' + dateObj.getDate()).slice(
          -2
        )}`;
      };

      const rearrangeDate = (d: Date) => {
        const split = d.toDateString().split('.');
        return `${split[2]}${split[0]}${split[1]}`;
      };

      const sinceMonthAdded = /\./.test(filters.since.toDateString())
        ? rearrangeDate(filters.since)
        : convertDate(filters.since);
      const toMonthAdded = /\./.test(filters.to.toDateString()) ? rearrangeDate(filters.to) : convertDate(filters.to);
      params.since = sinceMonthAdded;
      params.to = toMonthAdded;

      if (!params?.limit) {
        const sinceDay = dayjs(filters.since).set('hour', 0).set('minute', 0).set('second', 0);
        const toDay = dayjs(filters.to).set('hour', 23).set('minute', 59).set('second', 59);
        const diffDays = toDay.diff(sinceDay, 'day');
        let limit = diffDays + 1;
        let granularity = 'DAY';
        if (diffDays > 270) {
          limit = toDay.diff(sinceDay, 'month');
          granularity = 'MONTH';
        } else if (diffDays > 60) {
          limit = toDay.diff(sinceDay, 'week');
          granularity = 'WEEK';
        }
        params.limit = limit;
        params.granularity = granularity;
      }
    }

    return params;
  }

  getFiltersForThreatResources(filters: ThreatSearchType) {
    // targeted, userSubmitted
    const params: any = {
      ...this.#getCommonFilters(filters),
      limitPagination: true,
      extraFields: true
    };
    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.maxRows) {
      params.maxRows = filters.maxRows;
    }

    if (filters.q) {
      params.q = filters.q;
    }

    if (filters.o) {
      params.o = filters.o;
    }

    return params;
  }

  #getFiltersForAllThreatResources(filters: ThreatSearchType) {
    const params: any = {
      ...this.#getCommonFilters(filters),
      extraFields: true
    };
    if (filters.page) {
      params.page = filters.page;
    }

    if (filters.maxRows) {
      params.maxRows = filters.maxRows;
    }

    if (filters.q) {
      params.q = filters.q;
    }

    if (filters.o) {
      params.o = filters.o;
    }

    if (filters.days) {
      params.days = filters.days;
    }

    return params;
  }

  async getAllThreatsResources(organizacionId: number, filters: ThreatSearchType) {
    this.cancelTokengetAllThreatsResources?.cancel();
    this.cancelTokengetAllThreatsResources = axios.CancelToken.source();
    const params = this.#getFiltersForAllThreatResources(filters);
    const response = await this.client.get<{ total_resources: number; list: any[] }>(
      `api/v2/organization/${organizacionId}/module/0/resource`,
      {
        params,
        cancelToken: this.cancelTokengetAllThreatsResources.token
      }
    );
    const totalResources = response.data.total_resources;
    const resources = response.data.list.map((item, index) => parseThreatResource(item, index));
    return {
      totalResources,
      resources
    };
  }

  async getThreatsResources(organizationId: number, moduleId: number, moduleName: string, filters: ThreatSearchType) {
    this.cancelTokengetThreatsResources?.cancel();
    this.cancelTokengetThreatsResources = axios.CancelToken.source();
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/resource`;
    const params = this.getFiltersForThreatResources(filters);
    const response = await this.client.get<{ total_resources: number; list: any[] }>(url, {
      params,
      cancelToken: this.cancelTokengetThreatsResources.token
    });
    const totalResources = response.data.total_resources;
    const resources = response.data.list.map((item, index) => parseThreatResource(item, index));
    return {
      totalResources,
      resources
    };
  }

  async getResource(organizationId: number, moduleId: number, moduleName: string, resourceId: number) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}?extraFields=true&malwareExtraInfo=false`;
    return this.client.get<ThreatDetail>(url);
  }

  async getResourceMalware(
    organizationId: number,
    moduleId: number,
    moduleName: string,
    resourceId: number,
    key: string
  ) {
    const url = `api/v2/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/${key}`;
    return this.client.get(url);
  }

  openFile(data: any, status: number, type = 'application/vnd.ms-excel', fileName = 'exportedExcel') {
    const blob = new Blob([data], {
      type
    });
    if (status === 200) {
      const ext = fileType[type];
      const dwldLink = document.createElement('a');
      const urlObject = URL.createObjectURL(blob);
      dwldLink.setAttribute('target', '_blank');
      dwldLink.setAttribute('href', urlObject);
      dwldLink.setAttribute('download', `${fileName}.${ext}`);
      dwldLink.style.visibility = 'hidden';
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    } else {
      notifications.notify({
        title: 'Something went wrong while trying to export selected resources.'
      });
    }
  }

  async updateStars(rate: number, resourceId: number, orgId: number, moduleId: number, moduleName: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName.toLowerCase()}/resource/rating`;
    const data = {
      rate,
      resource: resourceId
    };
    await this.client.put(url, data);
  }

  async updateTLP(status: TlpType, resourceId: number, orgId: number, moduleId: number, moduleName: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName.toLowerCase()}/resource/${resourceId}/tlpStatus/${status}`;
    await this.client.put(url);
  }

  async markAsFav(isFavorite: boolean, id: number, orgId: number, moduleId: number, moduleName: string) {
    const value = isFavorite ? 'NOT_STARRED' : 'USER_STARRED';
    const body = {
      status: value,
      resource: id
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName.toLowerCase()}/resource/fav`;
    await this.client.put(url, body);
  }

  // TODO Problems to open more than one
  openBlankedResources(selectedItems: number[], orgId: number, moduleId: number) {
    selectedItems.forEach((selected: number) => {
      const url = `/dashboard/organizations/${orgId}/modules/${moduleId}/resource/${selected}`;

      window.open(url, '_blank');
    });
  }

  async markAsRead(resources: number[], orgId: number, moduleId: number, moduleName: string, isRead = true) {
    const body = {
      read: isRead,
      resources
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/markAs`;
    await this.client.put(url, body);
  }

  async updateStatusMultiple(resources: number[], orgId: number, moduleId: number, status: InformType) {
    const updatedResources = resources.map((resource) => {
      return `${orgId}_${moduleId}_${resource}`;
    });

    const body = {
      ids: updatedResources,
      userResult: status
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/resource/setUserResultMultiple`;
    await this.client.put(url, body);
  }

  async exportSelectedFile(resources: number[], orgId: number, moduleId: number, moduleName: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/export`;
    const { data, status } = await this.client.post(url, resources, {
      responseType: 'blob'
    });
    this.openFile(data, status);
  }

  async getExportAllThreatsResources(organizationId: number, moduleId: number, filters: ThreatSearchType) {
    this.cancelTokengetExportAllThreatsResources?.cancel();
    this.cancelTokengetExportAllThreatsResources = axios.CancelToken.source();
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/resource/export`;
    const params = {
      ...this.#getCommonFilters(filters),
      read: 0
    };
    const { data, status } = await this.client.get(url, {
      params,
      cancelToken: this.cancelTokengetExportAllThreatsResources.token,
      responseType: 'blob'
    });
    this.openFile(data, status);
  }

  async addResourceManually(orgId: number, moduleId: number, item: any) {
    return await this.client.post(`/api/v2/organization/${orgId}/module/${moduleId}/resource/add`, item);
  }

  async moveResource(orgId: number, moduleId: number, data: any) {
    return await this.client.post(`/api/v2/organization/${orgId}/module/${moduleId}/resource/copyOrMoveTo`, data);
  }

  async getResourceIssues(resourceId: number, organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/${resourceId}/issue`;
    const response = await this.client.get<IssueType[]>(url);
    return response.data;
  }

  async getIssueTypes(organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/issue/types`;
    const response = await this.client.get<IssueTypeType[]>(url);
    return response.data;
  }

  async getIssueUsers(organizationId: number, moduleId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/issue/users?q=`;
    const response = await this.client.get<IssueUserType[]>(url);
    return response.data;
  }

  async getExistingIssues(organizationId: number, module: Module): Promise<IssueType[]> {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/issue/list`;
    const response = await this.client.get(url);
    return response.data.items;
  }

  async assignExistingIssueToResources(organizationId: number, module: Module, issueId: number, resourceIds: number[]) {
    const resourcesWithoutIssue = (
      await Promise.all(
        resourceIds.map(async (resourceId) => {
          const issues = await this.getResourceIssues(resourceId, organizationId, module);
          const hasIssue = issues.some((issue) => issue.id === issueId);
          if (!hasIssue) {
            return resourceId;
          }
        })
      )
    ).filter(Boolean);

    if (!resourcesWithoutIssue.length) return;

    await this.assignIssueToResource(organizationId, module.id, issueId, resourcesWithoutIssue);
  }

  async assignIssueToResource(
    organizationId: number,
    moduleId: number,
    issueId: number | string,
    resourceIds: number[]
  ) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/issue/${issueId}`;
    const data = {
      resourcesId: resourceIds
    };
    await this.client.post(url, data);
  }

  async createIssue(organizationId: number, moduleId: number, issue: CreateIssueType) {
    const url = `/api/v2/organization/${organizationId}/module/${moduleId}/issue`;
    const response = await this.client.post<{ issueId: string }>(url, issue);
    return response.data;
  }

  async deleteAssignedIssue(organizationId: number, module: Module, resourceId: number, issueId: number) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/${resourceId}/issue/${issueId}`;
    await this.client.delete(url);
  }

  async getModulesStandalone(orgId: number | string) {
    return this.client.get(`/api/v2/organization/${orgId}/module?extraFields=true`);
  }

  async deleteResources(resources: number[], orgId: number, moduleId: number, moduleName: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource`;
    return this.client.put(url, resources);
  }

  async blockUrls(orgId: number, moduleId: number, data: any) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/resource/blacklist`;
    return await this.client.post(url, data);
  }

  async blockDomain(resourceId: number, orgId: number, moduleId: number, data: any) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/resource/${resourceId}/blacklist`;
    return await this.client.post(url, data);
  }

  async toggleLabel(resources: number[], labelId: number, organizationId: number, module: Module) {
    const url = `/api/v2/organization/${organizationId}/module/${module.id}/${module.moduleName}/resource/label`;
    const data = {
      label: labelId,
      resources
    };
    await this.client.put(url, data);
  }

  async downloadFileDetails(orgId: number, moduleId: number, moduleName: string, id: number, type: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/attach/${id}`;
    const { data, status } = await this.client.get(url);
    this.openFile(data, status, type);
  }

  async onChangeLanguage(orgId: number, moduleId: number, moduleName: string, resourceId: number, languageId: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/language`;
    const newValues = {
      languageId
    };
    await this.client.put(url, newValues);
  }

  async onFollowUp(orgId: number, moduleId: number, resourceId: number) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/resource/${resourceId}/changeFollowedUp`;
    await this.client.put(url, null);
  }

  async sendReport(
    orgId: number,
    moduleId: number,
    moduleName: string,
    resourceId: string,
    mails: string,
    language = 'en'
  ) {
    const options = `?destinations=${mails}&languageId=${language}`;
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/docx${options}`;
    return await this.client.get(url);
  }

  async downloadReport(orgId: number, moduleId: number, moduleName: string, resourceId: string, language = 'en') {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/docx?languageId=${language}`;
    const { data, status } = await this.client.get(url, {
      responseType: 'blob'
    });
    this.openFile(data, status, 'application/octet-stream', resourceId);
  }

  async getHistoryVersion(orgId: number, moduleId: number, resourceId: string, version: number) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/resource/${resourceId}/version/${version}`;
    return await this.client.get(url, {
      responseType: 'text'
    });
  }

  async getMoreInfo(orgId: number, moduleId: number, moduleName: string, resourceId: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/extradata_info`;
    return await this.client.get(url);
  }

  async downloadShaFile(orgId: number, moduleId: number, resourceId: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/mobile_apps/resource/${resourceId}/binary_file`;
    return await this.client.get(url, {
      responseType: 'blob'
    });
  }

  async deleteResourceInDetail(
    orgId: number,
    moduleId: number,
    moduleName: string,
    resourceId: string,
    data: string[]
  ) {
    const detailType = moduleName === 'credential' ? 'remove_credentials' : 'remove_cards';
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/${resourceId}/${detailType}`;
    return this.client.put(url, data);
  }

  async downloadPCAP(orgId: number, moduleId: number, resourceId: string) {
    const url = `api/v2/organization/${orgId}/module/${moduleId}/malware/resource/${resourceId}/downloadPcap`;
    return await this.client.get(url);
  }
}
