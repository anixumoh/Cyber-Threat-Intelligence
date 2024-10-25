import type { GetCVEFilters } from '$lib/types/explorer';
import {
  ReadStatusOptions,
  ThreatDateFilterField,
  type AnalysisCalcResultType,
  type ModifiedStatusOptions,
  type ThreatSearchType
} from '$lib/types/threat';
import type { TCXSearch } from '$src/routes/dashboard/organizations/[organizationId=integer]/modules/[moduleId=integer]/tcx/global-search/types';
import axios, { type CancelTokenSource } from 'axios';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import { get, writable } from 'svelte/store';

const defaultPreferences = {
  default: {
    organizationId: '',
    moduleId: '',
    language: '',
    sidebarStatus: true
  },
  bannerOpen: 'open',
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
  tcx_customization: [],
  tcx_default_tab: 0,
  tcx_dashboard_version: 0,
  tcx_favorite_actors: [],
  tcx_recent_searches: [] as TCXSearch[],
  tcx_saved_searches: [] as TCXSearch[],
  lastStory: {
    url: ''
  }
};
type DefaultPreferences = typeof defaultPreferences;

export type ModuleFilters = {
  labels?: string; //"374",
  labelsAnd?: string; //"1759",
  labelsNot?: string; //"24551",
  transforms?: string; //"Botnet",
  terms?: string; //"600,4242",
  favorite?: boolean;
  followed?: boolean;
  incidents?: boolean;
  analysisCalcResult?: AnalysisCalcResultType[];
  byState?: [
    {
      label: 'All';
      read: 1;
      selected: boolean;
    },
    {
      label: 'Read';
      read: 2;
      selected: boolean;
    },
    {
      label: 'Not Read';
      read: 3;
      selected: boolean;
    }
  ];
  read?: number[];
  modified?: ModifiedStatusOptions;
  byDate?: {
    dateField?: ThreatDateFilterField;
    // formattedSince: string, // "2022-09-13T22:00:00Z",
    // formattedTo: string, // "2022-09-22T21:59:59Z",
    sinceNumber: number; // 1663106400000,
    toNumber: number; // 1663883999999
  };
};

export type ExplorerPreferences = {
  endScore?: number;
  startScore?: number;
  priority?: string;
  read?: GetCVEFilters['read'];
  terms?: string;
  since?: number | Date;
  to?: number | Date;
  labels?: string;
  labelsAnd?: string;
  excludeLabels?: string;
  q?: string;
};

export interface PreferencesType extends DefaultPreferences {
  modules?: {
    [organizationId: number]: {
      [moduleId: number]: {
        filters?: ModuleFilters;
        explorer?: ExplorerPreferences;
        chartStatus?: boolean;
        tcxSearchSaved?: {
          actors?: TCXModuleSavedSearch[];
          campaigns?: TCXModuleSavedSearch[];
          tools?: TCXModuleSavedSearch[];
          indicators?: TCXModuleSavedSearch[];
          cves?: TCXModuleSavedSearch[];
          attackPatterns?: TCXModuleSavedSearch[];
          signatures?: TCXModuleSavedSearch[];
          malwareHunting?: TCXModuleSavedSearch[];
          intelReports?: TCXModuleSavedSearch[];
        };
      };
    };
  };
}

export type TCXModuleSavedSearch = {
  name: string;
  dork: string;
  markAsDefault: boolean;
};

function createPreferencesStore() {
  const store = writable<PreferencesType>(defaultPreferences);
  let cancelSaveToken: CancelTokenSource;

  function setPreferences(value: PreferencesType) {
    store.set({ ...defaultPreferences, ...value });
  }

  async function loadPreferences() {
    try {
      const url = '/api/v2/user/preferences';
      const response = await axios.get<PreferencesType>(url);
      setPreferences(response.data);
    } catch (e) {
      console.error(e);
    }
  }

  async function setAndSave(preferences: PreferencesType) {
    store.set(preferences);

    cancelSaveToken?.cancel();
    cancelSaveToken = axios.CancelToken.source();
    const url = '/api/v2/user/preferences';
    await axios.put(url, preferences, {
      cancelToken: cancelSaveToken.token
    });
  }

  async function setChartStatus(organizationId: number, moduleId: number, chartStatus: boolean) {
    const current = get(store);
    if (!current.modules) {
      current.modules = {};
    }
    if (!current.modules[organizationId]) {
      current.modules[organizationId] = {};
    }
    if (!current.modules[organizationId][moduleId]) {
      current.modules[organizationId][moduleId] = {};
    }
    current.modules[organizationId][moduleId].chartStatus = chartStatus;
    await setAndSave(current);
  }

  async function setModulePreferences(organizationId: number, moduleId: number, filters: ThreatSearchType) {
    const moduleFilters: ModuleFilters = {};
    if (filters.filters?.labels?.length) {
      moduleFilters.labels = filters.filters.labels.join(',');
    }
    if (filters.filters?.labelsAnd?.length) {
      moduleFilters.labelsAnd = filters.filters.labelsAnd.join(',');
    }
    if (filters.filters?.excludeLabels?.length) {
      moduleFilters.labelsNot = filters.filters.excludeLabels.join(',');
    }
    if (filters.filters?.read !== undefined) {
      moduleFilters.read = [filters.filters.read];
      moduleFilters.byState = [
        {
          label: 'All',
          read: 1,
          selected: filters.filters.read === ReadStatusOptions.ALL
        },
        {
          label: 'Read',
          read: 2,
          selected: filters.filters.read === ReadStatusOptions.READ
        },
        {
          label: 'Not Read',
          read: 3,
          selected: filters.filters.read === ReadStatusOptions.NOT_READ
        }
      ];
    }
    if (filters.filters.modified !== undefined) {
      moduleFilters.modified = filters.filters.modified;
    }
    if (filters.filters?.starred !== undefined) {
      moduleFilters.favorite = filters.filters.starred;
    }
    if (filters.filters?.followed !== undefined) {
      moduleFilters.followed = filters.filters.followed;
    }
    if (filters.filters?.incidents !== undefined) {
      moduleFilters.incidents = filters.filters.incidents;
    }
    if (filters.filters?.terms?.length) {
      moduleFilters.terms = filters.filters.terms.join(',');
    }
    if (filters.filters?.sources?.length) {
      moduleFilters.transforms = filters.filters.sources.join(',');
    }
    if (filters.filters?.analysisCalcResult?.length) {
      moduleFilters.analysisCalcResult = filters.filters.analysisCalcResult;
    }

    if (filters.since && filters.to) {
      moduleFilters.byDate = {
        dateField: filters.dateField || ThreatDateFilterField.UPDATED_AT,
        sinceNumber: dayjs(filters.since).valueOf(),
        toNumber: dayjs(filters.to).valueOf()
      };
    }

    const current = get(store);
    if (!current.modules) {
      current.modules = {};
    }
    if (!current.modules[organizationId]) {
      current.modules[organizationId] = {};
    }
    if (!current.modules[organizationId][moduleId]) {
      current.modules[organizationId][moduleId] = {};
    }
    const currentModuleFilters = current.modules[organizationId][moduleId].filters || {};
    if (!isEqual(currentModuleFilters, moduleFilters)) {
      current.modules[organizationId][moduleId].filters = moduleFilters;
      await setAndSave(current);
    }
  }

  async function setExplorerPreferences(organizationId: number, moduleId: number, filters: GetCVEFilters) {
    const explorerPreferences: ExplorerPreferences = {};
    if (filters.endScore) explorerPreferences.endScore = filters.endScore;
    if (filters.startScore) explorerPreferences.startScore = filters.startScore;
    if (filters.priority) explorerPreferences.priority = filters.priority;
    if (filters.read) explorerPreferences.read = filters.read;
    if (filters.terms) explorerPreferences.terms = filters.terms;
    if (filters.since) explorerPreferences.since = filters.since;
    if (filters.to) explorerPreferences.to = filters.to;
    if (filters.excludeLabels) explorerPreferences.excludeLabels = filters.excludeLabels;
    if (filters.labels) explorerPreferences.labels = filters.labels;
    if (filters.labelsAnd) explorerPreferences.labelsAnd = filters.labelsAnd;
    if (filters.q) explorerPreferences.q = filters.q;

    const current = get(store);
    if (!current.modules) {
      current.modules = {};
    }
    if (!current.modules[organizationId]) {
      current.modules[organizationId] = {};
    }
    if (!current.modules[organizationId][moduleId]) {
      current.modules[organizationId][moduleId] = {};
    }
    const currentExplorerPreferences = current.modules[organizationId][moduleId].explorer ?? {};

    if (!isEqual(currentExplorerPreferences, explorerPreferences)) {
      current.modules[organizationId][moduleId].explorer = explorerPreferences;
      await setAndSave(current);
    }
  }

  return {
    ...store,
    loadPreferences,
    setChartStatus,
    setModulePreferences,
    setExplorerPreferences,
    setAndSave,
    set: setPreferences
  };
}

const preferencesStore = createPreferencesStore();

export default preferencesStore;
