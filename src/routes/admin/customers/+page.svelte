<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { Customer } from '$lib/types/admin';
  import { scrollToTop } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, TrashCan } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';
  import CustomerDetailModal from './CustomerDetailModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'CUSTOMER', sort: () => 0 },
    { key: 'customerType', value: 'TYPE', display: (customerType) => customerType.name, sort: () => 0 },
    { key: 'enforcing', value: 'APPLIED CONTRACT', sort: false },
    { key: 'contract.band.name', value: 'BAND', sort: false },
    { key: 'contract.bandValues', value: 'CUSTOM LIMIT', sort: false },
    {
      key: 'customerModules',
      value: 'MODULES',
      display: (customerModules) => customerModules.filter((mod) => !mod.deleted).length,
      sort: false
    },
    {
      key: 'contract',
      value: 'CONTRACT DATES',
      display: (contract) => (contract ? `${contract.startAt} - ${contract.endAt}` : '-'),
      sort: false
    },
    { key: 'trials', value: 'TRIALS', display: (trials) => trials || 0, sort: false },
    { key: 'active', value: 'STATE', sort: false },
    { key: 'limits', value: 'LIMITS', display: (limits) => limits || 0, sort: false },
    { key: 'overdue', value: 'OVERDUE', sort: false },
    { key: 'actions', empty: true }
  ];

  onMount(() => {
    mounted = true;
    return () => client.abort();
  });

  let mounted = false;
  let openDeleteConfirmation = false;
  let customerDetailModalOpen = false;
  let readonly = false;
  let selectedCustomerId: number;
  let isDeleting = false;
  let sortKey: string;
  let sortDirection: DataTableProps['sortDirection'] = 'none';
  let search = '';
  let loading = false;
  let rows: Customer[] = [];
  let page = 1;
  let totalItems = 0;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let searchValue = '';
  let searchDebounce: ReturnType<typeof setTimeout>;

  $: onChangeSearch(searchValue);
  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
        page = 1;
      }, 1000);
    }
  }

  $: mounted && getCustomers(page, pageSize, search, sortDirection, sortKey);
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;

  async function reload() {
    await getCustomers(page, pageSize, search, sortDirection, sortKey);
  }

  async function getCustomers(
    page: number,
    maxRows: number,
    search: string,
    sortDirection: DataTableProps['sortDirection'],
    sortKey: string
  ) {
    loading = true;
    const response = await client.admin.getCustomers({
      page,
      maxRows,
      search,
      sortDirection,
      sortKey
    });
    rows = response.content;
    totalItems = response.totalElements;
    loading = false;
  }

  function openDeleteModal(customerId: number) {
    selectedCustomerId = customerId;
    openDeleteConfirmation = true;
  }

  async function deleteSelectedCustomer() {
    isDeleting = true;
    await client.admin.deleteCustomer(selectedCustomerId);
    isDeleting = false;
    openDeleteConfirmation = false;
    selectedCustomerId = undefined;
    await reload();
  }

  function openPreviewModal(customerId: number) {
    selectedCustomerId = customerId;
    customerDetailModalOpen = true;
    readonly = true;
  }

  function openEditModal(customerId: number) {
    selectedCustomerId = customerId;
    customerDetailModalOpen = true;
    readonly = false;
  }

  function openNewCustomerModal() {
    selectedCustomerId = undefined;
    customerDetailModalOpen = true;
    readonly = false;
  }

  function isContractExpired(item: unknown) {
    const customer = item as Customer;
    const date = new Date(customer?.contract?.endAt);
    const today = new Date();
    return date < today;
  }
</script>

<h4>Customers</h4>

<div class="relative overflow-x-auto">
  <DataTable
    id="customer-list"
    class="pb-5
    [&_td:nth-child(1)]:text-left
    [&_td]:text-center
    {loading ? '[&>table]:opacity-20 select-none' : ''}"
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
        <ToolbarSearch
          placeholder="Search for customer name"
          bind:value={searchValue}
          data-testid="search-customer"
          class="max-w-md"
        />
        <Button on:click={openNewCustomerModal} icon={Add}>New customer</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'name'}
        <Button on:click={() => openPreviewModal(row.id)} kind="ghost" size="small">{cell.value}</Button>
      {:else if cell.key === 'enforcing'}
        <TooltipDefinition
          direction="top"
          tooltipText={cell.value
            ? 'The contract for this customer is being applied'
            : 'The contract for this customer is not being applied'}
        >
          <div
            class="rounded-full w-4 shadow-xl aspect-square m-2"
            class:bg-ctip-success={cell.value}
            class:bg-ctip-danger={!cell.value}
          />
        </TooltipDefinition>
      {:else if cell.key === 'contract.bandValues'}
        <TooltipDefinition
          direction="top"
          tooltipText={cell.value
            ? 'The band for this customer has custom values'
            : 'The band for this customer does not have custom values'}
        >
          <div
            class="rounded-full w-4 shadow-xl aspect-square m-2"
            class:bg-ctip-success={cell.value}
            class:bg-ctip-danger={!cell.value}
          />
        </TooltipDefinition>
      {:else if cell.key === 'active'}
        <TooltipDefinition direction="top" tooltipText={cell.value ? 'Active' : 'Disabled'}>
          <div
            class="rounded-full w-4 shadow-xl aspect-square m-2"
            class:bg-ctip-success={cell.value}
            class:bg-ctip-danger={!cell.value}
          />
        </TooltipDefinition>
      {:else if cell.key === 'overdue'}
        {@const notExpired = !isContractExpired(row)}
        <TooltipDefinition
          direction="top"
          tooltipText={notExpired ? 'Contract is still valid' : 'Customer does not have a contract or has expired'}
        >
          <div
            class="rounded-full w-4 shadow-xl aspect-square m-2"
            class:bg-ctip-success={notExpired}
            class:bg-ctip-danger={!notExpired}
          />
        </TooltipDefinition>
      {:else if cell.key === 'actions'}
        <div class="flex items-center justify-end gap-1.5">
          <Button
            on:click={() => openEditModal(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
            data-testid="edit-user"
          />
          <Button
            on:click={() => openDeleteModal(row.id)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
            data-testid="delete-user"
          />
        </div>
      {:else if cell.key === 'id'}
        <div class="flex items-center justify-center">
          {row.created}
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
      <div class="absolute bottom-1 right-60">
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

<CustomerDetailModal
  bind:open={customerDetailModalOpen}
  customerId={selectedCustomerId}
  on:save={reload}
  bind:readonly
/>

<WarningModal
  bind:open={openDeleteConfirmation}
  modalHeading="Delete"
  question="Are you sure you want to delete the selected customer?"
  secondMessage="This action cannot be undone"
  on:submit={deleteSelectedCustomer}
  on:closeModal={() => (openDeleteConfirmation = false)}
  primaryButtonIcon={isDeleting ? InlineLoading : undefined}
  primaryButtonDisabled={isDeleting}
/>
