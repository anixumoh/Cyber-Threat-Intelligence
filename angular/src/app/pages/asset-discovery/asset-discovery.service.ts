import { Injectable, NgZone } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { AuthService } from 'app/services/auth.service';
import { path, HttpUtilsService, RequestOptions } from 'app/services/http-utils.service';

@Injectable({
  providedIn: 'root'
})
export class AssetDiscoveryService {
  private ongoingSearchSubject = new BehaviorSubject({});
  ongoingSearchNotifier$: Observable<any> = this.ongoingSearchSubject.asObservable();
  private eventSource: EventSource;
  isOpenSseChannel = false;

  constructor(private http: HttpUtilsService, private _zone: NgZone, private auth: AuthService) {}

  getSettings(orgId: number, type?: number): Observable<any> {
    const url = `${path}/asset-discovery/organization/${orgId}/setting${type ? `?type=${type}` : ''}`;
    return this.http.get(url);
  }

  addSetting(data, orgId): Observable<any> {
    return this.http.post(`${path}/asset-discovery/organization/${orgId}/setting`, data);
  }

  deleteSetting(data: number[], orgId: number, type: number): Observable<any> {
    const requestOptions = new RequestOptions({});
    requestOptions.responseType = 'text';
    return this.http.put(`${path}/asset-discovery/organization/${orgId}/setting/${type}`, data, requestOptions);
  }

  discover(orgId): Observable<any> {
    const url = `${path}/asset-discovery/organization/${orgId}/discover`;
    return this.http.post(url, {});
  }

  cancelDiscovery(orgId): Observable<any> {
    const url = `${path}/asset-discovery/organization/${orgId}/discover/cancel`;
    return this.http.post(url, {});
  }

  getChartData(orgId, limit): Observable<any> {
    const url = `${path}/asset-discovery/organization/${orgId}/discover?limit=${!limit}`;
    return this.http.get(url);
  }

  createConnection(url: string): EventSource {
    return new EventSource(url, { withCredentials: true });
  }

  loadTable(orgId, params): Observable<any> {
    return this.http.get(`${path}/asset-discovery/organization/${orgId}/search${params}`);
  }

  discardItems(orgId, data): Observable<any> {
    return this.http.put(`${path}/asset-discovery/organization/${orgId}/assets`, data);
  }

  getServerSentEvent(orgId): Observable<MessageEvent> {
    const url = `${path}/sse/${orgId}`;
    return new Observable((observer) => {
      this.eventSource = new EventSource(url);
      this.eventSource.addEventListener('open', () => {
        this.isOpenSseChannel = true;
      });
      this.eventSource.addEventListener('error', (e) => {
        this.isOpenSseChannel = false;
        this.eventSource.close();
      });
      this.eventSource.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        this._zone.run(() => {
          observer.next(data);
        });
      });
    });
  }

  closeSse() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  saveSettingsData(orgId, settingsId, values, modules, tag): Observable<any> {
    const url = `${path}/organization/${orgId}/settings`;
    const newValues = {
      values,
      modules,
      tag,
      type: settingsId.toUpperCase()
    };
    return this.http.post(url, newValues);
  }
}
