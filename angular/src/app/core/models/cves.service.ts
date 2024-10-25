import { Injectable } from '@angular/core';
import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class CvesService {
  resource = 'cve';

  constructor(private thiappGateway: ThiappGateway, private http: HttpUtilsService) {}

  list(params: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  getRelations({ id, relation, params }) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/${id}/${relation}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  details({ id }) {
    return this.thiappGateway.get({ url: `/${this.resource}/${id}/` });
  }

  getOptions() {
    return this.thiappGateway.options({ url: `/${this.resource}/` });
  }

  getApiDetails(orgId, moduleId, resourceId) {
    return this.http.get(`${path}/organization/${orgId}/module/${moduleId}/explorer/resource/cves/${resourceId}`);
  }
}
