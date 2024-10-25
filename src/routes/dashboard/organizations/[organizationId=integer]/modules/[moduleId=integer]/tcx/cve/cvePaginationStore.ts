import Client from '$lib/client';
import type { TCXCVEResponse, TCXQuery } from '$lib/types/tcx';
import createPaginationStore from '$stores/createPaginationStore';
import type { DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';

export type CVESearchParams = {
  page: number;
  pageSize: number;
  sortKey?: TCXQuery['sort'];
  sortDirection?: DataTableProps['sortDirection'];
  dork?: string;
};

const client = new Client();

function getData(form: CVESearchParams) {
  if (!form) return;
  const query: TCXQuery = {
    'page[limit]': form.pageSize,
    'page[offset]': form.pageSize * (form.page - 1)
  };
  if (form.sortKey) {
    const dash = form.sortDirection === 'descending' ? '-' : '';
    query.sort = `${dash}${form.sortKey}` as TCXQuery['sort'];
  }
  if (form.dork) {
    query.dork = form.dork;
  }

  return client.tcx.getCVEs(query);
}

function getTotalPages(results: TCXCVEResponse) {
  return results?.meta?.pagination?.count || 1;
}

const cvePagination = createPaginationStore(getData, getTotalPages);
export default cvePagination;
