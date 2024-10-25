import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError, ReplaySubject } from 'rxjs';
import { catchError, tap, first } from 'rxjs/operators';
import moment from 'moment-timezone';

import {
  StateDashboardInterface,
  StateFiltersInterface,
  StateModuleInterface,
  StateOrganizationInterface,
  StatesModel,
  StatusFilter
} from 'app/dashboard/organization/models';
import { HttpUtilsService, path } from 'app/services/http-utils.service';
import { SHA256 } from 'app/utils/functions';
import { Store } from 'app/services/store/store';
import { IQuickFilter } from 'app/shared/components/tcx-quick-filters/tcx-quick-filters.component';
import { TcxTypes } from 'app/shared/utils/common.utils';
import { isEmpty } from 'lodash';

@Injectable()
export class UserAccountService {
  currentState: any = null;
  orgIdChart: any;
  modIdChart: any;
  orgId: any;
  modId: any;
  landingPage;
  public currentUser;
  public getCurrentStateObserver: BehaviorSubject<any> = new BehaviorSubject<any>(this.currentState);
  private userDataObserver: ReplaySubject<any> = new ReplaySubject(1);
  userData$ = this.userDataObserver.asObservable();

  constructor(
    private http: HttpUtilsService,
    private router: Router,
    private state: StatesModel,
    private store: Store
  ) {}

  getCurrentState() {
    return this.getCurrentStateObserver;
  }

  setModuleAndOrgId(organizationId, moduleId) {
    this.orgId = organizationId;
    this.modId = moduleId;
  }

  getValuesModuleAndOrganization(organizationId, moduleId, nameOrganization, userId) {
    this.orgId = organizationId;
    this.modId = moduleId;
    if (organizationId !== '' && moduleId !== '') {
      this.getFullStory(nameOrganization, userId);
      this.getLastStory();
    }
  }

  getModuleByDefault(organizationId, moduleId) {
    if (!this.state.default) {
      this.state.default = { sidebarStatus: true };
    }
    this.state.default.organizationId = organizationId;
    this.state.default.moduleId = moduleId;
    this.sendState(this.state);
  }

  setOpenModules(openModules) {
    this.state.openModules = openModules;
    this.sendState(this.state);
  }

  setDefaultRows(rows) {
    this.state.defaultRows = rows;
    this.sendState(this.state);
  }

  setDashboardSortUp(organizationId: number, sortUpState: boolean) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.sortUp = sortUpState;
    this.sendState(this.state);
  }

  setDashboardClosed(organizationId: number, closeState: string) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.closed = closeState;
    this.sendState(this.state);
  }

  setDashboardOrderGraphIdList(organizationId: number, orderedChartList: number[]) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.order = orderedChartList;
    this.sendState(this.state);
  }

  setDashboardGraphic(organizationId: number, graphId: number, activeChartType: string) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.charts[activeChartType] = graphId;
    this.sendState(this.state);
  }

  deleteDashboardGraphic(organizationId: number, activeChartType) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.charts[activeChartType] = null;
    this.sendState(this.state);
  }

  setDashboardLeftGraphic(organizationId: number, leftChart: any) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.leftChart = leftChart;
    this.sendState(this.state);
  }

  setDashboardCardColorPreset(organizationId: number, chartPreference: any) {
    this.setStateDashboardStructure(organizationId);
    this.state.modules[organizationId].dashboard.charts = chartPreference;
    this.sendState(this.state);
  }

  setStateDashboardStructure(organizationId) {
    if (!this.state.modules) {
      this.state.modules = {};
    }
    if (!this.state.modules.hasOwnProperty(organizationId)) {
      this.state.modules[organizationId] = <StateModuleInterface>{};
      this.state.modules[organizationId].dashboard = <StateDashboardInterface>{};
    } else if (!this.state.modules[organizationId].hasOwnProperty('dashboard')) {
      this.state.modules[organizationId].dashboard = <StateDashboardInterface>{};
    } else if (!this.state.modules[organizationId].dashboard.charts) {
      this.state.modules[organizationId].dashboard.charts = <StateDashboardInterface>{};
    }
  }

  setAllStatusFilter(organizationId: number, moduleId: number, actualStates: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.byState = <StatusFilter>actualStates;
    this.sendState(this.state);
  }

  setStateOrderListFilter(organizationId: number, moduleId: number, actualStates: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.byOrder = actualStates;
    this.sendState(this.state);
  }

  setNotImportantFilter(organizationId: number, moduleId: number, filterActualStatus: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.byStatus = <StatusFilter>filterActualStatus;
    this.sendState(this.state);
  }

  setSearchWordsFilter(organizationId: number, moduleId: number, filterSearchWords: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.terms = <StatusFilter>filterSearchWords;
    this.sendState(this.state);
  }

  setFavoriteFilter(organizationId: number, moduleId: number, favorite: boolean) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.favorite = favorite;
    this.sendState(this.state);
  }

  setTransformsFilter(organizationId: number, moduleId: number, filterTransforms: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.transforms = <StatusFilter>filterTransforms;
    this.sendState(this.state);
  }

  setReadUnreadFilter(organizationId: number, moduleId: number, read: string) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.read = read;
    this.sendState(this.state);
  }

  setIncidentsFilter(organizationId: number, moduleId: number, incidents: boolean) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.incidents = incidents;
    this.sendState(this.state);
  }

  setTargetedFilter(organizationId: number, moduleId: number, targeted: boolean) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.targeted = targeted;
    this.sendState(this.state);
  }

  setUserSubmittedFilter(organizationId: number, moduleId: number, userSubmitted: boolean) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.userSubmitted = userSubmitted;
    this.sendState(this.state);
  }

  setLabelFilter(organizationId: number, moduleId: number, labels: any, labelsAnd?: any, labelsNot?: any) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.labels = labels;
    this.state.modules[organizationId][moduleId].filters.labelsAnd = labelsAnd;
    this.state.modules[organizationId][moduleId].filters.labelsNot = labelsNot;
    this.sendState(this.state);
  }

  setFollowedFilter(organizationId: number, moduleId: number, followed: boolean) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.followed = followed;
    this.sendState(this.state);
  }

  setPriorityFilter(organizationId: number, moduleId: number, priority: string) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.priority = priority;
    this.sendState(this.state);
  }

  setScoreFromFilter(organizationId: number, moduleId: number, score: string) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.startScore = score;
    this.sendState(this.state);
  }

  setScoreToFilter(organizationId: number, moduleId: number, score: string) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.endScore = score;
    this.sendState(this.state);
  }

  setStateFilterByDate(
    organizationId: number,
    moduleId: number,
    formattedSince: any,
    formattedTo: any,
    sinceNumber: any,
    toNumber: any
  ) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters.byDate = {
      formattedSince,
      formattedTo,
      sinceNumber,
      toNumber
    };
    this.sendState(this.state);
  }

  resetStateFilterByDate(organizationId: number, moduleId: number) {
    this.setStateFiltersStructure(organizationId, moduleId);
    delete this.state.modules[organizationId][moduleId].filters.byDate;
    this.sendState(this.state);
  }

  setStateFiltersStructure(organizationId, moduleId) {
    if (!this.state.modules) {
      this.state.modules = {};
    }
    if (!this.state.modules.hasOwnProperty(organizationId)) {
      this.state.modules[organizationId] = <StateModuleInterface>{};
      this.state.modules[organizationId][moduleId] = <StateOrganizationInterface>{};
      this.state.modules[organizationId][moduleId].filters = <StateFiltersInterface>{};
    } else if (!this.state.modules[organizationId].hasOwnProperty(moduleId)) {
      this.state.modules[organizationId][moduleId] = <StateOrganizationInterface>{};
      this.state.modules[organizationId][moduleId].filters = <StateFiltersInterface>{};
    } else if (!this.state.modules[organizationId][moduleId].hasOwnProperty('filters')) {
      this.state.modules[organizationId][moduleId].filters = <StateFiltersInterface>{};
    }
  }

  setShowChartStatus(choice, moduleId, organizationId) {
    this.modIdChart = moduleId.toString();
    this.orgIdChart = organizationId.toString();
    this.setModulesStructure();
    if (!this.state.modules.hasOwnProperty(this.orgIdChart)) {
      this.state.modules[this.orgIdChart] = {};
    }
    if (!this.state.modules[this.orgIdChart].hasOwnProperty(this.modIdChart)) {
      this.state.modules[this.orgIdChart][this.modIdChart] = {};
      this.state.modules[this.orgIdChart][this.modIdChart].chartStatus = choice;
    } else {
      this.state.modules[this.orgIdChart][this.modIdChart].chartStatus = choice;
    }
    this.sendState(this.state);
  }

  setStateModuleGraphs(graphState, moduleId, organizationId) {
    this.modIdChart = moduleId.toString();
    this.orgIdChart = organizationId.toString();
    this.setModulesStructure();
    if (!this.state.modules.hasOwnProperty(this.orgIdChart)) {
      this.state.modules[this.orgIdChart] = {};
      if (!this.state.modules[this.orgIdChart].hasOwnProperty(this.modIdChart)) {
        this.state.modules[this.orgIdChart][this.modIdChart] = {};
        this.state.modules[this.orgIdChart][this.modIdChart].graphState = graphState;
      } else {
        this.state.modules[this.orgIdChart][this.modIdChart].graphState = graphState;
      }
    } else {
      if (!this.state.modules[this.orgIdChart].hasOwnProperty(this.modIdChart)) {
        this.state.modules[this.orgIdChart][this.modIdChart] = {};
        this.state.modules[this.orgIdChart][this.modIdChart].graphState = graphState;
      } else {
        this.state.modules[this.orgIdChart][this.modIdChart].graphState = graphState;
      }
    }
    this.state.modules[this.orgIdChart][this.modIdChart].chartStatus = true;
    this.sendState(this.state);
  }

  setModulesStructure() {
    if (!this.state.modules) {
      this.state.modules = {};
      this.state.modules[this.orgIdChart] = {};
      this.state.modules[this.orgIdChart][this.modIdChart] = {};
      this.state.modules[this.orgIdChart][this.modIdChart].chartStatus = true;
    }
  }

  setMaxRowsStatus(maxRows) {
    if (!this.state.modules) {
      this.state.modules = {};
    }
    if (this.orgId && this.modId) {
      if (!this.state.modules.hasOwnProperty(this.orgId)) {
        this.state.modules[this.orgId] = <StateModuleInterface>{};
        this.state.modules[this.orgId][this.modId] = <StateOrganizationInterface>{};
      } else if (!this.state.modules[this.orgId].hasOwnProperty(this.modId)) {
        this.state.modules[this.orgId][this.modId] = <StateOrganizationInterface>{};
      }
      this.setStateFiltersStructure(this.orgId, this.modId);
      this.state.modules[this.orgId][this.modId].maxRows = maxRows;
      this.sendState(this.state);
    }
  }

  setSidebarStatus(choice) {
    if (choice !== undefined && this.state && this.state.default) {
      this.state.default.sidebarStatus = choice;
      this.getLastStory();
      this.sendState(this.state);
    }
  }

  setTcxSaveDorks(name: string, data: any[]) {
    if (!this.state?.modules?.[this.orgId]?.[this.modId]?.tcxSearchSaved) {
      this.state.modules[this.orgId] = {};
      this.state.modules[this.orgId][this.modId] = {};
      this.state.modules[this.orgId][this.modId].tcxSearchSaved = {
        actors: [],
        campaigns: [],
        tools: [],
        indicators: [],
        cves: [],
        attackPatterns: [],
        signatures: [],
        malwareHunting: [],
        intelReports: []
      };
    }
    this.state.modules[this.orgId][this.modId].tcxSearchSaved[name] = data;
    this.sendState(this.state);
  }

  getSaveDorks(tcxType: TcxTypes, quickFilters: IQuickFilter[]) {
    this.store.select('userStateList').subscribe((response: any) => {
      const saved = response?.modules?.[this.orgId]?.[this.modId]?.tcxSearchSaved[tcxType];
      if (quickFilters.some((quick: IQuickFilter) => quick.title === 'Saved searches')) {
        quickFilters.pop();
      }
      if (saved?.length) {
        const quick = { title: 'Saved searches', filters: saved };
        quickFilters.push(quick);
      }
    });
  }

  getFullStory(name, id) {
    if (this.state) {
      const encryptName = SHA256(name).substr(-10) + id;
      this.state.fullStory = encryptName;
    }
  }

  getLastStory() {
    this.state.lastStory = this.router.url;
  }

  resetFiltersState(organizationId, moduleId) {
    this.setStateFiltersStructure(organizationId, moduleId);
    this.state.modules[organizationId][moduleId].filters = {};
    this.sendState(this.state);
  }

  sendState(object, noStore = false) {
    const stateSend = { ...object };
    const url = `${path}/user/preferences`;
    if (JSON.stringify(stateSend) !== '{}') {
      return this.http
        .put(url, stateSend)

        .subscribe(() => {
          this.state = stateSend;
          this.getCurrentStateObserver.next(this.state);
          if (!noStore) {
            this.store.set('userStateList', this.state);
          }
        });
    }
  }

  getState(): Observable<any> {
    const url = `${path}/user/preferences`;
    return this.http.get(url).pipe(
      tap((state: any) => {
        if (!isEmpty(state)) {
          this.state = state;
        }
        this.getCurrentStateObserver.next(this.state);
        this.store.set('userStateList', state ? this.state : this.defaultState());
      }),
      catchError((e) => {
        this.store.set('userStateList', this.defaultState());
        return throwError(e);
      })
    );
  }

  defaultState() {
    return {
      default: {
        organizationId: '',
        moduleId: '',
        language: '',
        sidebarStatus: true
      },
      fullStory: {
        id: '' // here use the last 10 characters of organization name on sha256 + id of the user.
      },
      defaultRows: 10,
      openModules: false,
      dashboard: {
        graphsId: {
          actual: null,
          left: null,
          center: null,
          right: null
        },
        panelStatus: '' // boolean.
      },
      lastStory: {
        url: ''
      }
    };
  }

  editAccountQuery(userAccount): Observable<any> {
    const userId = userAccount.id;
    return this.http.put(`${path}/user/${userId}`, userAccount);
  }

  fetchCurrentUser(): Observable<any> {
    return this.http
      .get(`${path}/user/account`)
      .pipe(
        tap((res: any) => {
          this.landingPage = res.landingPage;
          this.setUserTimezone(res.timezone);
          this.setCurrentUser(res);
          this.userDataObserver.next(res);
        }),
        first()
      )
      .subscribe();
  }

  getCurrentUser(): Observable<any> {
    return this.userData$;
  }

  updatePassword(credentials): Observable<any> {
    const body = {
      currentPassword: credentials.currentPassword,
      newPassword: credentials.newPassword
    };
    return this.http.put(`${path}/user/changepwd`, body);
  }

  getSecondFactorQR(): Observable<any> {
    return this.http.get(`${path}/user/enable2FA`);
  }

  getTimesZones(): Observable<any> {
    return this.http.get(`${path}/user/timezone`);
  }

  setTimeZones(value: string): Observable<any> {
    this.setUserTimezone(value);
    const body = {
      timezone: value
    };
    return this.http.put(`${path}/user/timezone`, body);
  }

  setTimeOut(value: string): Observable<any> {
    const body = {
      timeout: value
    };
    return this.http.put(`${path}/user/timeout`, body);
  }

  setMessaging(value: boolean): Observable<any> {
    const body = {
      event_messages: value
    };
    return this.http.put(`${path}/user/event_messages`, body);
  }

  updateLandingPage(landing): Observable<any> {
    return this.http.put(`${path}/user/landing`, landing);
  }

  removeLandingPage(): Observable<any> {
    const payload = { landing: '' };
    return this.http.put(`${path}/user/landing`, payload);
  }

  acceptTerms(value): Observable<any> {
    const url = `${path}/user/acceptLicense/${value}`;
    const body = {};
    return this.http.post(url, body);
  }

  disableTwoFactor() {
    const url = `${path}/user/disable2FA`;
    return this.http.put(url, {});
  }

  resetTwoFactor(userId: any) {
    const url = `${path}/user/${userId}/disable2FA`;
    return this.http.put(url, {});
  }

  shouldEnable2FA(): Observable<any> {
    const url = `${path}/user/forced_mfa`;

    return this.http.get(url);
  }

  private setCurrentUser(user) {
    this.store.update('roleList', 'setRoles', user);
    this.currentUser = user;
  }

  private setUserTimezone(timezone: string) {
    moment.tz.setDefault(timezone);
  }
}
