<script lang="ts">
  import ScoreCve from '$lib/components/ScoreCve.svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import { dataToCsv, downloadFile, getObjectValueByDottedKey, getPageOptions } from '$lib/utils/functions';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    Pagination,
    Toolbar,
    ToolbarBatchActions
  } from 'carbon-components-svelte';
  import type {
    DataTableHeader,
    DataTableProps,
    DataTableRow
  } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Copy, DocumentExport, JsonReference } from 'carbon-icons-svelte';
  import copy from 'clipboard-copy';
  import dayjs from 'dayjs';
  import EmptyData from '../EmptyData/EmptyData.svelte';

  export let loading = false;
  export let headers: DataTableHeader[];
  export let rows: DataTableRow[];
  export let fileName: string;
  export let sortable = false;
  export let sortKey: string = undefined;
  export let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  export let serverPagination = false;

  export let selectedRowIds: any[] = [];
  export let pageSize: number = 10;
  export let page = 1;
  export let totalItems = 0; // only when serverPagination

  $: pageInputDisabled = serverPagination && totalItems > 10_000;

  function getRowsData() {
    const selectedRows = rows.filter((row) => selectedRowIds.includes(row.id));

    const data = selectedRows.map((row) => {
      const processedRow: Record<string, any> = {};
      headers.forEach((header) => {
        if ('value' in header) {
          processedRow[header.value] = header.display
            ? header.display(row)
            : getObjectValueByDottedKey(row, header.key);
        }
      });
      return processedRow;
    });
    return data;
  }

  function exportToCVS() {
    const data = getRowsData();
    const csv = dataToCsv(data);
    downloadFile(`${fileName}.csv`, csv, 'text/csv');
    selectedRowIds = [];
  }

  function exportToJSON() {
    const data = getRowsData();
    const json = JSON.stringify(data);
    downloadFile(`${fileName}.json`, json, 'text/json');
    selectedRowIds = [];
  }

  function exportToCopy() {
    const data = getRowsData();
    const text = data.map((row) => Object.values(row).join('\t')).join('\n');
    copy(text);
    selectedRowIds = [];
  }

  function formatDate(value: string) {
    try {
      return dayjs(value).format('D/M/YYYY');
    } catch (error) {
      return '-';
    }
  }

  function fixFloats(value: number) {
    return value.toFixed(1);
  }
</script>

<div class:hidden={!loading}>
  <DataTableSkeleton rows={pageSize} showHeader={false} />
</div>
<div class:hidden={loading}>
  <DataTable
    batchSelection
    {sortable}
    {headers}
    {rows}
    bind:sortKey
    bind:sortDirection
    bind:selectedRowIds
    page={serverPagination ? 0 : page}
    pageSize={serverPagination ? 0 : pageSize}
  >
    <Toolbar>
      <slot name="toolbar" />
      <ToolbarBatchActions>
        <Button on:click={exportToCVS} icon={DocumentExport}>Export to CSV</Button>
        <Button on:click={exportToJSON} icon={JsonReference}>Export to JSON</Button>
        <Button on:click={exportToCopy} icon={Copy}>Copy to clipboard</Button>
      </ToolbarBatchActions>
    </Toolbar>

    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'attributes.tlp'}
        <Tlp readonly status={cell.value?.toUpperCase()} />
      {:else if cell.key === 'attributes.risk' || cell.key === 'attributes.score'}
        <ScoreCve score={fixFloats(cell.display ? cell.display(row) : cell.value)} />
      {:else if cell.key === 'attributes.first_seen' || cell.key === 'attributes.last_seen' || cell.key === 'attributes.published_at'}
        <div class="flex items-center justify-center">
          {formatDate(cell.value)}
        </div>
      {:else}
        <slot {row} {cell} displayed={cell.display ? cell.display(row) : cell.value}>
          {cell.display ? cell.display(row) : cell.value}
        </slot>
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if !rows.length}
    <EmptyData />
  {/if}
</div>

{#if pageSize && serverPagination ? totalItems > pageSize : rows.length > pageSize}
  <div class="sticky bottom-0">
    <Pagination
      {pageInputDisabled}
      {pageSizes}
      bind:pageSize
      bind:page
      totalItems={serverPagination ? totalItems : rows.length}
    />

    {#if pageInputDisabled}
      <div class="absolute bottom-1 right-24 flex items-center gap-4">
        <div class="text-base">
          <select bind:value={page}>
            {#each getPageOptions(page, totalItems, pageSize) as o}
              <option disabled={o.disabled} value={o.value}>{o.text}</option>
            {/each}
          </select>
          <span class="ml-1">
            of {new Intl.NumberFormat().format(Math.ceil(totalItems / pageSize))} pages
          </span>
        </div>
      </div>
    {/if}
  </div>
{/if}
