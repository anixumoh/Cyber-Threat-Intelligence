<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { ChartDataGen, ChartListItem } from '$lib/types/admin';
  import { moduleCacheStore } from '$stores/module';
  import { organizationsStore } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Select,
    SelectItem,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, TrashCan } from 'carbon-icons-svelte';
  import { tick } from 'svelte';
  import ChartDetailModal from './ChartDetailModal.svelte';
  import CreateEditChartModal from './CreateEditChartModal.svelte';
  import { CHART_TYPE_MAP } from './constants';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'title', value: 'TITLE', sort: () => 0 },
    { key: 'organizationName', value: 'ORGANIZATION', sort: () => 0 },
    { key: 'moduleName', value: 'MODULE', sort: () => 0 },
    { key: 'type', value: 'TYPE', sort: false, display: (type) => CHART_TYPE_MAP[type] ?? '-' },
    { key: 'complete', value: 'COMPLETE CONFIGURATION', sort: false },
    { key: 'actions', value: '', sort: false }
  ];

  let loading = false;
  let rows: ChartListItem[] = [];
  let datagen: ChartDataGen[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let actionLoading = false;
  let detailModalOpen = false;
  let organizationId = 0;
  let moduleId = 0;
  let selectedChartId: number;
  let deleteModalOpen = false;
  let editChartModalOpen = false;
  let sortKey: string = 'title';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let searchValue = '';

  $: selectedChart = rows.find((chart) => chart.id === selectedChartId);
  $: getDatagen();
  $: onChangeOrganization(organizationId);
  $: onChangeSearch(searchValue);
  $: getCharts(page, pageSize, sortKey, sortDirection, search, organizationId, moduleId);
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;

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
    await getCharts(page, pageSize, sortKey, sortDirection, search, organizationId, moduleId);
  }

  async function getDatagen() {
    const response = await client.admin.getChartDatagen();
    datagen = response.list;
  }

  async function getCharts(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search = '',
    organizationId = 0,
    moduleId = 0
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getCharts(page, pageSize, search, sortKey, ascending, organizationId, moduleId);
    totalItems = response.total_resources;
    rows = response.list;
    await tick();
    loading = false;
  }

  function openDetail(chartId: number) {
    selectedChartId = chartId;
    detailModalOpen = true;
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onClickDelete(chartId: number) {
    selectedChartId = chartId;
    deleteModalOpen = true;
  }

  async function deleteChart(chartId: number) {
    actionLoading = true;
    await client.admin.deleteChart(chartId);
    actionLoading = false;
    deleteModalOpen = false;
    await refresh();
  }

  function onClickEdit(chartId: number) {
    selectedChartId = chartId;
    editChartModalOpen = true;
  }

  function onClickAdd() {
    selectedChartId = null;
    editChartModalOpen = true;
  }

  function onChangeOrganization(organizationId: number) {
    moduleId = 0;
    if (organizationId && !$moduleCacheStore[organizationId]) moduleCacheStore.fetchModules(organizationId);
  }
</script>

<h4>Charts</h4>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}
    [&_td:nth-child(4)]:text-center
    "
    size="compact"
    {rows}
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
        <div class="flex items-center justify-center gap-4">
          <Select class="[&_select]:w-[200px] [&_select]:border" bind:selected={organizationId}>
            <SelectItem value={0} text="All organizations" />
            {#each $organizationsStore as org}
              <SelectItem value={org.id} text={org.name} />
            {/each}
          </Select>
          <Select class="[&_select]:w-[200px] [&_select]:border" bind:selected={moduleId} disabled={!organizationId}>
            <SelectItem value={0} text="All Modules" />
            {#if organizationId}
              {#each $moduleCacheStore[organizationId] ?? [] as org}
                <SelectItem value={org.id} text={org.name} />
              {/each}
            {/if}
          </Select>
        </div>
        <ToolbarSearch placeholder="Search for title..." persistent class="max-w-[300px]" bind:value={searchValue} />
        <Button on:click={onClickAdd} icon={Add}>Add Chart</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'actions'}
        <div class="flex items-center justify-center gap-1.5">
          <Button
            on:click={() => onClickEdit(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
          />
          <Button
            on:click={() => onClickDelete(row.id)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
          />
        </div>
      {:else if cell.key === 'title'}
        <Button size="small" kind="ghost" on:click={() => openDetail(row.id)}>
          {cell.value}
        </Button>
      {:else if cell.key === 'complete'}
        <TooltipDefinition
          class="flex items-center justify-center"
          tooltipText={cell.value ? 'Enabled' : 'Disabled'}
          direction="top"
        >
          <div
            class="rounded-full w-4 shadow-xl aspect-square m-2"
            class:bg-ctip-success={cell.value}
            class:bg-ctip-danger={!cell.value}
          />
        </TooltipDefinition>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value || '-'}
      {/if}
    </svelte:fragment>
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
          on:click={scrollToTopOfTable}
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

<WarningModal
  bind:open={deleteModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to delete the graph {selectedChart?.title}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={() => deleteChart(selectedChartId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>

<ChartDetailModal bind:open={detailModalOpen} {selectedChart} {datagen} />
<CreateEditChartModal bind:open={editChartModalOpen} {selectedChart} {datagen} on:save={refresh} />
