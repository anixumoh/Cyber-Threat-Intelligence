<script lang="ts">
  import { pageSizes } from '$lib/constants/pagination';
  import { Button, FormGroup, Modal, Pagination, TextArea, TextInput } from 'carbon-components-svelte';
  import { DataTable, DataTableSkeleton, Toolbar, ToolbarContent, ToolbarSearch } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import preferencesStore from '$stores/preferences';
  import { tick } from 'svelte';
  import type { RssType } from '$lib/types/settings';
  import { InformationFilled } from 'carbon-icons-svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'id', value: '', sort: false }
  ];

  let rows: RssType[] = [];
  let loading = true;
  let maxRows = $preferencesStore?.defaultRows || 10;
  let sortDirection: DataTableProps['sortDirection'] = 'none';
  let page = 1;
  let search = '';
  let totalItems = 0;
  let searchDebounce: ReturnType<typeof setTimeout>;
  let sortKey: string = null;
  let searchValue = '';

  let detailModalOpen = false;
  let selectedName: string;
  let selectedPlugin: string;

  $: onChangeSearch(searchValue);
  $: getRssType(page, maxRows, search, sortKey, sortDirection);

  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 2) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
      }, 1000);
    }
  }

  function onDetails(name: string, plugin: string) {
    selectedPlugin = plugin;
    selectedName = name;
    detailModalOpen = true;
  }

  async function getRssType(
    page: number,
    maxRows: number,
    search: string = '',
    sortKey: string,
    sortDirection: DataTableProps['sortDirection']
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getRssType(page, maxRows, search, sortKey, ascending);
    totalItems = response.totalRegistres;
    rows = response.rssFeedType;
    await tick();
    loading = false;
  }
</script>

<h4>RSS</h4>

{#if loading}
  <DataTableSkeleton {headers} rows={maxRows} showHeader={false} />
{:else}
  <DataTable
    sortable
    bind:sortKey
    bind:sortDirection
    class="[&_td]:text-left"
    {headers}
    rows={rows.map((r) => ({
      ...r,
      name: r.name
    }))}
    id="rss-table"
  >
    <Toolbar>
      <ToolbarContent>
        <ToolbarSearch class="max-w-md" bind:value={searchValue} placeholder="Search for rss name" />
      </ToolbarContent>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        {row.name}
      {:else}
        <div class="flex justify-end">
          <Button
            kind="ghost"
            on:click={() => onDetails(row.name, row.plugin)}
            size="small"
            icon={InformationFilled}
            iconDescription="Detail"
          />
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>

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
{/if}

<Modal
  modalHeading="Details"
  size="sm"
  primaryButtonText="Close"
  on:click:button--primary={() => (detailModalOpen = false)}
  bind:open={detailModalOpen}
>
  <div class="p-4">
    <FormGroup>
      <TextInput labelText="Name" readonly value={selectedName} />
    </FormGroup>
    <FormGroup>
      <TextArea labelText="Plugin" readonly value={selectedPlugin || ''} />
    </FormGroup>
  </div>
</Modal>
