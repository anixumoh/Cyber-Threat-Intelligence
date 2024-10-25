import { Injectable } from '@angular/core';
import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';

@Injectable()
export class ToolsService {
  resource = 'tool';
  constructor(private thiappGateway: ThiappGateway) {}

  list(params: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/?${queryString}`;
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
}
