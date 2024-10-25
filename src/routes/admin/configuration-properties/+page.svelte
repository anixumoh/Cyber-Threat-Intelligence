<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { ConfigurationProperty } from '$lib/types/admin';
  import notifications from '$stores/notification';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    FormGroup,
    InlineLoading,
    Modal,
    Pagination,
    TextInput,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, TrashCan } from 'carbon-icons-svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'CONFIGURATION NAME', sort: () => 0 },
    { key: 'value', value: 'VALUE', sort: () => 0 },
    { key: 'actions', value: '', sort: false }
  ];
  const ERROR_MAP = {
    'error.property_already_exists': 'This configuration property is already set',
    'error.unknown_property': 'Unknown configuration property'
  };

  let selectedRowIds = [];
  let loading = false;
  let rows: ConfigurationProperty[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;

  let selectedConfigurationId: number;
  let key = '';
  let value = '';
  let saving = false;

  let deleteModalOpen = false;
  let editModalOpen = false;
  let deleting = false;

  let sortKey: string = null;
  let sortDirection: DataTableProps['sortDirection'] = 'none';
  let searchValue = '';

  $: onChangeSearch(searchValue);
  $: getConfigurationProperties(page, pageSize, sortKey, sortDirection, search);
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;

  function onChangeSearch(searchValue: string) {
    if (searchValue === '' || searchValue.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        page = 1;
        search = searchValue;
      }, 1000);
    }
  }

  async function refresh() {
    await getConfigurationProperties(page, pageSize, sortKey, sortDirection, search);
  }

  async function getConfigurationProperties(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search: string = ''
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getConfigurationProperties(page, pageSize, search, sortKey, ascending);
    totalItems = response.total_properties;
    rows = response.list;
    loading = false;
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function onClickAddConfiguration() {
    selectedConfigurationId = null;
    key = '';
    value = '';
    editModalOpen = true;
  }

  function onClickEdit(configurationId: number) {
    selectedConfigurationId = configurationId;
    const selectedConfiguration = rows.find((config) => config.id === selectedConfigurationId);
    key = selectedConfiguration.name;
    value = selectedConfiguration.value;
    editModalOpen = true;
  }

  function onClickDeleteSelected() {
    selectedConfigurationId = null;
    deleteModalOpen = true;
  }
  function onClickDelete(configurationId: number) {
    selectedConfigurationId = configurationId;
    deleteModalOpen = true;
  }

  async function deleteConfigurations() {
    let errorMsg: string;
    deleting = true;
    try {
      if (selectedConfigurationId) {
        await client.admin.deleteConfiguration(selectedConfigurationId);
      } else if (selectedRowIds.length) {
        const response = await client.admin.deleteConfigurations(selectedRowIds);
        if (response?.errorsIds?.length) {
          if (response?.deletedIds?.length) {
            errorMsg = "Some configuration(s) can't be deleted";
          } else {
            errorMsg = 'Failed trying to delete configuration(s)';
          }
        }
      }
      await refresh();
    } catch (error) {
      errorMsg = 'Failed trying to delete configuration(s)';
    }
    if (errorMsg) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: errorMsg
      });
    }
    selectedRowIds = [];
    deleting = false;
    deleteModalOpen = false;
  }

  async function onSubmit() {
    saving = true;
    try {
      if (selectedConfigurationId) {
        await client.admin.editConfiguration(selectedConfigurationId, key, value);
      } else {
        await client.admin.saveConfiguration(key, value);
      }
      notifications.notify({
        kind: 'success',
        title: 'Success',
        subtitle: 'Configuration was saved succefully'
      });
      editModalOpen = false;
      refresh();
    } catch (error) {
      let message = ERROR_MAP[error?.response?.data?.message] ?? 'Unknown error';
      notifications.notify({
        title: 'Error',
        subtitle: message
      });
    }
    saving = false;
  }
</script>

<h4>Configuration Properties</h4>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-14 {loading ? '[&>table]:opacity-20 select-none' : ''}"
    size="compact"
    {rows}
    sortable
    batchSelection
    bind:selectedRowIds
    bind:sortKey
    bind:sortDirection
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarBatchActions
        formatTotalSelected={(totalSelected) =>
          `${totalSelected} configuration${totalSelected === 1 ? '' : 's'} selected`}
      >
        <Button on:click={onClickDeleteSelected} kind="danger">Delete</Button>
      </ToolbarBatchActions>
      <ToolbarContent>
        <ToolbarSearch placeholder="Search for name or value..." class="max-w-md" bind:value={searchValue} />
        <Button on:click={onClickAddConfiguration} icon={Add}>Add Configuration</Button>
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
      {:else if cell.key === 'name'}
        <div class="pl-2.5">
          {cell.value}
        </div>
      {:else if cell.key === 'value'}
        <div class="break-all">
          {cell.value}
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
  question="Are you sure you want to remove the selected configuration(s)?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={deleteConfigurations}
  primaryButtonDisabled={deleting}
  primaryButtonIcon={deleting ? InlineLoading : undefined}
/>

<Modal
  modalHeading={selectedConfigurationId ? 'Edit configuration' : 'Add configuration'}
  bind:open={editModalOpen}
  primaryButtonText="Submit"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={!value || !key || saving}
  on:click:button--secondary={() => (editModalOpen = false)}
  on:click:button--primary={onSubmit}
>
  <div class="pb-32 px-5">
    <FormGroup>
      <TextInput name="key" type="search" labelText="Configuration Name" bind:value={key} list="configuration-keys" />
      <datalist id="configuration-keys">
        {#await client.admin.getConfigurationKeys() then result}
          {#each result.keys as k}
            <option value={k} />
          {/each}
        {/await}
      </datalist>
    </FormGroup>

    <FormGroup>
      <TextInput name="value" bind:value labelText="Configuration Value" />
    </FormGroup>
  </div>
</Modal>
