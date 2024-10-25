import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpUtilsService, path } from 'app/services/http-utils.service';

@Injectable()
export class DashboardService {
  constructor(private http: HttpUtilsService) {}

  getOrganizations(): Observable<any> {
    const headers = new HttpHeaders().set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return this.http.get(`${path}/organization`, { headers });
  }
}
