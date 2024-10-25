<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { FilterTemplate } from '$lib/types/admin';
  import { scrollToTop } from '$lib/utils/functions';
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
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Checkmark, Edit, ManageProtection, TrashCan } from 'carbon-icons-svelte';
  import { tick } from 'svelte';
  import EditFilterTemplateModal from './EditFilterTemplateModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME', sort: () => 0 },
    { key: 'superSearchName', value: 'ORGANIZATION', sort: () => 0 },
    { key: 'actions', value: '', sort: false }
  ];

  let loading = false;
  let rows: FilterTemplate[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let actionLoading = false;
  let organizationId = 0;
  let selectedFilterId: number | undefined;
  let deleteModalOpen = false;
  let editModalOpen = false;
  let sortKey: string = 'name';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let searchValue = '';

  $: selectedFilter = rows.find((filter) => filter.id === selectedFilterId);
  $: onChangeSearch(searchValue);
  $: getFilterTemplates(page, pageSize, sortKey, sortDirection, search, organizationId);
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
    await getFilterTemplates(page, pageSize, sortKey, sortDirection, search, organizationId);
  }

  async function getFilterTemplates(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search = '',
    organizationId = 0
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getFilterTemplates(page, pageSize, search, sortKey, ascending, organizationId);
    totalItems = response.totalRegistres;
    rows = response.filterTemplates;
    await tick();
    loading = false;
  }

  function onClickDelete(filterId: number) {
    selectedFilterId = filterId;
    deleteModalOpen = true;
  }

  async function deleteFilterTemplate(filterId: number) {
    actionLoading = true;
    await client.admin.deleteFilterTemplate(filterId);
    actionLoading = false;
    deleteModalOpen = false;
    await refresh();
  }

  function onClickEdit(filterId: number) {
    selectedFilterId = filterId;
    editModalOpen = true;
  }

  function onClickAdd() {
    selectedFilterId = null;
    editModalOpen = true;
  }
</script>

<h4>Filters Template</h4>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}
      [&_th:nth-child(3)]:w-16
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
        </div>
        <ToolbarSearch
          placeholder="Search for filter name..."
          persistent
          class="max-w-[300px]"
          bind:value={searchValue}
        />
        <Button on:click={onClickAdd} icon={Add}>Add Filter</Button>
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
      {:else if cell.key === 'labelProtected'}
        {#if cell.value}
          <div class="flex justify-center items-center">
            <ManageProtection title="Protected label" />
          </div>
        {/if}
      {:else if cell.key === 'labelTypeName'}
        <div class="flex justify-center text-center">
          {cell.value || '-'}
        </div>
      {:else if cell.key === 'prioritized'}
        <div class="flex justify-center text-center">
          {#if cell.value}
            <Checkmark class="text-ctip-success" />
          {:else}
            -
          {/if}
        </div>
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
      <Pagination class="mb-10" bind:pageSize bind:page {totalItems} {pageSizes} />
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

<WarningModal
  bind:open={deleteModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to delete the filter {selectedFilter?.name}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={() => deleteFilterTemplate(selectedFilterId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>
<EditFilterTemplateModal filterId={selectedFilterId} bind:open={editModalOpen} on:save={refresh} />
