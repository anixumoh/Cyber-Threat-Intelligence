export interface StateModuleInterface {
  module: {
    organization: StateOrganizationInterface;
  };
}
export interface StateOrganizationInterface {
  organization: {
    maxRows: string;
    chartStatus: string;
    graphState: {
      type: string;
      modifier: string;
    };
    filters: StateFiltersInterface;
    dashboard: StateDashboardInterface;
  };
}

export interface StateDashboardChartsInterface {
  actual: string;
  left: string;
  center: string;
  right: string;
}

export interface StateDashboardLeftChartInterface {
  perDay: number;
  perMonth: number;
  perYear: number;
}

export interface StateDashboardInterface {
  charts: StateDashboardChartsInterface;
  leftChart: StateDashboardLeftChartInterface;
  closed: string;
  sortUp: boolean;
  orderId: number[];
}

export interface StateFiltersInterface {
  byState: StatusFilter[];
  byLabel: string;
  byStatus: string;
  byOrder: {
    order: string;
    direction: string;
  };
  byDate: {
    formattedSince: string;
    formattedTo: string;
  };
  byCountry: string;
  byFavorite: string;
}
export interface StatusFilter {
  label: string;
  read: number;
  selected: boolean;
}

export class ModuleModel {
  id: number;
  name: string;
  shortName: string;
  organizationId: number;
  enabled: boolean;
  type: string;
  demoMode: boolean;
  moduleName: string;
  plugins: string[];

  constructor(orgId: number, type: string, name: string, shortName: string, enabled: boolean) {
    this.name = name;
    this.organizationId = orgId;
    this.shortName = shortName;
    this.type = type;
    this.enabled = enabled;
    this.demoMode = false;
    this.plugins = [];
  }
}

export class OrganizationModel {
  id: number;
  name: string;
  enabled: boolean;
  created_at: number;
  trial: boolean;
}

export class StatesModel {
  default: any = {
    organizationId: '',
    moduleId: '',
    language: '',
    sidebarStatus: true
  };
  defaultRows: any;
  openModules: any;
  fullStory: any = {
    id: '' // here use the last 10 characters of organization name on sha256 + id of the user.
  };
  dashboard: any = {
    graphsId: Array,
    panelStatus: '' // boolean.
  };
  lastStory: any = {
    url: ''
  };
  modules: any = {
    '': {
      '': {
        maxRows: '',
        chartStatus: '',
        graphState: {
          type: '',
          modifier: ''
        },
        filters: {
          byState: '',
          byLabel: '',
          byStatus: '',
          byOrder: {
            order: '',
            direction: ''
          },
          byDate: {
            since: '',
            to: ''
          },
          byCountry: '',
          byFavorite: ''
        }
      },
      dashboard: {
        charts: {
          actual: null,
          left: null,
          center: null,
          right: null
        },
        leftChart: null,
        closed: '',
        sortUp: null,
        orderId: []
      },
      tcxSearchSaved: {
        actors: [],
        campaigns: [],
        tools: [],
        indicators: [],
        cves: [],
        attackPatterns: [],
        signatures: [],
        malwareHunting: [],
        intelReports: []
      }
    }
  };
}
