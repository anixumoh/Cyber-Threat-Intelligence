import { forkJoin as observableForkJoin, Observable } from 'rxjs';

import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { IQuerystringsParams, ThiappGateway } from './thiapp.gateway';

@Injectable()
export class CountriesService {
  resource = 'country';
  constructor(private thiappGateway: ThiappGateway) {}

  list(params: IQuerystringsParams) {
    const queryString = this.thiappGateway.getQuerystring(params);
    const url = `/${this.resource}/?${queryString}`;
    return this.thiappGateway.get({ url });
  }

  getAllCountries() {
    const limit = 100;
    return observableForkJoin(
      this.list({ page: 0, limit }),
      this.list({ page: 1, limit }),
      this.list({ page: 2, limit })
    ).pipe(
      map(responses => {
        let countries = [];
        for (const response of responses) {
          if (response.data) {
            countries = countries.concat(
              response.data.map(country => {
                return { id: country.id, ...country.attributes };
              })
            );
          }
        }
        return countries;
      })
    );
  }

  findOneById(countryId) {
    const url = `/${this.resource}/${countryId}/`;
    return this.thiappGateway.get({ url });
  }
}
