<script lang="ts">
  import { browser } from '$app/environment';
  import Client from '$lib/client';
  import preferencesStore from '$stores/preferences';
  import {
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Modal,
    Toolbar,
    ToolbarBatchActions
  } from 'carbon-components-svelte';
  import { List, TrashCan } from 'carbon-icons-svelte';
  import type Module from '$lib/types/module';
  import { currentOrganizationId } from '$stores/organization';
  import type { Alert } from '$lib/client/services/modules';
  import ResponsivePageNavigation from '../ResponsivePageNavigation.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { onMount } from 'svelte';

  export let module: Module = undefined;

  const ALERT_STATUS = {
    NOT_SEND: 'Not sent',
    SENDING: 'Sending',
    SENT: 'Sent',
    WAITING: 'Waiting to be sent',
    TO_BE_SENT_JOINTLY: 'Waiting to be sent',
    JOINTLY_SENT: 'Sent'
  };
  const client = new Client();

  let sheet: HTMLStyleElement;
  let selectedRowIds: number[] = [];
  let rows: Alert[] = [];
  let page = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let loading = true;
  let totalResources = 0;
  let deleteConfirmModalOpen = false;
  let idsToDelete: number[] = [];
  let deleting = false;

  $: if (maxRows) page = 1;
  $: numPages = Math.ceil(totalResources / maxRows);
  $: browser && module !== undefined && getAlerts(page, maxRows, $currentOrganizationId, module);
  $: headers = [
    { key: 'filterName', value: 'ALERT NAME' },
    { key: 'firingDate', value: 'SENDING DATE' },
    { key: 'status', value: 'STATUS', width: '90px', display: (value: string) => ALERT_STATUS[value] ?? value },
    ...(module ? [] : [{ key: 'moduleName', value: 'MODULE', width: '150px' }]),
    { key: 'delete', value: '', width: '70px' }
  ];

  const notReadColor = COLORS.bgRowTables;
  $: notReads = rows.filter((alert) => !alert.read).map((alert) => alert.id);
  $: readSelectors = notReads.map((id) => `#alerts-table tr[data-row="${id}"]:not(.bx--data-table--selected) td`);
  $: customStyle = readSelectors.length ? `${readSelectors.join(',\n')} {background-color: ${notReadColor}}` : '';

  $: if (browser && sheet) sheet.innerHTML = `${customStyle}`;

  onMount(() => {
    sheet = document.createElement('style');
    document.body.appendChild(sheet);
    return () => {
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  async function getAlerts(page: number, maxRows: number, organizationId: number, module: Module) {
    loading = true;
    const data = await client.modules.getAlerts(page, maxRows, organizationId, module);
    totalResources = data.total_resources;
    rows = data.list;
    loading = false;
  }

  async function deleteSelectedAlerts() {
    const alerts = rows.filter((alert) => idsToDelete.includes(alert.id));
    deleting = true;
    await Promise.all(alerts.map((alert) => client.modules.deleteAlert(alert, $currentOrganizationId)));
    deleting = false;
    deleteConfirmModalOpen = false;
    if (page !== 0) {
      page = 0;
    } else {
      await getAlerts(page, maxRows, $currentOrganizationId, module);
    }
    selectedRowIds = [];
    idsToDelete = [];
  }

  function setDeleteAlerts(ids: number[]) {
    deleteConfirmModalOpen = true;
    idsToDelete = ids;
  }
</script>

{#if loading}
  <DataTableSkeleton {headers} rows={10} />
{:else}
  <DataTable
    class="[&_th]:text-left [&>table]:min-w-[650px]"
    bind:selectedRowIds
    batchSelection
    {headers}
    {rows}
    id="alerts-table"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <div class="flex justify-between">
      <h4>Alert List</h4>
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
      {#if cell.key === 'firingDate'}
        <a href="/dashboard/organizations/{$currentOrganizationId}/modules/{row.moduleId}/alerts/events/{row.id}">
          <div class="w-full h-full text-ctip-link">
            {getHumanReadableDate(cell.value)}
          </div>
        </a>
      {:else if cell.key === 'delete'}
        <GenericButton on:click={() => setDeleteAlerts([row.id])} class="text-ctip-danger">
          <TrashCan />
        </GenericButton>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if rows.length === 0}
    <EmptyData
      messageObj={{
        msg: 'Alerts have not been configured or there is nothing that requires alerting'
      }}
    />
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
  primaryButtonDisabled={deleting}
  on:click:button--primary={deleteSelectedAlerts}
  on:click:button--secondary={() => (deleteConfirmModalOpen = false)}
  primaryButtonIcon={deleting && InlineLoading}
>
  <h4>Are you sure you want to delete the selected resource?</h4>
  <p>This action cannot be undone.</p>
</Modal>
