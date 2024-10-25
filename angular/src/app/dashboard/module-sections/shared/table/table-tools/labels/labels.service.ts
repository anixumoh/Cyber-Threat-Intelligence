import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpUtilsService, path } from 'app/services/http-utils.service';

@Injectable()
export class LabelService {
  constructor(private httpUtils: HttpUtilsService) {}

  createLabel(
    name: string = '',
    textColorStr: string = '',
    bgColorStr: string = '',
    moduleId: number = 0,
    organizationId: number = 0
  ): Observable<any> {
    let data = {
      label: name,
      moduleId: moduleId,
      labelTypeId: 2,
      textColorStr: textColorStr,
      bgColorStr: bgColorStr,
      labelProtectedStr: false,
      prioritized: false,
    };

    return this.httpUtils.post(`${path}/organization/${organizationId}/label`, data).pipe(map(this.extractData));
  }

  editLabel(
    id: number = 0,
    name: string = '',
    textColorStr: string = '',
    bgColorStr: string = '',
    moduleId: number = 0,
    organizationId: number = 0
  ): Observable<any> {
    let data = {
      label: name,
      moduleId: moduleId,
      labelTypeId: 2,
      textColorStr: textColorStr,
      bgColorStr: bgColorStr,
      labelProtectedStr: false,
      prioritized: false,
    };

    return this.httpUtils.put(`${path}/organization/${organizationId}/label/${id}`, data).pipe(map(this.extractData));
  }

  private extractData(res) {
    return res.label || {};
  }
}
