<script lang="ts">
  import { pageSizes } from '$lib/constants/pagination';
  import { Pagination } from 'carbon-components-svelte';
  import { DataTable, DataTableSkeleton, Toolbar, ToolbarContent, ToolbarSearch } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import type { SupportedTld } from '$lib/types/admin';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import preferencesStore from '$stores/preferences';
  import dayjs from 'dayjs';
  import { tick } from 'svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME', sort: () => 0 },
    {
      key: 'data.description',
      sort: false,
      value: 'DESCRIPTION',
      display: (item) => item || '-'
    },
    { key: 'source', value: 'SOURCE', sort: () => 0 },
    { key: 'lastUpdated', value: 'LAST UPDATED', sort: () => 0 },
    { key: 'dataSourceQuality', value: 'QUALITY', sort: false }
  ];

  let rows: SupportedTld[] = [];
  let loading = true;
  let maxRows = $preferencesStore?.defaultRows || 10;
  let sortDirection: DataTableProps['sortDirection'] = 'none';
  let page = 1;
  let search = '';
  let totalItems = 0;
  let searchDebounce: ReturnType<typeof setTimeout>;
  let sortKey: string = null;
  let searchValue = '';

  $: onChangeSearch(searchValue);
  $: getSupportTest(page, maxRows, search, sortKey, sortDirection);

  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 2) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
      }, 1000);
    }
  }

  async function getSupportTest(
    page: number,
    maxRows: number,
    search: string = '',
    sortKey: string,
    sortDirection: DataTableProps['sortDirection']
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getSupportedTld(page, maxRows, search, sortKey, ascending);
    totalItems = response.total_resources;
    rows = response.list;
    await tick();
    loading = false;
  }
</script>

<h4>Supported TLD</h4>

{#if loading}
  <DataTableSkeleton {headers} rows={maxRows} showHeader={false} />
{:else}
  <DataTable
    sortable
    bind:sortKey
    bind:sortDirection
    class="[&_td]:text-center"
    {headers}
    rows={rows.map((r, n) => ({
      ...r,
      id: n,
      lastUpdated: r.lastUpdated ? dayjs(r.lastUpdated).format('DD/MM/YYYY') : '-',
      name: r.data.name
    }))}
    id="supported-table"
  >
    <Toolbar>
      <ToolbarContent>
        <ToolbarSearch class="max-w-md" bind:value={searchValue} placeholder="Search by name" />
      </ToolbarContent>
    </Toolbar>
  </DataTable>
{/if}

{#if rows.length}
  <div class="sticky bottom-0">
      <Pagination
        class="mb-10"
        bind:pageSize={maxRows}
        bind:page
        {totalItems}
        {pageSizes}
        itemRangeText={(min, max, total) => `${min}–${max}`}
      />
  </div>
{:else if !loading}
  <EmptyData />
{/if}
