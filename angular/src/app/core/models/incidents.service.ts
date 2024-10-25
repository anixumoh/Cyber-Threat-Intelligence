import { Injectable } from '@angular/core';
import { HttpUtilsService, path } from '../../services/http-utils.service';

@Injectable()
export class IncidentsService {
  constructor(private http: HttpUtilsService) {}

  list(organizationId, moduleId, moduleType, queryParams) {
    const headers = { params: queryParams };
    return this.http.get(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/issue/list`,
      headers
    );
  }

  store(item: StoreIncidentDTO, organizationId, moduleId) {
    return this.http.post(`${path}/organization/${organizationId}/module/${moduleId}/issue`, item);
  }

  destroy({ orgId, moduleId, issueId }) {
    return this.http.delete(`${path}/organization/${orgId}/module/${moduleId}/issue/${issueId}`);
  }

  getByResourceId(resourceId, organizationId, moduleId, moduleType) {
    return this.http.get(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/${resourceId}/issue`
    );
  }

  assignToResource(resourcesId: number[], issueId, organizationId, moduleId) {
    return this.http.post(`${path}/organization/${organizationId}/module/${moduleId}/issue/${issueId}`, {
      resourcesId
    });
  }

  assignToResources(resourcesId: number[], issueId, organizationId, moduleId) {
    return this.http.post(`${path}/organization/${organizationId}/module/${moduleId}/issue/${issueId}`, {
      resourcesId
    });
  }

  unAssignToResource(resourceId: number, issueId, organizationId, moduleId, moduleType) {
    return this.http.delete(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/${resourceId}/issue/${issueId}`
    );
  }

  changeStatus({ orgId, moduleId, issueId, status, body }) {
    return this.http.postMultipart(`${path}/organization/${orgId}/module/${moduleId}/issue/${issueId}/${status}`, body);
  }
}

export interface StoreIncidentDTO {
  title: string;
  typeId?: string;
  description?: string;
  remediationTips?: string;
  username?: string;
}
