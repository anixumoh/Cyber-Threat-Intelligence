import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';

@Injectable()
export class LabelsService {
  constructor(private http: HttpUtilsService) {}

  getLabel(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/label`, requestOptions);
  }

  getLabelId(id): Observable<any> {
    return this.http.get(`${path}/label/${id}`);
  }

  getOrgLabels(id, moduleLabels): Observable<any> {
    return this.http.get(`${path}/label/organization/${id}?moduleLabels=${moduleLabels}`);
  }

  create(data): Observable<any> {
    return this.http.post(`${path}/label`, data);
  }

  createType(data): Observable<any> {
    return this.http.post(`${path}/label/type`, data);
  }

  edit(data): Observable<any> {
    return this.http.put(`${path}/label/${data.id}`, data);
  }
  editType(data): Observable<any> {
    return this.http.put(`${path}/label/type/${data.id}`, data);
  }

  delete(data): Observable<any> {
    return this.http.delete(`${path}/label/${data.id}`);
  }

  deleteType(data): Observable<any> {
    return this.http.delete(`${path}/label/type/${data.id}`);
  }

  getType(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParam });
    return this.http.get(`${path}/label/type`, requestOptions);
  }

  getGlobalLabels() {
    return this.http.get(`${path}/filter/global`);
  }
}
