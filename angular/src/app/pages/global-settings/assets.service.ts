import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class AssetsService {
  private errorSubject = new BehaviorSubject({});
  // tslint:disable-next-line: member-ordering
  errorNotifier$: Observable<any> = this.errorSubject.asObservable();

  constructor(private http: HttpUtilsService) {}

  getSettings(orgId, params): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: params });

    return this.http.get(`${path}/organization/${orgId}/settings`, requestOptions).pipe();
  }

  getTags(orgId): Observable<any> {
    return this.http.get(`${path}/organization/${orgId}/settings/tags`);
  }

  editTags(orgId, data): Observable<any> {
    const object = { wordIds: data.wordIds, tag: data.tag };
    return this.http.post(`${path}/organization/${orgId}/settings/tags`, object).pipe();
  }

  editElement(orgId, data): Observable<any> {
    const obj = data;
    delete obj.wordIds;

    return this.http.post(`${path}/organization/${orgId}/settings/edit`, obj).pipe();
  }

  saveSettingsData(orgId: number, obj: any): Observable<any> {
    const url = `${path}/organization/${orgId}/settings`;
    const { data: values, modules, tag, settingType } = obj;
    const newValues = {
      values,
      modules: modules.map(({ id }: any) => id),
      tag,
      type: settingType.toUpperCase()
    };
    return this.http.post(url, newValues);
  }

  saveSettingsImage(orgId: number, obj: any) {
    const url = `${path}/organization/${orgId}/settings/image`;
    const formData = new FormData();
    const { image, modules, searchPhrase, tag, settingType: type } = obj;
    const value = {
      type,
      modules: modules.map(({ id }: any) => id),
      tag,
      values: searchPhrase
    } as any;
    formData.append('value', JSON.stringify(value));
    if (image) {
      formData.append('image', image);
    }
    return this.http.postMultipartNoXhr(url, formData);
  }

  getCompanies(orgId, modId, search): Observable<any> {
    const url = `${path}/cpe/vendors?vendor=${search}`;
    return this.http.get(url);
  }

  getProductsByCompany(orgId, modId, vendor, search, deprecated): Observable<any> {
    const url = `${path}/cpe/vendors/${vendor}/products?includeDeprecateds=${deprecated}&product=${search}`;
    return this.http.get(url);
  }

  getVersionsByProduct(orgId, modId, company, product, search, deprecated): Observable<any> {
    const url = `${path}/cpe/vendors/${company}/products/${product}/versions?version=${search}&includeDeprecateds=${deprecated}`;
    return this.http.get(url);
  }

  deleteSetting(orgId, modules, settingsId, valuesToDelete): Observable<any> {
    const deletedValues = {
      values: valuesToDelete,
      type: settingsId.toUpperCase(),
      modules
    };
    const url = `${path}/organization/${orgId}/settings`;
    return this.http.put(url, deletedValues);
  }

  setErrorSubject(action, type, data) {
    this.errorSubject.next({ action, type, data });
  }

  getTotalSettings(orgId, enabled: boolean | null) {
    const params = enabled !== null ? `?enabled=${enabled}` : '';
    const url = `${path}/organization/${orgId}/settings/analytics${params}`;
    return this.http.get(url);
  }

  downloadTotalSettings(orgId) {
    const options = new RequestOptions({});
    options.responseType = 'arraybuffer';
    const url = `${path}/organization/${orgId}/settings/analytics/export`;
    return this.http.get(url, options);
  }
}
