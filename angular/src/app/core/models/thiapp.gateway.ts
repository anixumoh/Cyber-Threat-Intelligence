import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Gateway } from './gateway';
import { Observable } from 'rxjs';

export interface IQuerystringsParams {
  page?: number;
  searchValue?: string;
  searchField?: string;
  filterValue?: string;
  filterField?: string;
  limit?: number;
  dork?: string;
  sort?: string;
}

@Injectable()
export class ThiappGateway {
  apiId = 'THIAPP';

  constructor(private gateway: Gateway) {}

  get({ url, options }: { url: string; options?: any }): Observable<any> {
    const { apiId } = this;
    return this.gateway.get({ url: this.getUrl(url), apiId, options });
  }

  options({ url }: { url: string }): Observable<any> {
    const { apiId } = this;
    return this.gateway.options({ url: this.getUrl(url), apiId });
  }

  post({ url, data }: { url: string; data: any }): Observable<any> {
    const { apiId } = this;
    return this.gateway.post({ url: this.getUrl(url), apiId, data });
  }

  delete({ url, data }: { url: string; data: any }) {
    const { apiId } = this;
    return this.gateway.delete({ url: this.getUrl(url), apiId, data });
  }

  getQuerystring(params: IQuerystringsParams & { dork?: string; pid?: string; search?: string; category?: string }) {
    const { limit, page, searchField, searchValue, filterField, filterValue, ...rest } = params;
    let query = {};
    if (limit) {
      query['page'] = { limit };
      if (page) {
        query['page']['offset'] = page * limit;
      }
    }
    if (searchValue && searchField) {
      query['fuzzy_filter'] = { [searchField]: searchValue };
    }
    if (filterField && filterValue) {
      query['filter'] = { [filterField]: filterValue };
    }

    if (!rest.dork) {
      delete rest.dork;
    }

    query = { ...query, ...rest };
    let urlParams = new HttpParams();

    Object.entries(query).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const name = key;
        Object.entries(value).forEach(([key, value]) => {
          urlParams = urlParams.set(`${name}[${key}]`, value);
        });
      } else if (typeof value === 'string') {
        urlParams = urlParams.set(key, value);
      }
    });

    return urlParams.toString();
  }

  private getUrl(url, api = '/api/v1') {
    return /^http/.test(url) ? url : `${api}${url}`;
  }
}
