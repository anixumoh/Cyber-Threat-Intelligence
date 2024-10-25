<script lang="ts">
  import Client from '$lib/client';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { ScheduledJob } from '$lib/types/admin';
  import { scrollToTop } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Toolbar,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { CaretUp, Renew } from 'carbon-icons-svelte';
  import { tick } from 'svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'transformName', value: 'TRANSFORM', sort: () => 0 },
    { key: 'organizationName', value: 'ORGANIZATION', sort: () => 0 },
    { key: 'moduleName', value: 'MODULE', sort: () => 0 },
    { key: 'searchPhrase', value: 'SEARCH WORD', sort: () => 0 },
    { key: 'schedulingExpression', value: 'SEARCH WORD', sort: false }
  ];

  let loading = false;
  let rows: ScheduledJob[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let sortKey: string = '';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let searchValue = '';

  $: onChangeSearch(searchValue);
  $: getJobsScheduled(page, pageSize, sortKey, sortDirection, search);

  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        page = 1;
        search = value;
      }, 1000);
    }
  }

  async function refresh() {
    await getJobsScheduled(page, pageSize, sortKey, sortDirection, search);
  }

  async function getJobsScheduled(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search = ''
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getJobsScheduled(page, pageSize, search, sortKey, ascending);
    totalItems = response.total;
    rows = response.jobs;
    await tick();
    loading = false;
  }
</script>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}"
    size="compact"
    rows={rows.map((row, id) => ({ id, ...row }))}
    sortable
    bind:sortKey
    bind:sortDirection
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarContent>
        <div class="flex justify-between items-center w-full">
          <Button on:click={refresh} kind="ghost" disabled={loading} icon={Renew}>Refresh Jobs Scheduled</Button>
          <ToolbarSearch placeholder="Search for scheduled jobs" persistent class="max-w-[300px]" bind:value={searchValue} />
        </div>
      </ToolbarContent>
    </Toolbar>
  </DataTable>

  {#if loading}
    <div class="absolute inset-0 flex pointer-events-none">
      <InlineLoading class="flex items-center justify-center" />
    </div>
  {/if}
</div>

{#if rows.length}
  <div class="sticky bottom-0 -mt-12">
    <div>
      <Pagination
        class="mb-10"
        bind:pageSize
        bind:page
        {totalItems}
        {pageSizes}
        itemRangeText={(min, max, total) => `${min}–${max}`}
      />
      <div class="absolute bottom-1 right-72">
        <Button
          on:click={scrollToTop}
          size="small"
          tooltipPosition="top"
          iconDescription="Scroll to top"
          kind="primary"
          icon={CaretUp}
        />
      </div>
    </div>
  </div>
{:else if !loading}
  <EmptyData />
{/if}
