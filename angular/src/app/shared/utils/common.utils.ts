import { HttpHeaders, HttpParams } from '@angular/common/http';
import { RequestOptions } from 'app/services/http-utils.service';

export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY'
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

export function getRequestOptions(params: any, headers?: HttpHeaders) {
  const requestOptions = new RequestOptions();
  if (params) {
    requestOptions.params = new HttpParams({ fromObject: params });
  }
  if (headers) {
    requestOptions.headers = headers;
  }
  return requestOptions;
}

// verify size of the files (< 20mb)
export function beforeUpload(file) {
  return file.size / 1024 / 1024 < 20;
}

export type TcxTypes =
  | 'actors'
  | 'indicators'
  | 'cves'
  | 'signatures'
  | 'malwareHunting'
  | 'campaigns'
  | 'tools'
  | 'attackPatterns'
  | 'intelReports';
