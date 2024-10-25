import { Injectable } from '@angular/core';
import { of as observableOf, Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import { HttpParams } from '@angular/common/http';
import { path, HttpUtilsService, RequestOptions } from 'app/services/http-utils.service';
import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { Details } from './threat-detail.service';

// TODO: Change "1" in all paths to organizationId private variable (inside a service)

@Injectable()
export class ResourcesService {
  malwareResource: any = {};
  totalResources = 0;
  numPages = 0;
  maxRowsDefault = 10;
  issuesTypes = {};
  _moduleName: any;
  activeOrganization: any;
  activeModule: any;
  contextOservable: any;
  CVE_Navigation = { list: [] };
  analysisCalculResult = [
    { label: 'POSITIVE', analysisState: 0, selected: true },
    { label: 'NEGATIVE', analysisState: 1, selected: true },
    { label: 'INFORMATIVE', analysisState: 2, selected: true },
    { label: 'NOT_IMPORTANT', analysisState: 3, selected: false }
  ];
  pagination: string;
  filters: string;
  timestamp: string;
  analysisCalcResult: string;
  externalParameters = { update: false };
  refreshExternalParams = new BehaviorSubject(this.externalParameters);
  getResourceIssue = new BehaviorSubject({});
  updateThreatsTableSubject: Observable<any>;
  private updateThreatsTableBehavior = new BehaviorSubject({ length: null, resourceId: null });
  private labels = {};

  constructor(private httpUtils: HttpUtilsService, private organizationService: OrganizationService) {
    this.updateThreatsTableSubject = this.updateThreatsTableBehavior as Observable<any>;
    this.contextOservable = this.organizationService.getCurrentContext().subscribe((context) => {
      if (context.currentOrganization && context.currentModule && context.currentModule.id) {
        this.activeOrganization = context.currentOrganization;
        this.activeModule = context.currentModule;
      }
    });
  }

  getResourceForDetails(details: Details): Observable<any> {
    const requestPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${details.moduleId}/${details.moduleName}/resource`;

    const queryParams = Object.entries(details.filters)
      .map(([key, value]) => {
        if (key === 'page') {
          return `page=${details.page}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value as any)}`;
      })
      .join('&');
    return this.httpUtils.get(`${requestPath}?${queryParams}`);
  }

  getExplorerResources(orgId, moduleId, params?): Observable<any> {
    Object.keys(params).forEach((key) => (!params[key] ? delete params[key] : {}));
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromObject: params });

    const url = `${path}/organization/${orgId}/module/${moduleId}/explorer/resource/cves`;
    return this.httpUtils.get(url, requestOptions);
  }
  setNavigableCVEsData(list, addToList = false, replaceList = false) {
    if (addToList) {
      this.CVE_Navigation.list = this.CVE_Navigation.list.concat(list);
    }
    if (replaceList) {
      this.CVE_Navigation.list = list;
    }
  }
  getExplorerTerms(orgId, moduleId): Observable<any> {
    const url = `${path}/organization/${orgId}/module/${moduleId}/explorer/resource/cves/terms`;
    return this.httpUtils.get(url);
  }
  changePriority(orgId, moduleId, data): Observable<any> {
    const url = `${path}/organization/${orgId}/module/${moduleId}/explorer/resource/cves`;

    return this.httpUtils.patch(url, { resources: data.resources, priority: data.priority });
  }

  deleteExplorerItems(orgId, moduleId, data): Observable<any> {
    const url = `${path}/organization/${orgId}/module/${moduleId}/explorer/resource/cves`;

    return this.httpUtils.put(url, data.resources);
  }

  getExportSelectedFile(organizationId, moduleId, moduleName, items?) {
    const exportArrId = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/export`;
    const arrOfItems = items
      .map((a) => a.id)
      .toString()
      .split(',');
    const arrID = '[' + arrOfItems + ']';
    this.httpUtils.postCSV(exportArrId, arrID).subscribe(() => {});
  }

  exportExplorerResources(organizationId, moduleId, moduleName, items) {
    const arrID = '[' + items + ']';
    const url = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/cves/export`;
    return this.httpUtils.postCSV(url, arrID);
  }

  exportAllExplorerResource(organizationId, moduleId, params) {
    Object.keys(params).forEach((key) => (!params[key] ? delete params[key] : {}));
    const requestOptions = new RequestOptions();
    requestOptions.params = new HttpParams({ fromObject: params });

    const url = `${path}/organization/${organizationId}/module/${moduleId}/explorer/resource/cves/export/all`;

    return this.httpUtils.getFileBinary(url, requestOptions);
  }

  handleFollowUp({ orgId, moduleId, resourceId }) {
    return this.httpUtils
      .put(`${path}/organization/${orgId}/module/${moduleId}/resource/${resourceId}/changeFollowedUp`, null)
      .pipe(catchError((e) => this.handleError(e)));
  }

  getResource(moduleId, moduleName, resourceId): Observable<any> {
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}?extraFields=true&malwareExtraInfo=false`;

    this.malwareResource = {};
    return this.httpUtils.get(allPath);
  }

  getResourceMalware(moduleId, moduleName, resourceId, key): Observable<any> {
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/${key}`;

    this.malwareResource = {};
    return this.httpUtils.get(allPath);
  }

  getResourcesIssued(moduleId, moduleName, maxRows = this.maxRowsDefault) {
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/issued`;
    return this.httpUtils.get(allPath).pipe(
      tap((x: any) => {
        this.totalResources = x.total_resources;
      }),
      map((x: any) => {
        return {
          numPages: Math.ceil(x.total_resources / maxRows) || 1,
          list: x.list
        };
      })
    );
  }

  getResourceOpenIssues(moduleId, moduleName, resourceId): Observable<any> {
    const organizationId = this.organizationService.currentOrganizationId;
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/issue`;
    return this.httpUtils.get(allPath).pipe(
      tap((incidents: any[]) => {
        return incidents.filter((i) => i.status === 'OPEN');
      })
    );
  }

  markAsRead(moduleId, moduleName, resources, isRead = true): Observable<any> {
    const body = {
      read: isRead,
      resources
    };
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/markAs`;
    return this.httpUtils.put(allPath, body);
  }

  markAsReadStandAlone(organizationId, moduleId, moduleName, resources, isRead): Observable<any> {
    const body = {
      read: isRead,
      resources
    };
    const allPath =
      moduleName === 'explorer'
        ? `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/cves/markAs`
        : `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/cves/markAs`;
    return this.httpUtils.put(allPath, body);
  }

  updateTLP(moduleId, resourceId, status) {
    const organizationId = this.organizationService.currentOrganizationId;
    const moduleName = this.activeModule.moduleName;
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/tlpStatus/${status}`;
    return this.httpUtils.put(allPath, {});
  }

  markAsFavStandalone(organizationId, moduleId, moduleType, resourceId, status) {
    const body = {
      status,
      resource: resourceId
    };
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/fav`;
    return this.httpUtils.put(allPath, body);
  }

  updateTLPStandalone(organizationId, moduleId, moduleType, resourceId, status) {
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleType}/resource/${resourceId}/tlpStatus/${status}`;
    return this.httpUtils.put(allPath, {});
  }

  markAsFav(moduleId, moduleName, resourceId, status): Observable<any> {
    const body = {
      status,
      resource: resourceId
    };
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/fav`;
    return this.httpUtils.put(allPath, body);
  }

  getLabels(moduleId, moduleName, associatedOnly) {
    const allPath = `${path}/organization/${this.organizationService.currentOrganizationId}/module/${moduleId}/${moduleName}/resource/label?associated=${associatedOnly}`;
    return this.labels[moduleId]
      ? observableOf(this.labels[moduleId])
      : this.httpUtils.get(allPath).pipe(
          map((r) => r),
          tap((l) => (this.labels[moduleId] = l))
        );
  }

  closeIncident(moduleId, moduleName, resourceId, issueId): Observable<any> {
    const organizationId = this.organizationService.currentOrganizationId;
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/issue/${issueId}`;
    return this.httpUtils.delete(allPath, {});
  }

  getUsersIncident(moduleId, params): Observable<any> {
    const organizationId = this.organizationService.currentOrganizationId;
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/issue/users`;
    return this.httpUtils.get(allPath, { params });
  }

  editLabels(moduleId, moduleName, label, resources): Observable<any> {
    // OJO!! SI SE ENVIA DOS VECES LA MISMA LABEL A UN RECURSO,
    // LA PRIMERA VEZ SETEA LA LABEL, LA SEGUNDA LA ELIMINA
    const organizationId = this.organizationService.currentOrganizationId;
    const body = {
      label,
      resources
    };
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/label`;
    return this.httpUtils.put(allPath, body);
  }

  deleteResource(moduleId, moduleName, resources): Observable<any> {
    const organizationId = this.organizationService.currentOrganizationId;
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource`;
    return this.httpUtils.put(allPath, resources);
  }

  deleteResourceInDetail(moduleId, moduleName, resourceId, data): Observable<any> {
    const organizationId = this.organizationService.currentOrganizationId;
    const detailType = moduleName === 'credential' ? 'remove_credentials' : 'remove_cards';
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/${resourceId}/${detailType}`;
    return this.httpUtils.put(allPath, data);
  }

  deleteResourceStandAlone(organizationId, moduleId, moduleName, resources): Observable<any> {
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource`;
    return this.httpUtils.put(allPath, resources);
  }

  blockDomain(organizationId, moduleId, resourceId, data) {
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/resource/${resourceId}/blacklist`;
    return this.httpUtils.post(allPath, data);
  }

  blockUrls(organizationId, moduleId, data) {
    const allPath = `${path}/organization/${organizationId}/module/${moduleId}/resource/blacklist`;
    return this.httpUtils.post(allPath, data);
  }

  getlanguagesList(): Observable<any> {
    const allPath = `${path}/language`;
    return this.httpUtils.get(allPath);
  }

  setResourceIssueSubject(value: any) {
    this.getResourceIssue.next(value);
  }

  getResourceIssueSubject() {
    return this.getResourceIssue;
  }

  setUpdateThreatsTableSubject(obj: any) {
    this.updateThreatsTableBehavior.next(obj);
  }

  listIssuesByResource(resource): Observable<any> {
    const id = resource.id || resource;
    const organizationId = this.activeOrganization.id;
    const module = this.activeModule.moduleName;
    const fullPath = `${path}/organization/${organizationId}/module/${this.activeModule.id}/${module}/resource/${id}/issue`;

    return this.httpUtils.get(fullPath);
  }

  getIssuesByTypes(): Observable<any> {
    const organizationId = this.activeOrganization.id;
    const fullPath = `${path}/organization/${organizationId}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/issue/types`;

    return this.httpUtils.get(fullPath);
  }

  getIssuesTypesIsolate(organizationId, moduleId, moduleName: string): Observable<any> {
    return this.httpUtils.get(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/issue/types`
    );
  }

  getIssuesByModuleIsolate(organizationId, moduleId, moduleName: string): Observable<any> {
    return this.httpUtils.get(
      `${path}/organization/${organizationId}/module/${moduleId}/${moduleName}/resource/issue/list`
    );
  }

  moveResource(orgId, moduleId, data) {
    return this.httpUtils.post(`${path}/organization/${orgId}/module/${moduleId}/resource/copyOrMoveTo`, data);
  }

  getIssuesByModule(): Observable<any> {
    const organizationId = this.activeOrganization.id;
    const fullPath = `${path}/organization/${organizationId}/module/${this.activeModule.id}/${this.activeModule.moduleName}/resource/issue/list`;

    return this.httpUtils.get(fullPath);
  }

  getAllThreatsSearchWords(organizationId, days) {
    return this.httpUtils.get(`${path}/organization/${organizationId}/module/0/resource/terms?days=${days}`);
  }

  private handleError(e) {
    let message;
    let type;

    if (e.error && e.error.message) {
      if (e.error.message === 'error.max_followed_up_resources') {
        message = 'You have reached the maximum followed up resources allowed.';
        type = 'warning';
      } else {
        message = 'An error ocurred. Try again later or contact your administrator.';
        type = 'error';
      }
    }

    return throwError({ message, type });
  }
}
