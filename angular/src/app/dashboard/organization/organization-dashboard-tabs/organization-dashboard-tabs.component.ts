import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, forkJoin, from, Observable, of, Subject, Subscription } from 'rxjs';
import { catchError, filter, finalize, map, mergeMap, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { OrganizationService } from '../organization.service';
import { Store } from '../../../services/store/store';
import { OrganizationDashboardTabsService } from './organization-dashboard-tabs.service';

export interface ChartList {
  list: any[];
  total_charts: number;
}

export interface ModuleTitle {
  id: string;
  name: string;
}

@Component({
  selector: 'app-organization-dashboard-tabs',
  templateUrl: './organization-dashboard-tabs.component.html',
  styleUrls: ['./organization-dashboard-tabs.component.scss']
})
export class OrganizationDashboardTabsComponent implements OnInit, OnDestroy {
  activeModuleTab = 1;
  activeTypeTab = 'global';
  moduleTabTitleList = [];
  activeModuleChartsState = [];
  orgId: number;
  state: any;
  organizationModules = {};
  isLoadingTabContent = true;
  globalCharts = {};
  storeSubscription: Subscription;
  dateRange = undefined;
  timezone = undefined;

  typesDictionary = {
    PHISHING: 'Domain Protection',
    BOTNETS: 'Credentials',
    BRAND_ABUSE: 'Social Media',
    HACKTIVISM_ATTACK_PREVENTION: 'Hacktivism',
    MEDIA_TRACKER: 'Media Tracker',
    DATA_LEAKAGE: 'Data Leakage',
    MOBILE_APPS_MONITORING: 'Mobile Apps',
    CARDING_FULL: 'Credit Cards',
    CUSTOM: 'Custom',
    DARK_WEB: 'Dark Web',
    MALWARE: 'Malware'
  };

  private organizationChartsSubject: BehaviorSubject<any>;
  private organizationCharts$: Observable<any>;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private organizationService: OrganizationService,
    private store: Store,
    private organizationDashboardService: OrganizationDashboardTabsService
  ) {
    this.organizationChartsSubject = new BehaviorSubject<any>([]);
    this.organizationCharts$ = this.organizationChartsSubject.asObservable();
    this.moduleTabTitleList = [];
  }

  ngOnInit() {
    this.initCharts();
    this.organizationCharts$.pipe(takeUntil(this.destroy$)).subscribe((charts) => {
      this.setModuleTabTitleList(charts);
    });

    this.store.select('roleList').subscribe(({ timezone }: any) => {
      this.timezone = timezone;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.storeSubscription.unsubscribe();
  }

  get haveDateRangeStart() {
    return !!this.dateRange?.since;
  }

  get haveDateRangeEnd() {
    return !!this.dateRange?.to;
  }

  get rangeDatesToBe() {
    const since = this.haveDateRangeStart ? this.dateRange.since.format('x') : undefined;
    const to = this.haveDateRangeEnd ? this.dateRange.to.format('x') : undefined;
    return since && to ? { since, to, timezone: this.timezone } : undefined;
  }

  initCharts() {
    const initChart = false;
    this.storeSubscription = this.store
      .select('userStateList')
      .pipe(
        takeUntil(this.destroy$),
        take(2),
        filter((res) => {
          return res && !initChart;
        }),
        switchMap((state: any) => {
          this.state = state;
          return this.organizationService.getCurrentContext();
        }),
        filter(Boolean)
      )
      .subscribe((context: any) => {
        this.setOrgId(context.currentOrganization, () => {
          this.getChartList();
        });
      });
  }

  getChartList() {
    this.isLoadingTabContent = true;
    forkJoin([
      this.organizationDashboardService.getGlobalCharts(this.rangeDatesToBe),
      this.organizationDashboardService.getOrganizationCharts(this.orgId)
    ])
      .pipe(
        takeUntil(this.destroy$),
        tap(([globalCharts, _]) => {
          const chartGlobalMap = new Map([
            [42, 'cybercrime'],
            [7, 'c&c'],
            [30, 'malwareByType'],
            [29, 'malwareAttack'],
            [18, 'cardsByCountry'],
            [40, 'openAndClosedIncidents']
          ]);

          const globalChartsFiltered = (globalCharts as any).list?.filter((chart) =>
            [...chartGlobalMap.keys()].includes(chart.id)
          );

          this.globalCharts = this.getChartDefinition(globalChartsFiltered).map((chart) => ({
            ...chart,
            globalChart: true
          }));

          this.getChildModuleChartDetails(Object.values(this.globalCharts), (chartDetail) => {
            this.globalCharts = chartDetail;
          });
        }),
        map((organizationCharts: any) => {
          return organizationCharts[1].list.filter((chart) => chart.reputationalSearchId && chart.complete);
        }),
        catchError(this.handleError('Get organization charts', [])),
        finalize(() => (this.isLoadingTabContent = false))
      )
      .subscribe((organizationCharts) => {
        this.organizationChartsSubject.next(organizationCharts);
      });
  }

  dateRangeFilter(event: any) {
    const { dateRange } = event;
    this.dateRange = dateRange;
    if (this.haveDateRangeStart && this.haveDateRangeEnd) {
      this.onCallReloadData();
    }
  }

  resetDates() {
    this.dateRange = undefined;
    this.onCallReloadData();
  }

  setModuleTabTitleList(charts): void {
    const moduleNames = charts
      .map((chart) => ({
        name: chart.reputationalSearchName,
        id: chart.reputationalSearchId,
        type: chart.reputationalSearchType
      }))
      .filter((el, i, array) => array.findIndex((elem) => elem.id === el.id) === i)
      .concat();

    const result = Object.values(
      moduleNames.reduce((result, { type, id, name }) => {
        if (!result[type])
          result[type] = {
            type,
            modules: []
          };
        result[type].modules.push({
          type,
          id,
          name
        });
        return result;
      }, {})
    );
    this.moduleTabTitleList = result;
  }

  setOrgId(organization, cb): void {
    if (organization) {
      this.orgId = organization.id;
      if (cb) {
        cb();
      }
    }
  }

  getActiveTabModuleChartList() {
    return this.organizationCharts$.pipe(
      map((chart) => chart.filter((el) => el.reputationalSearchId === this.activeModuleTab))
    );
  }

  getChartDefinition(childrenModules, loadDetails?) {
    const newModuleChartList = [];
    if (childrenModules.length > 0) {
      childrenModules.forEach((chart) => {
        const defaultSingleChartState = {
          id: 1,
          title: '',
          detail: {},
          isLoading: true,
          isError: false,
          isDataPresent: false
        };
        newModuleChartList.push({
          ...defaultSingleChartState,
          ...chart,
          id: chart.id,
          title: chart.title
        });
      });
    }
    return newModuleChartList;
  }

  setActiveTabModuleCharts(): void {
    this.isLoadingTabContent = true;
    this.getActiveTabModuleChartList()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoadingTabContent = false))
      )
      .subscribe((childrenModules) => {
        this.activeModuleChartsState = this.getChartDefinition(childrenModules, true);

        if (this.activeModuleTab !== 1) {
          this.onCallReloadData();
        }
      });
  }

  getChartDetailById(chart): Observable<any> {
    return this.organizationDashboardService.getChart(this.orgId, chart.id, this.rangeDatesToBe).pipe(
      map((detail) => {
        return {
          ...chart,
          detail
        };
      })
    );
  }

  updateChildModulesChartState() {
    this.getChildModuleChartDetails(this.activeModuleChartsState, (chartDetails: any) => {
      this.activeModuleChartsState = chartDetails;
    });
  }

  getChildModuleChartDetails(currentChartState, callbackFn: (value: any) => void): any {
    const chartDetailsPopulated = [];
    let currentChartOnProcess = null;
    of(currentChartState)
      .pipe(
        takeUntil(this.destroy$),
        tap((childChart) => {
          currentChartOnProcess = childChart;
        }),
        mergeMap((childChart) => {
          return forkJoin([...childChart].map((chart) => this.getChartDetailById(chart))).pipe(
            switchMap((charts) => from(charts))
          );
        }),
        catchError<any, any>(() => {
          currentChartOnProcess = {
            ...currentChartOnProcess,
            ...{
              isLoading: false,
              isError: true,
              isDataPresent: false
            }
          };
          this.isLoadingTabContent = false;
          return this.handleError(`get details of chart with id: ${currentChartOnProcess.id}`);
        }),
        finalize(() => {
          callbackFn([...chartDetailsPopulated]);
          this.isLoadingTabContent = false;
        })
      )
      .subscribe((detail: any) => {
        chartDetailsPopulated.push({
          ...detail,
          ...{
            isLoading: false,
            isError: false,
            isDataPresent: true
          }
        });
      });
  }

  onCallReloadData() {
    this.activeModuleTab === 1 ? this.getChartList() : this.updateChildModulesChartState();
  }

  onActiveTabChange(tab): void {
    this.activeModuleTab = tab === 1 ? 1 : tab.id;
    this.activeTypeTab = tab === 1 ? 'global' : tab.type;
    tab === 1 ? this.getChartList() : this.setActiveTabModuleCharts();
  }

  isTabActive(type) {
    return type === this.activeTypeTab;
  }

  isModuleActive(id) {
    return id === this.activeModuleTab;
  }

  handleError = <T>(operation = 'operation', result?: T): ((error: Error) => Observable<T>) => {
    return (error) => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  };
}
