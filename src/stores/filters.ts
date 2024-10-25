import { defaultStatusOptions, isDefaultStatusOptions } from '$lib/constants/threat';
import {
  ModifiedStatusOptions,
  ReadStatusOptions,
  ThreatDateFilterField,
  type ResetThreatsFiltersType,
  type ThreatFilterType,
  type ThreatSearchType
} from '$lib/types/threat';
import dayjs from 'dayjs';
import { cloneDeep } from 'lodash';
import { derived, writable } from 'svelte/store';
import type { PreferencesType } from './preferences';

const initFilter: ThreatSearchType = {
  page: 1,
  maxRows: 10,
  days: 15,
  forceUpdate: 0,
  filters: {
    analysisCalcResult: [...defaultStatusOptions],
    labels: [],
    labelsAnd: [],
    excludeLabels: [],
    terms: [],
    sources: [],
    read: ReadStatusOptions.ALL,
    modified: ModifiedStatusOptions.ALL
  }
};

function createThreatsFilterStore() {
  const { subscribe, update, set } = writable<ThreatSearchType>(cloneDeep(initFilter));

  function clearFilters(params?: ResetThreatsFiltersType) {
    if (params) {
      set({ ...cloneDeep(initFilter), ...params });
    } else {
      set({ ...cloneDeep(initFilter) });
    }
  }

  function getInitialAllThreadFilter(preferences: PreferencesType) {
    const page = +new URL(window.location.href).searchParams.get('page') || 1;

    const threadSearch: ThreatSearchType = {
      ...cloneDeep(initFilter),
      maxRows: preferences.defaultRows,
      page
    };
    set(threadSearch);
  }

  function getInitialIncidentsFilter() {
    const incidentsFilter: ThreatSearchType = {
      ...cloneDeep(initFilter)
    };
    set(incidentsFilter);
  }

  function getInitialThreadFilter(organizationId: number, moduleId: number | null, preferences: PreferencesType) {
    const moduleFilters = preferences?.modules?.[organizationId]?.[moduleId]?.filters;
    const labels = moduleFilters?.labels?.split(',').map(Number) ?? [];
    const labelsAnd = moduleFilters?.labelsAnd?.split(',').map(Number) ?? [];
    const excludeLabels = moduleFilters?.labelsNot?.split(',').map(Number) ?? [];
    const terms = moduleFilters?.terms?.split(',').map(Number) ?? [];
    const sources = moduleFilters?.transforms?.split(',') ?? [];
    const read = moduleFilters?.read?.length ? (moduleFilters.read[0] as ReadStatusOptions) : ReadStatusOptions.ALL;
    const modified = moduleFilters?.modified?.length ? moduleFilters.modified : ModifiedStatusOptions.ALL;

    const filters: ThreatFilterType = {
      analysisCalcResult: [...defaultStatusOptions],
      labels,
      labelsAnd,
      excludeLabels,
      terms,
      sources,
      read,
      modified
    };

    if (moduleFilters?.favorite !== undefined) {
      filters.starred = moduleFilters.favorite;
    }
    if (moduleFilters?.followed !== undefined) {
      filters.followed = moduleFilters.followed;
    }
    if (moduleFilters?.incidents !== undefined) {
      filters.incidents = moduleFilters.incidents;
    }
    if (moduleFilters?.analysisCalcResult?.length && !isDefaultStatusOptions(moduleFilters.analysisCalcResult)) {
      filters.analysisCalcResult = moduleFilters.analysisCalcResult;
    }

    const page = +new URL(window.location.href).searchParams.get('page') || 1;
    const q = new URL(window.location.href).searchParams.get('q');

    const threadSearch: ThreatSearchType = {
      page,
      maxRows: preferences.defaultRows,
      days: 15,
      forceUpdate: 0,
      filters
    };
    if (q) {
      threadSearch.q = q;
    }

    if (moduleFilters?.byDate?.sinceNumber && moduleFilters?.byDate?.toNumber) {
      threadSearch.dateField = moduleFilters.byDate.dateField || ThreatDateFilterField.UPDATED_AT;
      threadSearch.since = dayjs(moduleFilters.byDate.sinceNumber).toDate();
      threadSearch.to = dayjs(moduleFilters.byDate.toNumber).toDate();
    }

    set(threadSearch);
  }

  return {
    clearFilters,
    getInitialAllThreadFilter,
    getInitialIncidentsFilter,
    getInitialThreadFilter,
    subscribe,
    update,
    set
  };
}

const threatsFilterStore = createThreatsFilterStore();
export default threatsFilterStore;

export const filtersCount = derived(threatsFilterStore, (filters) => {
  const appliedFilters: boolean[] = [
    !!filters.since || !!filters.to,
    filters.filters.sources.length > 0,
    filters.filters.terms.length > 0,
    !isDefaultStatusOptions(filters.filters.analysisCalcResult),
    filters.filters.read.valueOf() > 0 || filters.filters.modified !== ModifiedStatusOptions.ALL,

    !!filters.filters.starred,
    !!filters.filters.followed,
    !!filters.filters.incidents,
    !!filters.filters.userSubmitted,
    !!filters.filters.targeted,

    filters.filters.labels.length > 0,
    filters.filters.labelsAnd.length > 0,
    filters.filters.excludeLabels.length > 0
  ];
  return appliedFilters.filter(Boolean).length;
});
