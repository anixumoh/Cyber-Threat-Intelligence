import { Injectable } from '@angular/core';
import { HttpUtilsService, path } from '../../services/http-utils.service';

@Injectable()
export class LabelsService {
  constructor(private http: HttpUtilsService) {}

  list(organizationId, moduleId, moduleType, defaultDay, moduleLabels = true) {
    const labelsPath =
      moduleId && moduleType
        ? `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/label?days=${defaultDay}`
        : `${path}/label/organization/${organizationId}?moduleLabels=${moduleLabels}&days=${defaultDay}`;
    return this.http.get(labelsPath);
  }

  store(body) {
    return this.http.post(`${path}/label`, body);
  }

  update(id, body) {
    return this.http.put(`${path}/label/${id}`, body);
  }

  assignToResources(organizationId, moduleId, moduleType, body) {
    return this.http.put(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/label`,
      body
    );
  }

  assignToIncident(organizationId, moduleId, body) {
    return this.http.put(`${path}/organization/${organizationId}/module/${moduleId}/issue/label`, body);
  }

  destroy(id) {
    return this.http.delete(`${path}/label/${id}`);
  }
}
