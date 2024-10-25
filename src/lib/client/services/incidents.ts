import type Module from '$lib/types/module';
import type { IncidentStatusType } from '$lib/types';
import type { ThreatSearchType } from '$lib/types/threat';
import { parseIncidentResource } from '$lib/utils/parseData';
import axios, { type CancelTokenSource } from 'axios';
import Service from '.';
import type { GenericResponseType } from './types';
import { getSinceOrToDate } from '$lib/utils/functions';

export type Incident = {
  id: number;
  title: string;
  description: string;
  typeId: string;
  typeName: string;
  remediationTips: string;
  status: string;
  risk: string;
  activities: number;
  creation_date: number;
  notification_date: number;
  changed_at: number;
  last_update_user: string;
  module_id: number;
  organization_id: number;
  labels: IncidentLabel[];
  notifications: IncidentNotification[];
  currentIncompleteNotification?: CurrentIncompleteNotification;
  user?: { username: string };
};

export interface CurrentIncompleteNotification {
  id: number;
  incidents_id: number;
  activities: IncidentNotificationActivity[];
  resources: IncidentResource[];
  attachments: any[];
}

export interface IncidentNotificationActivity {
  id: number;
  incidents_id: number;
  title: string;
  content: string;
  creation_date: number;
  creation_user: string;
  last_update_user: string;
}

export type IncidentLabel = {
  id: number;
  label: string;
  background_color: number;
  text_color: number;
};

export type IncidentNotification = {
  id: number;
  incidents_id: number;
  notification_date: number;
  notification_user: string;
  activities: IncidentNotificationActivity[];
  resources: IncidentResource[];
  attachments: NotificationAttachment[];
};

export type NotificationAttachment = {
  id: number;
  content_type: string;
  incident_notification_id: number;
  original_name: string;
};

export type IncidentResource = {
  id: number;
  url: string;
  title: string;
  content_type: string;
  language: string;
  countries_id?: string;
  source_type: string;
  resource_type: string;
  organization_id: number;
  module_id: number;
  analysis_result: string;
  analysis_user_result?: string;
  analysis_calc_result: string;
  read: boolean;
  fav: string;
  issued: boolean;
  user_rating?: number;
  labels: IncidentResourceLabel[];
  created_at: number;
  checked_at: number;
  changed_at: number;
  incidentStatus: 'OPEN' | 'RESOLVED';
};

export type IncidentResourceLabel = {
  id: number;
  label: string;
  background_color: number;
  text_color: number;
  organization_id: number;
  module_id: number;
};

export type IncidentType = {
  value: string;
  label: string;
};

export default class IncidentsService extends Service {
  cancelTokenGetAllIncidents: CancelTokenSource;
  cancelTokenGetIncidents: CancelTokenSource;
  abort() {
    this.cancelTokenGetAllIncidents?.cancel();
    this.cancelTokenGetIncidents?.cancel();
  }

  #getCommonFilters(filters: ThreatSearchType) {
    const params: any = {};

    if (filters.filters.status !== undefined) {
      params.status = filters.filters.status;
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
    return params;
  }

  #getFiltersForResources(filters: ThreatSearchType) {
    // targeted, userSubmitted
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

    if (filters.since) {
      params.since = getSinceOrToDate(filters.since).valueOf();
    }

    if (filters.to) {
      params.to = getSinceOrToDate(filters.to, false).valueOf();
    }

    return params;
  }

  async getOrgIncidents(orgId: number, params?: any) {
    this.cancelTokenGetAllIncidents?.cancel();
    this.cancelTokenGetAllIncidents = axios.CancelToken.source();

    const url = `api/v2/organization/${orgId}/issue/summary`;
    return this.client.get(url, params ? { params } : {});
  }

  async list(orgId: number, moduleId: number, moduleName: string, filters: ThreatSearchType) {
    this.cancelTokenGetIncidents?.cancel();
    this.cancelTokenGetIncidents = axios.CancelToken.source();
    const params = this.#getFiltersForResources(filters);
    const url = `api/v2/organization/${orgId}/module/${moduleId}/${moduleName}/resource/issue/list`;
    const response = await this.client.get<{ total: number; items: any[] }>(url, {
      params,
      cancelToken: this.cancelTokenGetIncidents.token
    });

    const total = response.data.total;
    const incidents = response.data.items.map((item) => parseIncidentResource(item));
    return {
      total,
      incidents
    };
  }

  async changeStatus(orgId: number, moduleId: number, issueId: number, status: IncidentStatusType, body: any) {
    return await this.client.post(`api/v2/organization/${orgId}/module/${moduleId}/issue/${issueId}/${status}`, body);
  }

  async destroy(orgId: number, moduleId: number, issueId: number) {
    return await this.client.delete(`api/v2/organization/${orgId}/module/${moduleId}/issue/${issueId}`);
  }

  async toggleLabel(orgId: number, moduleId: number, body: any) {
    return await this.client.put(`api/v2/organization/${orgId}/module/${moduleId}/issue/label`, body);
  }

  async getIncident(orgId: number, moduleId: number, incidentId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}`;
    const response = await this.client.get<Incident>(url, { params: { extraFields: true } });
    return response.data;
  }

  async saveIncident(orgId: number, moduleId: number, incident: Incident) {
    const data = {
      id: incident.id,
      title: incident.title,
      typeId: incident.typeId,
      description: incident.description,
      remediationTips: incident.remediationTips,
      risk: incident.risk
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue`;
    const response = await this.client.put(url, data);
    return response.data;
  }

  async assignIncident(orgId: number, moduleId: number, incidentId: number, username: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/assign`;
    const data = username ? { username } : {};
    const response = await this.client.post<GenericResponseType>(url, data);
    return response.data;
  }

  async getIncidentTypes(orgId: number, module: Module) {
    const url = `/api/v2/organization/${orgId}/module/${module.id}/${module.moduleName}/resource/issue/types`;
    const response = await this.client.get<IncidentType[]>(url, { params: { extraFields: true } });
    return response.data;
  }

  async deleteIncidentActivity(orgId: number, moduleId: number, incidentId: number, activityId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/activity/${activityId}`;
    await this.client.delete<GenericResponseType>(url);
  }

  async markResourceIssueAs(
    orgId: number,
    module: Module,
    resourceId: number,
    incidentId: number,
    type: 'OPEN' | 'RESOLVED'
  ) {
    const payload = { type };
    const url = `/api/v2/organization/${orgId}/module/${module.id}/${module.moduleName}/resource/${resourceId}/issue/${incidentId}/markAs`;
    await this.client.post<GenericResponseType>(url, payload);
  }

  async attachFileToNotification(
    orgId: number,
    moduleId: number,
    incidentId: number,
    notificationId: number,
    file: File
  ) {
    const formData = new FormData();
    formData.append('file', file);

    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/attachment/${notificationId}`;
    await this.client.postForm<GenericResponseType>(url, formData);
  }

  async deleteNotificationAttachment(orgId: number, moduleId: number, incidentId: number, notificationId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/attachment/${notificationId}`;
    await this.client.delete<GenericResponseType>(url);
  }

  async getNotificationAttachment(orgId: number, moduleId: number, incidentId: number, notificationId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/attachment/${notificationId}`;
    return await this.client.get<Blob>(url, { responseType: 'blob' });
  }

  async generateReport(orgId: number, moduleId: number, incidentId: number, emails: string, language: string) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/report`;
    const params = {
      emails,
      language
    };
    const response = await this.client.get<GenericResponseType>(url, { params });
    return response.data;
  }

  async getRecipients(orgId: number, moduleId: number) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/recipients`;
    const response = await this.client.get<string[]>(url);
    return response.data;
  }

  async sendNotify(orgId: number, moduleId: number, incidentId: number, recipients: string, file?: File) {
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/NOTIFIED`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('recipients', recipients);
    await this.client.postForm(url, formData);
  }

  async newActivity(orgId: number, moduleId: number, incidentId: number, title: string, content: string) {
    const data = {
      title,
      content
    };
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/activity`;
    await this.client.post(url, data);
  }

  async closeIncident(orgId: number, moduleId: number, incidentId: number) {
    const formData = new FormData();
    formData.append('file', undefined);
    formData.append('recipients', undefined);
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/CLOSED`;
    await this.client.postForm(url, formData);
  }

  async openIncident(orgId: number, moduleId: number, incidentId: number) {
    const formData = new FormData();
    formData.append('file', undefined);
    formData.append('recipients', undefined);
    const url = `/api/v2/organization/${orgId}/module/${moduleId}/issue/${incidentId}/OPEN`;
    await this.client.postForm(url, formData);
  }
}
