import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';

@Injectable()
export class IndicatorsService {
  resource = 'indicator';
  constructor(private thiappGateway: ThiappGateway) {}

  list(params: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  getGenericDetails({ type, id, extension, params }): Observable<any> {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${type}/${id}/${extension}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  details({ type, id }) {
    return this.thiappGateway.get({ url: `/${type}/${id}/` });
  }

  getOptions() {
    return this.thiappGateway.options({ url: `/${this.resource}/` });
  }
}
