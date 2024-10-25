<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { PluginItem } from '$lib/types/admin';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Toggle,
    Toolbar,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, TrashCan } from 'carbon-icons-svelte';
  import EditPluginModal from './EditPluginModal.svelte';
  import PreviewPluginModal from './PreviewPluginModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME', sort: () => 0 },
    { key: 'type', value: 'TYPE', sort: () => 0 },
    { key: 'enabled', value: 'ENABLED', sort: false },
    { key: 'updatedAt', value: 'LAST UPDATE', sort: () => 0, display: getHumanReadableDate },
    { key: 'actions', value: '', sort: false }
  ];

  let loading = false;
  let rows: PluginItem[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let selectedPluginName: string;
  let deleteModalOpen = false;
  let previewModalOpen = false;
  let editModalOpen = false;
  let deleting = false;

  let sortKey: string = 'updatedAt';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let searchValue = '';

  $: onChangeSearch(searchValue);
  $: getPlugins(page, pageSize, sortKey, sortDirection, search);

  function onChangeSearch(searchValue: string) {
    if (searchValue === '' || searchValue.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = searchValue;
      }, 1000);
    }
  }

  async function refresh() {
    await getPlugins(page, pageSize, sortKey, sortDirection, search);
  }

  async function getPlugins(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search: string = ''
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getPlugins(page, pageSize, search, sortKey, ascending);
    totalItems = response.total_resources;
    rows = response.list;
    loading = false;
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onClickAdd() {
    selectedPluginName = null;
    editModalOpen = true;
  }

  function onClickPreview(pluginName: string) {
    selectedPluginName = pluginName;
    previewModalOpen = true;
  }

  function onClickEdit(pluginName: string) {
    selectedPluginName = pluginName;
    editModalOpen = true;
  }

  function onClickDelete(pluginName: string) {
    selectedPluginName = pluginName;
    deleteModalOpen = true;
  }
  async function deletePlugin() {
    deleting = true;
    await client.admin.deletePlugin(selectedPluginName);
    deleteModalOpen = false;
    deleting = false;
    await refresh();
  }

  async function toggleEnablePlugin(name: string) {
    await client.admin.toggleEnablePlugin(name);
  }
</script>

<h4>Plugins</h4>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-14 {loading ? '[&>table]:opacity-20 select-none' : ''}
    [&_td]:text-center
    [&_td:nth-child(1)]:text-left
    [&_th:nth-child(5)]:w-16"
    size="compact"
    rows={rows.map((row, i) => ({
      id: row.name,
      ...row
    }))}
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
        <ToolbarSearch placeholder="Search for name or value..." class="max-w-md" bind:value={searchValue} />
        <Button on:click={onClickAdd} icon={Add}>Add Plugin</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'name'}
        <Button size="small" kind="ghost" on:click={() => onClickPreview(row.name)}>
          {cell.value}
        </Button>
      {:else if cell.key === 'actions'}
        <div class="flex items-center justify-center gap-1.5">
          <Button
            on:click={() => onClickEdit(row.name)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
          />
          <Button
            on:click={() => onClickDelete(row.name)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
          />
        </div>
      {:else if cell.key === 'enabled'}
        <Toggle
          on:toggle={() => toggleEnablePlugin(row.name)}
          class="flex justify-center items-center"
          size="sm"
          toggled={cell.value}
          labelA=""
          labelB=""
        />
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
      <div class="absolute bottom-1 right-60">
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
  question="Are you sure you want to remove the plugin {selectedPluginName}"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={deletePlugin}
  primaryButtonDisabled={deleting}
  primaryButtonIcon={deleting ? InlineLoading : undefined}
/>

<PreviewPluginModal
  on:edit={() => {
    editModalOpen = true;
    previewModalOpen = false;
  }}
  bind:open={previewModalOpen}
  bind:name={selectedPluginName}
/>

<EditPluginModal on:save={refresh} bind:open={editModalOpen} bind:name={selectedPluginName} />
