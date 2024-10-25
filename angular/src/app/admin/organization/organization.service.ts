import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpUtilsService, path, RequestOptions } from '../../services/http-utils.service';
import { SvelteService } from 'app/services/svelte.service';

@Injectable()
export class OrganizationService {
  constructor(private http: HttpUtilsService, private svelteService: SvelteService) {}

  getOrganizations(queryParam?): Observable<any> {
    const requestOptions = new RequestOptions();
    requestOptions.headers = new HttpHeaders().set('Cache-Control', 'no-cache, no-store, must-revalidate');
    requestOptions.params = new HttpParams({ fromString: queryParam });

    return this.http.get(`${path}/organization?extraFields=true`, requestOptions);
  }

  _refreshOrganizations() {
    return this.svelteService.safeSendEvent('refresh-organization');
  }

  _refreshModules(orgId: number) {
    return this.svelteService.safeSendEvent('refresh-modules', orgId);
  }

  create(data): Observable<any> {
    return this.http.post(`${path}/organization`, data).pipe(
      catchError((e) => this.handleErrorMessage(e)),
      tap(() => this._refreshOrganizations())
    );
  }

  createModuleOrg(id, data): Observable<any> {
    return this.http.post(`${path}/organization/${id}/module`, data).pipe(tap(() => this._refreshModules(id)));
  }

  getCountry(): Observable<any> {
    return this.http.get(`${path}/user/country`);
  }

  getGrantModule(idOrg, idMod): Observable<any> {
    return this.http.get(`${path}/organization/${idOrg}/module/${idMod}/grant`);
  }

  setGrantModule(idOrg, idMod, grants): Observable<any> {
    return this.http.put(`${path}/organization/${idOrg}/module/${idMod}/grant`, grants);
  }

  getIndustry(): Observable<any> {
    return this.http.get(`${path}/industry`);
  }

  delete(data): Observable<any> {
    return this.http.delete(`${path}/organization/${data.id}`).pipe(tap(() => this._refreshOrganizations()));
  }

  enabled(data): Observable<any> {
    return this.http
      .patch(`${path}/organization/${data.id}`, { enabled: data.enabled })
      .pipe(tap(() => this._refreshOrganizations()));
  }

  createModule(id, data): Observable<any> {
    return this.http.post(`${path}/organization/${id}/module`, data).pipe(tap(() => this._refreshModules(id)));
  }

  editModule(idOrg, data): Observable<any> {
    return this.http
      .put(`${path}/organization/${idOrg}/module/${data.id}?extraFields=true`, data)
      .pipe(tap(() => this._refreshModules(idOrg)));
  }

  editOrganization(data): Observable<any> {
    return this.http
      .put(`${path}/organization/${data.id}`, {
        trialExpirationDate: data.trialExpirationDate,
        customerId: data.customerId,
        enabledMfa: data.enabledMfa,
        contact: data.contact,
        name: data.name,
        enabled: data.enabled,
        userWorkedOn: data.userWorkedOn,
        trial: data.trial
      })
      .pipe(
        catchError((e) => this.handleErrorMessage(e)),
        tap(() => this._refreshOrganizations())
      );
  }

  deleteModule(idOrg, idMod): Observable<any> {
    return this.http
      .delete(`${path}/organization/${idOrg}/module/${idMod}`)
      .pipe(tap(() => this._refreshModules(idOrg)));
  }

  getSingleModule(orgId, moduleId): Observable<any> {
    return this.http.get(`${path}/organization/${orgId}/module/${moduleId}/export`);
  }

  getModulesByOrg(orgId, queryParam?): Observable<any> {
    const headers: any = { params: queryParam };
    return this.http.get(`${path}/organization/${orgId}/module`, headers);
  }

  getGrantByOrg(orgId): Observable<any> {
    return this.http.get(`${path}/organization/${orgId}/grant`);
  }

  putGrantByOrg(orgId, grants): Observable<any> {
    return this.http.put(`${path}/organization/${orgId}/grant`, grants);
  }

  getModuleType() {
    return this.http.get(`${path}/moduletype`);
  }

  getDataGen() {
    return this.http.get(`${path}/chart/admin/datagen`);
  }

  getParamsGen(idChartGen) {
    return this.http.get(`${path}/chart/admin/datagen/${idChartGen}/params`);
  }

  getBlacklistList(orgId, queryParam?) {
    const headers: any = { params: queryParam };
    return this.http.get(`${path}/organization/${orgId}/blacklist`, headers);
  }

  editBlacklist(orgId, element) {
    return this.http.put(`${path}/organization/${orgId}/blacklist/${element.id}`, {
      url: element.url
    });
  }

  addElementBlacklist(orgId, element) {
    return this.http.post(`${path}/organization/${orgId}/blacklist`, { url: element.url });
  }

  deleteBlacklistElement(orgId, element) {
    return this.http.delete(`${path}/organization/${orgId}/blacklist/${element.id}`);
  }

  runSearch(orgId, modId) {
    return this.http.get(`${path}/organization/${orgId}/module/${modId}/execute`);
  }

  syncOrg(orgId, customerId) {
    return this.http
      .get(`${path}/admin/customer/${customerId}/organization/${orgId}/sync`)
      .pipe(tap(() => this._refreshModules(orgId)));
  }

  importModule(orgId, formData) {
    const allPath = `${path}/organization/${orgId}/module/import`;
    return this.http.postMultipart(allPath, formData).pipe(
      tap({
        complete: () => this._refreshModules(orgId)
      })
    );
  }

  getAllowedModules(id: number, isFromCustomer = false): Observable<any> {
    const url = `${path}/moduletype/${isFromCustomer ? 'customer' : 'organization'}/${id}`;
    return this.http.get(url);
  }

  downloadOrg(id): Observable<any> {
    const options = new RequestOptions({});
    options.responseType = 'arraybuffer';
    return this.http.get(`${path}/organization/${id}/module/export`, options);
  }

  exportSettings(): Observable<any> {
    return this.http.getFileBinary(`${path}/admin/settings_report`);
  }

  getInstanceSettings(): Observable<any> {
    return this.http.get(`${path}/chart/default/settings-per-instance`);
  }

  getPlugins(): Observable<any> {
    return this.http.get(`${path}/plugin/available`);
  }

  getModulePlugins(orgId, moduleId): Observable<any> {
    return this.http.get(`${path}/organization/${orgId}/module/${moduleId}/custom/plugins`);
  }

  handleErrorMessage(error: HttpResponse<any> | any) {
    let errorMessage = '';
    if (error && error.error) {
      if (typeof error.error === 'string') {
        errorMessage = 'There was an error trying to update the organization. Please, tray again later.';
      }
      if (error.error.field) {
        errorMessage = error.error.field;
      }
    }
    return throwError(errorMessage);
  }
}
