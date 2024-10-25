import { Injectable } from '@angular/core';
import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';

@Injectable()
export class RegionsService {
  resource = 'region';
  constructor(private thiappGateway: ThiappGateway) {}

  getCountriesById(regionId, params: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/${regionId}/country/?${queryString}`;
    return this.thiappGateway.get({ url });
  }
}
