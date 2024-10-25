<script lang="ts">
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import type { AllAlert } from '$lib/client/services/settings';
  import type Module from '$lib/types/module';
  import { browser } from '$app/environment';
  import Client from '$lib/client';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Modal,
    Toolbar,
    ToolbarBatchActions
  } from 'carbon-components-svelte';
  import { DocumentView, Edit, List, Notification, TrashCan } from 'carbon-icons-svelte';
  import { currentOrganizationId } from '$stores/organization';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import DetailsFilter from '$lib/components/Filter/DetailsFilter.svelte';
  import { onMount } from 'svelte';
  import { modulesStore } from '$stores/module';
  import EnableDisable from '../EnableDisable/EnableDisable.svelte';
  import roleStore from '$stores/role';
  import DefaultAlert from './DefaultAlert.svelte';
  import { RECIEVE_DEFAULT_ALERTS_TOOLTIP } from '$lib/constants/text';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'ALERT NAME' },
    { key: 'reputationalSearchId', value: 'MODULE' },
    { key: 'createdAt', value: 'CREATION DATE' },
    { key: 'enabled', value: 'ENABLED' },
    { key: 'generated', value: 'GENERATED' },
    { key: 'actions', value: 'ACTIONS' }
  ];

  let selectedRowIds: number[] = [];
  let rows: AllAlert[] = [];
  let page = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let loading = true;
  let totalResources = 0;
  let deleteConfirmModalOpen = false;
  let idsToDelete: number[] = [];
  let deleting = false;
  let openDrawer = false;
  let selectedItemId: number = null;
  let selectedModule: Module;
  let openDefaultAlert = false;

  $: if (maxRows) page = 1;
  $: numPages = Math.ceil(totalResources / maxRows);
  $: browser && getAllAlerts(page, maxRows, $currentOrganizationId);
  $: isMasterOrSuperadmin = $roleStore.master || $roleStore.superadmin;

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function getAllAlerts(page: number, maxRows: number, organizationId: number) {
    loading = true;
    const data = await client.settings.getAllAlerts(page, maxRows, organizationId);
    totalResources = data.total;
    rows = data.values;
    loading = false;
  }

  async function deleteSelectedAlerts() {
    const alerts = rows.filter((alert) => idsToDelete.includes(alert.id));
    deleting = true;
    await Promise.all(
      alerts.map((alert) =>
        client.settings.deleteSelectedFilters($currentOrganizationId, alert.reputationalSearchId, alert.id)
      )
    );
    deleting = false;
    deleteConfirmModalOpen = false;
    if (page !== 1) {
      page = 1;
    } else {
      await getAllAlerts(page, maxRows, $currentOrganizationId);
    }
    selectedRowIds = [];
    idsToDelete = [];
  }

  function setDeleteAlerts(ids: number[]) {
    deleteConfirmModalOpen = true;
    idsToDelete = ids;
  }

  function viewDetail(row: unknown) {
    const alert = row as AllAlert;
    selectedModule = $modulesStore.find((m) => m.id === alert.reputationalSearchId);
    selectedItemId = alert.id;
    openDrawer = true;
  }

  async function onEnableDisable(row: unknown) {
    const alert = row as AllAlert;
    const enabled = !alert.enabled;
    rows = rows.map((r: any) => {
      if (r.id === alert.id) r.enabled = enabled;
      return r;
    });
    await client.settings.saveSettingsPatch($currentOrganizationId, alert.reputationalSearchId, alert.id, { enabled });
  }

  function canDoActions(row: unknown) {
    const alert = row as AllAlert;
    if (alert.generated) {
      return isMasterOrSuperadmin;
    }
    return true;
  }

  function openDefaultAlerts(row: unknown) {
    const alert = row as AllAlert;
    selectedModule = $modulesStore.find((m) => m.id === alert.reputationalSearchId);
    openDefaultAlert = true;
  }
</script>

{#if loading}
  <DataTableSkeleton {headers} rows={10} />
{:else}
  <DataTable
    class="[&>table]:min-w-[650px]"
    bind:selectedRowIds
    batchSelection
    {headers}
    {rows}
    id="alerts-table"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <div class="flex justify-between">
      <h4>Alerts configured</h4>
      <GenericSingleSelect
        align="bottom-right"
        highlightedWhenSeleted={false}
        customClass="border text-ctip-btnLight"
        selectedValue={maxRows}
        items={pageSizes.map((size) => ({ text: size, value: size }))}
        value="value"
        display="text"
        title={`${maxRows}`}
        icon={List}
        alwaysShowIcon
        on:changeSelected={(event) => (maxRows = +event.detail)}
      />
    </div>
    <Toolbar>
      <ToolbarBatchActions>
        <GenericButton
          kind="danger"
          iconDescription="Delete"
          on:click={() => setDeleteAlerts(selectedRowIds)}
          class="mr-1"
        >
          <span class="mr-1">Delete</span>
          <TrashCan />
        </GenericButton>
      </ToolbarBatchActions>
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'reputationalSearchId'}
        <a href="/dashboard/organizations/{$currentOrganizationId}/modules/{row.reputationalSearchId}/alerts">
          <div class="w-full h-full text-ctip-link text-center">
            {row.reputationalSearchName}
          </div>
        </a>
      {:else if cell.key === 'createdAt'}
        <div class="w-full h-full text-center">
          {getHumanReadableDate(cell.value)}
        </div>
      {:else if cell.key === 'enabled'}
        <div class="flex justify-center">
          <EnableDisable
            disabled={!isMasterOrSuperadmin}
            isEnabled={cell.value}
            on:click={() => onEnableDisable(row)}
          />
        </div>
      {:else if cell.key === 'generated'}
        <div class="flex justify-center">
          <EnableDisable disabled={true} isEnabled={cell.value} />
        </div>
      {:else if cell.key === 'actions'}
        {@const actions = canDoActions(row)}
        <div class="flex justify-center items-center">
          {#if isMasterOrSuperadmin}
            <div class="w-8">
              {#if row.generated}
                <Button
                  icon={Notification}
                  kind="ghost"
                  size="field"
                  title="Alert recipients"
                  data-test="recipients"
                  tooltipPosition="left"
                  iconDescription={RECIEVE_DEFAULT_ALERTS_TOOLTIP}
                  on:click={() => openDefaultAlerts(row)}
                />
              {/if}
            </div>
          {/if}
          <div class="w-8">
            {#if actions}
              <GenericButton title="View details" data-test="view" on:click={() => viewDetail(row)}>
                <DocumentView />
              </GenericButton>
            {/if}
          </div>
          <div class="w-8">
            {#if actions}
              <GenericButton
                title="Edit"
                data-test="edit"
                href="/dashboard/organizations/{$currentOrganizationId}/modules/{row.reputationalSearchId}/settings/filters/{row.id}/edit"
              >
                <Edit />
              </GenericButton>
            {:else if row.generated}
              <Button
                icon={Notification}
                kind="ghost"
                size="field"
                title="Alert recipients"
                data-test="recipients"
                tooltipPosition="left"
                iconDescription={RECIEVE_DEFAULT_ALERTS_TOOLTIP}
                on:click={() => openDefaultAlerts(row)}
              />
            {/if}
          </div>
          <div class="w-8">
            {#if actions}
              <GenericButton
                title="Delete"
                data-test="delete"
                on:click={() => setDeleteAlerts([row.id])}
                class="text-ctip-danger"
              >
                <TrashCan />
              </GenericButton>
            {/if}
          </div>
        </div>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if rows.length === 0}
    <EmptyData>
      <div>There are no alerts saved/configured yet</div>
    </EmptyData>
  {/if}
{/if}
{#if rows.length}
  <div class="flex items-center">
    <ResponsivePageNavigation {loading} bind:page total={numPages} />
  </div>
{/if}

<Modal
  bind:open={deleteConfirmModalOpen}
  danger
  modalHeading="Remove resource"
  primaryButtonText="Delete"
  secondaryButtonText="Cancel"
  shouldSubmitOnEnter={false}
  primaryButtonDisabled={deleting}
  on:click:button--primary={deleteSelectedAlerts}
  on:click:button--secondary={() => (deleteConfirmModalOpen = false)}
  primaryButtonIcon={deleting && InlineLoading}
>
  <h4>Are you sure you want to delete the selected alert configuration?</h4>
  <p>This action cannot be undone.</p>
</Modal>

<DetailsFilter
  isOpen={openDrawer}
  on:clickAway={() => {
    openDrawer = false;
    selectedItemId = undefined;
  }}
  on:backToList={() => {
    openDrawer = false;
    selectedItemId = undefined;
  }}
  filterId={selectedItemId}
  module={selectedModule}
/>

<DefaultAlert
  isOpen={openDefaultAlert}
  module={selectedModule}
  on:clickAway={() => {
    openDefaultAlert = false;
  }}
/>
