import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class ActorsService {
  resource = 'threat-actor';
  searchText: string;

  constructor(private thiappGateway: ThiappGateway, private http: HttpUtilsService) {}

  get searchValue(): string {
    return this.searchText;
  }

  set searchValue(v: string) {
    this.searchText = v;
  }

  list(params: IQuerystringsParams): Observable<any> {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  targetsList({ limit, page, searchField, searchValue, actorId }: IQuerystringsParams & { actorId: number }) {
    const queryString = this.thiappGateway.getQuerystring({ limit, page, searchField, searchValue });
    const url = `/${this.resource}/${actorId}/target/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  getIOCs(data: IQuerystringsParams & { actorId: number }) {
    return this.getOthersDetails('ioc', data);
  }

  getTools(data: IQuerystringsParams & { actorId: number }) {
    return this.getOthersDetails('tool', data);
  }

  getAttackPatterns(data: IQuerystringsParams & { actorId: number }) {
    return this.getOthersDetails('attack-pattern', data);
  }

  getSignatures(data: IQuerystringsParams & { actorId: number }) {
    return this.getOthersDetails('signature', data);
  }

  getCampaings(data: IQuerystringsParams & { actorId: number }) {
    return this.getOthersDetails('campaign', data);
  }

  getOthersDetails(detail, { limit, page, actorId, sort }: IQuerystringsParams & { actorId: number }) {
    const queryString = this.thiappGateway.getQuerystring({ limit, page, sort });
    const url = `/${this.resource}/${actorId}/${detail}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  details(id) {
    return this.thiappGateway.get({ url: `/${this.resource}/${id}/` });
  }

  getOptions() {
    return this.thiappGateway.options({ url: `/${this.resource}/` });
  }

  getRelations({ id, relation, params }) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/${id}/${relation}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  getReport(orgId, moduleId, body) {
    const options = new RequestOptions({});
    options.responseType = 'blob';
    return this.http.post(
      `${path}/organization/${orgId}/module/${moduleId}/threat_context/threat_actors/report`,
      body,
      options
    );
  }
}
