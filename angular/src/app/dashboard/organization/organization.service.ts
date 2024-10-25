import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError as observableThrowError, Observable, BehaviorSubject } from 'rxjs';
import { take, catchError, tap } from 'rxjs/operators';
import { HttpUtilsService, path, RequestOptions } from 'app/services/http-utils.service';
import { ModuleModel, OrganizationModel } from './models';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { getTypeDictionary } from 'app/dashboard/modules-types';
import { Store } from 'app/services/store/store';
import { SvelteService } from 'app/services/svelte.service';

@Injectable()
export class OrganizationService {
  moduleSelected: any;
  sidebarAdminSubject = new BehaviorSubject<any>(true);
  createModuleMessageSubject = new BehaviorSubject<any>(false);
  currentModules: any = null;
  currentOrganization: OrganizationModel = null;
  currentOrganizationId: number;
  currentContext = {
    currentOrganization: null,
    currentModule: null,
    currentState: null
  };

  currentContextSubject: BehaviorSubject<any>;
  currentContextObservable: Observable<any>;
  temp = Math.random();
  getcurrentModulesObservable: Observable<any>;

  private organizations: OrganizationModel[] = null;
  private organizationObservable: Observable<any>;
  private organizationSubject: BehaviorSubject<any>;
  private currentOrganizationObserver: BehaviorSubject<any>;
  private currentModule: ModuleModel;

  private getcurrentModulesSubject: BehaviorSubject<any>;

  private cacheModules: {
    current: number;
    list: ModuleModel[];
    obs: any;
    internalObs: any;
  };

  constructor(
    private http: HttpUtilsService,
    private router: Router,
    private accountService: UserAccountService,
    private store: Store,
    private svelteService: SvelteService
  ) {
    this.currentContextSubject = new BehaviorSubject<any>(this.currentContext);
    this.currentContextObservable = this.currentContextSubject.asObservable();

    this.organizationSubject = new BehaviorSubject<any>(null);
    this.organizationObservable = this.organizationSubject.asObservable();

    this.getcurrentModulesSubject = new BehaviorSubject<any>(null);
    this.getcurrentModulesObservable = this.getcurrentModulesSubject.asObservable();

    this.getOrganizations().subscribe((organizations) => {
      if (!this.currentOrganization) {
        if (this.router.url.indexOf('organizations') >= 0) {
          const url = this.router.url.split('/');
          const index = url.indexOf('organizations') + 1;
          const orgId = url[index];
          if (organizations) {
            organizations.forEach((org) => {
              if (org.id === parseInt(orgId, 10)) {
                this.setCurrentOrganization(org);
              }
            });
          }
        } else {
          if (organizations) {
            this.setCurrentOrganization(organizations[0]);
          }
        }
      }
    });
    this.currentContext.currentState = this.accountService.getCurrentState();
  }

  getResources(organizacionId = 0, moduleId = 0, params?) {
    return this.http.get(`${path}/organization/${organizacionId}/module/${moduleId}/resource`, { params });
  }

  getCreateModuleMessageSubject(): BehaviorSubject<any> {
    return this.createModuleMessageSubject;
  }

  setCreateModuleMessageSubject(name: string) {
    this.createModuleMessageSubject.next(name);
  }

  resetCreateModuleMessageSubjectToFalse() {
    this.createModuleMessageSubject.next(false);
  }

  getOrganizationsFromApi(): Observable<any> {
    const headers = new HttpHeaders().set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return this.http.get(`${path}/organization`, { headers });
  }

  getOrganizationsModulesGrants(orgId: number, modId: number): Observable<any> {
    return this.http.get(`${path}/organization/${orgId}/module/${modId}/grant`);
  }

  putOrganizationsModulesGrants(orgId: number, modId: number, body): Observable<any> {
    return this.http.put(`${path}/organization/${orgId}/module/${modId}/grant`, body);
  }

  persistOrganizations(organizations: OrganizationModel[]) {
    this.organizations = organizations;
    this.organizationSubject.next(this.organizations);
  }

  setCurrentOrganizationId(orgId: number) {
    if (orgId) {
      this.currentOrganizationId = orgId;
      if (!this.currentOrganization || this.currentOrganization.id !== orgId) {
        this.getOrganizations().subscribe((organizations) => {
          const l = organizations.filter((o) => o.id === orgId);
          if (l.length === 1) {
            this.setCurrentOrganization(l[0]);
          } else {
            throw new Error('Organization with id: ' + orgId + ' Not found');
          }
        });
      }
    } else {
      this.getOrganizations().subscribe((organizations) => {
        if (organizations.length >= 1) {
          this.setCurrentOrganization(organizations[0]);
        } else {
          throw new Error('Organization with id: ' + orgId + ' Not found');
        }
      });
    }
  }

  setCurrentOrganization(organization: OrganizationModel) {
    if (organization && (!this.currentOrganization || this.currentOrganization.id !== organization.id)) {
      this.currentOrganizationId = organization.id;
      this.currentOrganization = organization;
      this.currentContext.currentModule = {};
      this.currentContext.currentOrganization = this.currentOrganization;
      this.currentContextSubject.next(this.currentContext);
    }
  }

  getCurrentOrganization() {
    return this.currentOrganizationObserver;
  }

  getOrganizations() {
    if (!this.organizations) {
      this.updateOrganizationList();
    }
    return this.organizationObservable;
  }

  updateOrganizationList() {
    this.getOrganizationsFromApi()
      .pipe(take(1))
      .subscribe((organizations) => {
        this.persistOrganizations(organizations);
      });
  }

  refreshCacheModules(noSubscribe = false, m = undefined) {
    if (noSubscribe) {
      m.organizationId = this.currentOrganizationId;
      m.moduleName = getTypeDictionary()[m.type.toLowerCase()];
      this.currentModules.push(m);
      this.getcurrentModulesSubject.next(this.currentModules);
    } else {
      this.getModules(this.currentOrganizationId).subscribe();
    }
  }

  getCurrentModules(): Observable<any> {
    return this.getcurrentModulesObservable;
  }

  getModulesStandalone(id: number | string): Observable<any> {
    return this.http.get(`${path}/organization/${id}/module`);
  }

  getModules(id: number): Observable<ModuleModel[]> {
    return this.http.get(`${path}/organization/${id}/module`).pipe(
      tap((data: any) => {
        data.forEach((element) => {
          element.organizationId = id;
          element.moduleName = getTypeDictionary()[element.type.toLowerCase()];
        });
        this.currentModules = data;
        this.getcurrentModulesSubject.next(data);
      })
    );
  }

  createModule(organization: number, data: ModuleModel): Observable<ModuleModel> {
    return this.http.post(`${path}/organization/${organization}/module`, data).pipe(
      tap((m: any) => {
        this.store.update('roleList', 'newModule', m);
        this.svelteService.safeSendEvent('refresh-modules', organization);
      })
    );
  }

  changeCurrentModule() {
    if (this.moduleSelected.length) {
      this.setCurrentModule(this.moduleSelected[0]);
    }
  }

  setCurrentModuleId(id: number) {
    if (this.currentModules) {
      this.moduleSelected = this.currentModules.filter((e) => e.id === id);
      this.changeCurrentModule();
    } else if (this.currentModule) {
      this.setCurrentModule(this.currentModule);
    } else {
      this.getModules(this.currentOrganization.id).subscribe((modulesList) => {
        this.moduleSelected = modulesList.filter((e) => e.id === id);
        this.changeCurrentModule();
      });
    }
  }

  setCurrentModule(m: ModuleModel) {
    this.currentModule = m;
    this.currentContext.currentModule = m;
    if (this.currentContext && this.currentContextObservable) {
      this.currentContextSubject.next(this.currentContext);
    }
  }

  getCurrentContext(): Observable<any> {
    return this.currentContextObservable.pipe(
      catchError(() => {
        return observableThrowError(this.currentContext);
      })
    );
  }

  setSidebarAdmin(value: boolean) {
    this.sidebarAdminSubject.next(value);
  }

  getSidebarAdmin() {
    return this.sidebarAdminSubject;
  }

  getAllowedModules(id: number): Observable<ModuleModel[]> {
    return this.http.get(`${path}/moduletype/organization/${id}`);
  }

  downloadReport(month, year) {
    const downloadPath = `${path}/organization/${this.currentOrganization.id}/terms/report/${year}/${month}`;
    return this.http.getFileBinary(downloadPath);
  }

  downloadReportFromDates(queryParams: any) {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParams });
    const downloadPath = `${path}/organization/${this.currentOrganization.id}/terms/report`;
    return this.http.getFileBinary(downloadPath, requestOptions);
  }

  downloadBotnetReport(month, year, currentModuleId?) {
    const downloadPath = `${path}/organization/${this.currentOrganization.id}/module/${
      currentModuleId ? currentModuleId : this.currentModule.id
    }/credential/report/${year}/${month}`;
    return this.http.getFileBinary(downloadPath);
  }

  downloadBotnetReportFromDates(queryParams: any, currentModuleId?: any) {
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromString: queryParams });
    const downloadPath = `${path}/organization/${this.currentOrganization.id}/module/${
      currentModuleId ? currentModuleId : this.currentModule.id
    }/credential/report`;
    return this.http.getFileBinary(downloadPath, requestOptions);
  }

  getCountry(): Observable<any> {
    return this.http.get(`${path}/user/country`);
  }

  accessedDashboard(): Observable<any> {
    return this.http.get(`${path}/organization/${this.currentOrganization.id}/dashboard`);
  }

  getPlugins(): Observable<any> {
    return this.http.get(`${path}/plugin/available`);
  }
}
