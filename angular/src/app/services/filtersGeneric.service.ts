import { Injectable, OnDestroy } from '@angular/core';
import { of, Observable, BehaviorSubject, Subscription, Subject } from 'rxjs';
import * as _ from 'lodash';

import { OrganizationService } from 'app/dashboard/organization/organization.service';
import { UserAccountService } from 'app/dashboard/user/account.service';
import { HttpUtilsService, path } from 'app/services/http-utils.service';

const { set, omitBy } = _;

interface ReadStatusItem {
  label: string;
  read: number;
  selected: boolean;
}

export interface ReadStatusArray extends Array<ReadStatusItem> {}

export interface FavoriteStatus {
  label: string;
  isActive: boolean;
}

export interface IIncidentsStatus {
  label: string;
  isActive: boolean;
}

export interface OrderElectionStatus {
  order: string;
  isActive: boolean;
}

@Injectable()
export class FiltersGenericService implements OnDestroy {
  activeModule: any;
  activeOrganization: any;
  activeState: any;
  subscriptionList: Subscription[] = [];
  currentIncidentStatus;
  operatorsInLabels = {};

  currentAnalysisCalculResultStatus = [
    { label: 'POSITIVE', analysisState: 0, selected: true },
    { label: 'NEGATIVE', analysisState: 1, selected: true },
    { label: 'INFORMATIVE', analysisState: 2, selected: true },
    { label: 'NOT_IMPORTANT', analysisState: 3, selected: false },
  ];

  defaultAnalysisCalculResultStatus = [
    { label: 'POSITIVE', analysisState: 0, selected: true },
    { label: 'NEGATIVE', analysisState: 1, selected: true },
    { label: 'INFORMATIVE', analysisState: 2, selected: true },
    { label: 'NOT_IMPORTANT', analysisState: 3, selected: false },
  ];

  operators = [
    { value: 'or', label: 'Or' },
    { value: 'ornot', label: 'Or not' },
    { value: 'and', label: 'And' },
    { value: 'andnot', label: 'And not' },
  ];

  currentReadStatus: ReadStatusArray = [
    { label: 'All', read: 0, selected: true },
    { label: 'Read', read: 1, selected: false },
    { label: 'Not Read', read: 2, selected: false },
  ];

  defaultReadStatus: ReadStatusArray = [
    { label: 'All', read: 0, selected: true },
    { label: 'Read', read: 1, selected: false },
    { label: 'Not Read', read: 2, selected: false },
  ];

  currentFavoriteStatus: FavoriteStatus = {
    label: 'Favorite',
    isActive: false,
  };

  private incidentStatus = [
    { label: 'All', onlyIncident: false },
    { label: 'With Incident', onlyIncident: true },
  ];

  private refreshFilters = new Subject<boolean>();

  private readStatusSubject = new BehaviorSubject(this.currentReadStatus);
  readStatus$: Observable<ReadStatusArray> = this.readStatusSubject.asObservable();
  /**************************************************StatusStarred****************************************************/
  private favoriteStatusSubject = new BehaviorSubject(this.currentFavoriteStatus);
  favoriteStatus$: Observable<FavoriteStatus> = this.favoriteStatusSubject.asObservable();

  constructor(
    private organizationService: OrganizationService,
    private userAccountService: UserAccountService,
    private http: HttpUtilsService
  ) {
    let s = this.organizationService.getCurrentContext().subscribe((context) => {
      this.activeModule = context.currentModule;
      this.activeOrganization = context.currentOrganization;
      this.activeState = context.currentState;
    });

    this.subscriptionList.push(s);
  }

  doRefresh() {
    this.refreshFilters.next(true);
  }

  get onRefresh() {
    return this.refreshFilters.asObservable();
  }

  ngOnDestroy() {
    this.subscriptionList.forEach((s) => {
      if (s.unsubscribe) {
        s.unsubscribe();
      }
    });
  }
  /**************************************************Label****************************************************/
  addLabelOperator(labelId, operator = this.operators[0]) {
    this.operatorsInLabels = set(this.operatorsInLabels, labelId, operator);
  }

  removeLabelOperator(labelId) {
    this.operatorsInLabels = omitBy(this.operatorsInLabels, labelId);
  }

  /**************************************************StatusTemp****************************************************/
  setCurrentReadStatus(status) {
    this.currentReadStatus = status;
    this.readStatusSubject.next(this.currentReadStatus);
  }

  getReadStatus() {
    return of(this.currentReadStatus);
  }

  resetReadStatus() {
    this.currentReadStatus[0].selected = true;
    this.currentReadStatus[1].selected = false;
    this.currentReadStatus[2].selected = false;
    this.readStatusSubject.next(this.currentReadStatus);
  }

  /**************************************************FavoriteStatus****************************************************/
  setCurrentFavoriteStatus(state) {
    this.currentFavoriteStatus = state;
    this.favoriteStatusSubject.next(this.currentFavoriteStatus);
  }

  getFavoriteStatus() {
    return of(this.currentFavoriteStatus);
  }

  resetFavoriteStatus() {
    this.currentFavoriteStatus.isActive = false;
    this.favoriteStatusSubject.next(this.currentFavoriteStatus);
  }

  /**************************************************Incident****************************************************/
  setCurrentIncidentStatus(incidentState) {
    this.currentIncidentStatus = incidentState.label;
  }

  getIncidentStatus() {
    // TODO: Get status filters from an end-point
    return of(this.incidentStatus);
  }

  resetIncidentStatus() {
    this.currentIncidentStatus = '';
  }

  /**************************************************CurrentAnalyisCalculResult****************************************************/
  setCurrentAnalysisCalculResultStatus(currentAnalysisCalculResultState) {
    // this.currentAnalysisCalculResultStatus=_.cloneDeep(currentAnalysisCalculResultState);
    this.currentAnalysisCalculResultStatus = currentAnalysisCalculResultState;
  }

  getAnalysisCalculResultStatus() {
    // TODO: Get status filters from an end-point
    // this.currentAnalysisCalculResultStatus=_.cloneDeep(this.analysisCalculResultStatus)
    // return Observable.of(_.cloneDeep(this.currentAnalysisCalculResultStatus));
    return of(this.currentAnalysisCalculResultStatus);
  }

  resetAnalysisCalculResultStatus() {
    this.currentAnalysisCalculResultStatus = JSON.parse(JSON.stringify(this.defaultAnalysisCalculResultStatus));
  }

  getSearchWords(orgId, moduleId, moduleType) {
    return this.http.get(`${path}/organization/${orgId}/module/${moduleId}/${moduleType}/resource/terms`);
  }

  getTransforms(orgId, moduleId) {
    return this.http.get(`${path}/organization/${orgId}/module/${moduleId}/resource/sources`);
  }
}
