import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class InfoButtonService {
  constructor(private http: HttpClient) {}

  getInfo(): Observable<any> {
    return this.http.get('assets/module_info/info-module.json');
  }
}
