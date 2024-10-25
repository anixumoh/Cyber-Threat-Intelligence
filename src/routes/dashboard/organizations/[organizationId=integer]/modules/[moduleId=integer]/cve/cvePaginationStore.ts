import Client from '$lib/client';
import type { CVEResponse } from '$lib/client/services/malware';
import type { FilterExplorerType, GetCVEFilters } from '$lib/types/explorer';
import type { TCXQuery } from '$lib/types/tcx';
import { getSinceOrToDate } from '$lib/utils/functions';
import createPaginationStore from '$stores/createPaginationStore';
import { currentModuleId } from '$stores/module';
import { currentOrganizationId } from '$stores/organization';
import preferencesStore from '$stores/preferences';
import type { DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
import { get } from 'svelte/store';

export type CVESearchParams = {
  page: number;
  pageSize: number;
  sortKey?: TCXQuery['sort'];
  sortDirection?: DataTableProps['sortDirection'];
  dork?: string;
};

const client = new Client();

async function getData(filters: FilterExplorerType) {
  const myfilters: GetCVEFilters = {
    maxRows: filters.maxRows,
    page: filters.page,
    read: filters.read
  };
  if (filters?.since && filters?.to) {
    myfilters.since = getSinceOrToDate(filters.since).valueOf();
    myfilters.to = getSinceOrToDate(filters.to).valueOf();
  }
  if (filters.sortDirection !== 'none' && filters.sortKey) {
    myfilters.o = filters.sortKey;
    myfilters.sort = filters.sortDirection === 'ascending';
  }
  if (filters.labels.length) myfilters.labels = filters.labels.join(',');
  if (filters.labelsAnd.length) myfilters.labelsAnd = filters.labelsAnd.join(',');
  if (filters.excludeLabels.length) myfilters.excludeLabels = filters.excludeLabels.join(',');
  if (filters.q) myfilters.q = filters.q;
  if (filters.selectedTerms?.length) myfilters.terms = filters.selectedTerms.join(',');
  if (filters.selectedRisk?.length) myfilters.priority = filters.selectedRisk.join(',');
  if (filters.startScore) myfilters.startScore = filters.startScore;
  if (filters.endScore) myfilters.endScore = filters.endScore;

  // Validate filters
  if (filters.startScore && (filters.startScore < 0 || filters.startScore > 10)) return;
  if (filters.endScore && (filters.endScore < 0 || filters.endScore > 10)) return;

  const orgId = get(currentOrganizationId);
  const modId = get(currentModuleId);

  const response = await client.malware.getCVES(orgId, modId, myfilters);
  await preferencesStore.setExplorerPreferences(orgId, modId, myfilters);
  return response.data;
}

function getTotalPages(results: CVEResponse, filters: FilterExplorerType) {
  const totalResources = results?.total_resources || 1;
  const maxRows = filters?.maxRows || 10;
  return Math.ceil(totalResources / maxRows);
}

const cvePagination = createPaginationStore(getData, getTotalPages);
export default cvePagination;
