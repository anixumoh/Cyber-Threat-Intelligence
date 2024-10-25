<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { Label } from '$lib/types/admin';
  import { moduleCacheStore } from '$stores/module';
  import { organizationsStore } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    InlineLoading,
    Modal,
    Pagination,
    Select,
    SelectItem,
    Tag,
    Toolbar,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Checkmark, Edit, ManageProtection, TrashCan } from 'carbon-icons-svelte';
  import { tick } from 'svelte';

  import roleStore from '$stores/role';
  import EditLabelModal from '$src/routes/admin/labels/EditLabelModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'labelProtected', value: '', sort: false },
    { key: 'label', value: 'LABEL NAME', sort: () => 0 },
    { key: 'organizationName', value: 'ORGANIZATION', sort: () => 0 },
    { key: 'moduleName', value: 'MODULE', sort: () => 0 },
    { key: 'labelTypeName', value: 'TYPE', sort: () => 0 },
    { key: 'prioritized', value: 'PRIORITY', sort: () => 0 },
    { key: 'actions', value: '', sort: false }
  ];

  let loading = false;
  let rows: Label[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let actionLoading = false;
  let detailModalOpen = false;
  let moduleId = 0;
  let selectedLabelId: number;
  let deleteModalOpen = false;
  let editLabelModalOpen = false;
  let sortKey: string = 'label';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let searchValue = '';

  export let predefinedOrganizationId: number;
  let organizationId = predefinedOrganizationId ? predefinedOrganizationId : 0;

  $: selectedLabel = rows.find((label) => label.id === selectedLabelId);
  $: canEditProtected = $roleStore.master || $roleStore.superadmin;
  $: onChangeOrganization(organizationId);
  $: onChangeSearch(searchValue);
  $: getLabels(page, pageSize, sortKey, sortDirection, search, organizationId, moduleId);
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
    await getLabels(page, pageSize, sortKey, sortDirection, search, organizationId, moduleId);
  }

  async function getLabels(
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
    const response = await client.admin.getLabels(page, pageSize, search, sortKey, ascending, organizationId, moduleId);
    totalItems = response.total_resources;
    rows = response.list;
    await tick();
    loading = false;
  }

  function openDetail(labelId: number) {
    selectedLabelId = labelId;
    detailModalOpen = true;
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onClickDelete(labelId: number) {
    selectedLabelId = labelId;
    deleteModalOpen = true;
  }

  async function deleteLabel(labelId: number) {
    actionLoading = true;
    await client.admin.deleteLabel(labelId);
    actionLoading = false;
    deleteModalOpen = false;
    await refresh();
  }

  function onClickEdit(labelId: number) {
    selectedLabelId = labelId;
    editLabelModalOpen = true;
  }

  function onClickAdd() {
    selectedLabelId = null;
    editLabelModalOpen = true;
  }

  function onChangeOrganization(organizationId: number) {
    moduleId = 0;
    if (organizationId && !$moduleCacheStore[organizationId]) moduleCacheStore.fetchModules(organizationId);
  }
</script>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}
      [&_th:nth-child(1)]:w-10
      [&_th:nth-child(7)]:w-16
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
          {#if !predefinedOrganizationId}
            <Select class="[&_select]:w-[200px] [&_select]:border" bind:selected={organizationId}>
              <SelectItem value={0} text="All organizations" />
              {#each $organizationsStore as org}
                <SelectItem value={org.id} text={org.name} />
              {/each}
            </Select>
          {/if}
          <Select class="[&_select]:w-[200px] [&_select]:border" bind:selected={moduleId} disabled={!organizationId}>
            <SelectItem value={0} text="All Modules" />
            {#if organizationId}
              {#each $moduleCacheStore[organizationId] ?? [] as org}
                <SelectItem value={org.id} text={org.name} />
              {/each}
            {/if}
          </Select>
        </div>
        <ToolbarSearch placeholder="Search for labels..." persistent class="max-w-[300px]" bind:value={searchValue} />
        <Button on:click={onClickAdd} icon={Add}>Add Label</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'label'}
        <Button on:click={() => openDetail(row.id)} class="[&_div]:cursor-pointer" kind="ghost" size="small">
          <LabelItem label={row} />
        </Button>
      {:else if cell.key === 'actions'}
        <div class="flex items-center justify-center gap-1.5">
          <Button
            on:click={() => onClickEdit(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
            disabled={!canEditProtected && row.labelProtected}
          />
          <Button
            on:click={() => onClickDelete(row.id)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
            disabled={!canEditProtected && row.labelProtected}
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
  question="Are you sure you want to delete the label {selectedLabel?.label}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={() => deleteLabel(selectedLabelId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>

<EditLabelModal {predefinedOrganizationId} bind:open={editLabelModalOpen} label={selectedLabel} on:save={refresh} />

<Modal
  class="h-full w-full"
  bind:open={detailModalOpen}
  modalHeading="Label Detail"
  secondaryButtonText="Close"
  primaryButtonText="Edit"
  on:click:button--secondary={() => (detailModalOpen = false)}
  on:click:button--primary={() => {
    detailModalOpen = false;
    onClickEdit(selectedLabelId);
  }}
>
  <div class="px-8">
    <div class="p-2.5 bg-ctip-hover-ui">Label Info</div>

    <div class="border">
      <div class="flex justify-between items-center border p-2.5">
        <div>LABEL</div>
        <div>{selectedLabel?.label}</div>
      </div>
      <div class="flex justify-between items-center border p-2.5">
        <div>ORGANIZATION NAME</div>
        <div>{selectedLabel?.organizationName ?? ''}</div>
      </div>
      <div class="flex justify-between items-center border p-2.5">
        <div>MODULE NAME</div>
        <div>{selectedLabel?.moduleName ?? ''}</div>
      </div>
      <div class="flex justify-between items-center border p-2.5">
        <div>LABEL TYPE NAME</div>
        <div>{selectedLabel?.labelTypeName ?? ''}</div>
      </div>
      <div class="flex justify-between items-center border p-2.5">
        <div>LABEL PROTECTED</div>
        <div>{selectedLabel?.labelProtected ? 'true' : 'false'}</div>
      </div>
      <div class="flex justify-between items-center border p-2.5">
        <div>COLOR</div>
        <div style:--label-bg={selectedLabel?.bgColorHex} style:--label-color={selectedLabel?.textColorHex}>
          <Tag class="bg-[var(--label-bg)] text-[var(--label-color)]">
            {selectedLabel?.label}
          </Tag>
        </div>
      </div>
    </div>
  </div>
</Modal>
