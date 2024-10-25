<script lang="ts">
  import { browser } from '$app/environment';
  import datatableDragAndDrop, { arrayMove } from '$lib/actions/datatableDragAndDrop';
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import EnableDisable from '$lib/components/EnableDisable/EnableDisable.svelte';
  import AddFromTemplate from '$lib/components/Filter/AddFromTemplate.svelte';
  import ChangeFilterOrder from '$lib/components/Filter/ChangeFilterOrder.svelte';
  import DetailsFilter from '$lib/components/Filter/DetailsFilter.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import HeadOverTable from '$lib/components/Settings/HeadOverTable.svelte';
  import { COLORS } from '$lib/constants/colors';
  import type { FiltersType } from '$lib/types/settings';
  import { currentModule } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import roleStore from '$stores/role';

  import { DataTable, DataTableSkeleton } from 'carbon-components-svelte';
  import { AddAlt, ArrowsHorizontal, Edit, TrashCan } from 'carbon-icons-svelte';
  import { onMount } from 'svelte';

  const client = new Client();
  let sheet: HTMLStyleElement;

  let isLoading = false;
  let showAddFilter = false;
  let deleteAllConfirmation = false;
  let deleteConfirmation = false;
  let openAddFromTemplate = false;
  let openChangeFilterOrder = false;
  let toDelete: number;
  let selectedItem: FiltersType;
  let page = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let totalResources = 0;
  let q = '';
  let lastGeneratedFilterPosition = { min: 0, max: 0 };
  let openDrawer = false;
  $: numPages = Math.ceil(totalResources / maxRows);

  let rows: FiltersType[] = [];
  let selectedRowIds = [];
  const headers = [
    { key: 'name', value: 'Filter Name' },
    { key: 'enabled', value: 'Enabled' },
    { key: 'generated', value: 'Generated' },
    { key: 'edit', value: 'Edit' },
    { key: 'delete', value: 'Delete' },
    ...(!($roleStore.customer || $roleStore.operator) ? [{ key: 'changeOrder', value: '' }] : [])
  ];

  $: generated = rows.filter((row: FiltersType) => row.generated).map((row) => row.id);
  $: generatedSelectors = generated.map((id) => `#settings-table > table > tbody > tr[data-row="${id}"]`);
  $: generatedCustomStyle = generatedSelectors.length
    ? `${generatedSelectors.join(',\n')} {background-color: ${COLORS.bgRowTables};}`
    : '';

  $: if (browser && sheet) sheet.innerHTML = `${generatedCustomStyle}`;

  onMount(() => {
    init();
    sheet = document.createElement('style');
    document.body.appendChild(sheet);
    return () => {
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  async function init() {
    isLoading = true;
    await getGeneratedFiltersPositions();
    const data = await client.settings.getSettingsData(
      $currentOrganizationId,
      $currentModule.id,
      $currentModule.moduleName,
      'filters',
      page,
      maxRows,
      q
    );
    rows = data?.values ?? [];
    totalResources = data?.totalResources ?? 0;
    isLoading = false;
  }

  async function getGeneratedFiltersPositions() {
    const { data } = await client.settings.getGeneratedFiltersPositions($currentOrganizationId, $currentModule.id);
    if ($roleStore.master || $roleStore.superadmin) {
      lastGeneratedFilterPosition = data;
    }
    if ($roleStore.master) {
      showAddFilter = true;
    } else if (($roleStore.admin || $roleStore.superadmin || $roleStore.analyst) && data.max > 0) {
      showAddFilter = true;
    }
  }

  function canEditFilter(generated: boolean) {
    if (generated) {
      return $roleStore.master || $roleStore.superadmin;
    } else {
      return !($roleStore.customer || $roleStore.operator);
    }
  }

  function canDeleteFilter(generated: boolean) {
    if (generated) {
      return $roleStore.master;
    } else {
      return !($roleStore.customer || $roleStore.operator);
    }
  }

  function canEnableDisableFilter(generated: boolean) {
    if (generated) {
      return $roleStore.master || $roleStore.superadmin || $roleStore.admin;
    } else {
      return !($roleStore.customer || $roleStore.operator);
    }
  }

  function canBeMoved(position: number) {
    if ($roleStore.master) {
      return true;
    } else if ($roleStore.superadmin) {
      return position > lastGeneratedFilterPosition.max;
    } else if ($roleStore.admin || $roleStore.analyst) {
      return true;
    } else {
      return false;
    }
  }

  async function onUpdateEnabled(rowParam) {
    rows = rows.map((row: FiltersType) => {
      if (row.id === rowParam.id) {
        row.enabled = !row.enabled;
      }
      return row;
    });
    await client.settings.saveSettingsPatch($currentOrganizationId, $currentModule.id, rowParam.id, {
      enabled: rowParam.enabled
    });
  }

  async function onDeleteSelected() {
    const requests = [];
    selectedRowIds.forEach((id) => {
      requests.push(client.settings.deleteSelectedFilters($currentOrganizationId, $currentModule.id, id));
    });
    await Promise.all(requests);
    deleteAllConfirmation = false;
    init();
  }

  function onOpenDelete(id: number) {
    toDelete = id;
    deleteConfirmation = true;
  }

  async function onDelete() {
    await client.settings.deleteSelectedFilters($currentOrganizationId, $currentModule.id, toDelete);
    deleteConfirmation = false;
    init();
  }

  async function onMove(from: number, to: number, isManual = false) {
    const item = isManual ? selectedItem : rows[from];
    const order = item.order;
    const positions = to - from;
    let newOrder = order + positions;
    if (!canBeMoved(newOrder)) {
      notifications.notify({
        kind: 'error',
        title: 'Cannot move above generated filters'
      });
    } else {
      let message = 'Filter moved successfully';
      if (newOrder >= lastGeneratedFilterPosition.min && newOrder <= lastGeneratedFilterPosition.max) {
        if (newOrder > order) {
          newOrder = lastGeneratedFilterPosition.max;
          message = 'Moved to the end of the generated filters';
        } else {
          newOrder = lastGeneratedFilterPosition.min;
          message = 'Moved to the beginning of the generated filters';
        }
      }
      isLoading = true;
      try {
        await client.settings.changeOrder($currentOrganizationId, $currentModule.id, item.id, newOrder);
        init();
        notifications.notify({
          kind: 'success',
          title: message
        });
      } catch (error) {
        notifications.notify({
          kind: 'error',
          title: 'Error moving filter'
        });
      }
    }
  }

  function canMove(from: number) {
    if ($roleStore.customer || $roleStore.operator) return false;
    if (!rows[from]) return false;
    if (rows[from].generated) return false;
    if (from < lastGeneratedFilterPosition.min && !$roleStore.master) return false;
    return true;
  }

  function canMoveToPosition(to: number) {
    if (!rows[to]) return false;
    if (to < lastGeneratedFilterPosition.min && !$roleStore.master) return false;
    if (rows[to].generated) return false;
    return true;
  }

  function openCloseMoveDialog(value?: any) {
    openChangeFilterOrder = !openChangeFilterOrder;
    selectedItem = value ? value : undefined;
  }

  function openCloseViewDetails(value?: any) {
    openDrawer = !openDrawer;
    selectedItem = value ? value : undefined;
  }
</script>

<HeadOverTable
  title="Filters"
  placeholder="Search for filters"
  bind:q
  bind:maxRows
  on:search={() => {
    page = 1;
    init();
  }}
  on:changeSelected={(event) => {
    maxRows = +event.detail;
    page = 1;
    init();
  }}
>
  <svelte:fragment slot="action-buttons">
    {#if !$roleStore.customer && !$roleStore.operator}
      <GenericButton
        class={!showAddFilter
          ? `cursor-not-allowed opacity-50 bx--btn--icon-only bx--tooltip__trigger bx--tooltip--a11y bx--tooltip--align-end bx--btn--icon-only--right' }`
          : ''}
        href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/filters/new"
        on:click={(e) => {
          if (!showAddFilter) e.preventDefault();
        }}
      >
        {#if !showAddFilter}
          <span class:bx--assistive-text={true} class="left-32 opacity-90">
            You should have settings configured to be able to add a filter
          </span>
        {/if}
        <AddAlt /> <span class="ml-1">Add Filter</span>
      </GenericButton>
      <GenericButton
        class={!showAddFilter
          ? `cursor-not-allowed opacity-50 bx--btn--icon-only bx--tooltip__trigger bx--tooltip--a11y bx--tooltip--align-end bx--btn--icon-only--right' }`
          : ''}
        on:click={() => showAddFilter && (openAddFromTemplate = true)}
      >
        {#if !showAddFilter}
          <span class:bx--assistive-text={true} class="left-32 opacity-90">
            You should have settings configured to be able to add a filter
          </span>
        {/if}
        <AddAlt /> <span class="ml-1">Add Filter from Template</span>
      </GenericButton>
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="actions-aux">
    {#if selectedRowIds.length}
      <GenericButton
        kind="danger-ghost"
        class="mr-2"
        disabled={$roleStore.customer}
        on:click={() => {
          deleteAllConfirmation = true;
        }}
      >
        <TrashCan /> <span class="ml-1">Delete</span>
      </GenericButton>
    {/if}
  </svelte:fragment>
</HeadOverTable>

{#if isLoading}
  <DataTableSkeleton rows={10} showHeader={false} showToolbar={false} />
{:else if rows.length}
  <span use:datatableDragAndDrop={{ onMove, canMove, canMoveToPosition }}>
    <DataTable
      id="settings-table"
      batchSelection={!$roleStore.customer}
      bind:selectedRowIds
      nonSelectableRowIds={rows.filter((row) => !canDeleteFilter(row.generated)).map((row) => row.id)}
      class="[&_td]:!bg-transparent [&_th]:text-left [&_th]:uppercase"
      {headers}
      {rows}
    >
      <svelte:fragment slot="cell" let:row let:cell let:rowIndex>
        {#if cell.key === 'name'}
          <GenericButton
            on:click={() => openCloseViewDetails(row)}
            data-drawer-target="drawer-navigation"
            data-drawer-show="drawer-navigation"
            aria-controls="drawer-navigation"
          >
            {rowIndex + 1 + (page - 1) * maxRows}.
            {row.name}
          </GenericButton>
        {:else if cell.key === 'enabled'}
          <EnableDisable
            isEnabled={row.enabled}
            disabled={!canEnableDisableFilter(row.generated)}
            on:click={() => canEnableDisableFilter(row.generated) && onUpdateEnabled(row)}
          />
        {:else if cell.key === 'generated'}
          <EnableDisable disabled isEnabled={row.generated} />
        {:else if cell.key === 'edit'}
          <GenericButton
            href={canEditFilter(row.generated) &&
              `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModule.id}/settings/filters/${row.id}/edit`}
            class={`${canEditFilter(row.generated) ? 'text-ctip-interactive' : 'cursor-not-allowed opacity-50'}`}
          >
            <Edit />
          </GenericButton>
        {:else if cell.key === 'delete'}
          <GenericButton
            on:click={() => canDeleteFilter(row.generated) && onOpenDelete(row.id)}
            class={`${canDeleteFilter(row.generated) ? 'text-ctip-danger' : 'cursor-not-allowed opacity-30'}`}
          >
            <TrashCan />
          </GenericButton>
        {:else if cell.key === 'changeOrder'}
          {#if !row.generated}
            <GenericButton on:click={() => openCloseMoveDialog(row)} class="text-ctip-interactive">
              <ArrowsHorizontal />
            </GenericButton>
          {/if}
        {:else}
          {cell.value}
        {/if}
      </svelte:fragment>
    </DataTable>
  </span>
  <div class="flex items-center">
    <ResponsivePageNavigation
      loading={isLoading}
      on:change={(e) => {
        const targetPage = e.detail.page;
        if (targetPage !== page) {
          page = e.detail.page;
          init();
        }
      }}
      {page}
      total={numPages}
    />
  </div>
{:else}
  <EmptyData messageObj={{ msg: 'There are no Advanced Filters' }} />
{/if}

<WarningModal
  bind:open={deleteAllConfirmation}
  modalHeading="Confirmation"
  question="Are you sure you want to delete selected filters?"
  secondMessage="This action cannot be undone."
  on:submit={onDeleteSelected}
  on:closeModal={() => (deleteAllConfirmation = false)}
/>

<WarningModal
  bind:open={deleteConfirmation}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this filter?"
  secondMessage="This action cannot be undone."
  on:submit={onDelete}
  on:closeModal={() => (deleteConfirmation = false)}
/>

{#if openAddFromTemplate}
  <AddFromTemplate
    bind:open={openAddFromTemplate}
    on:closeModal={() => (openAddFromTemplate = false)}
    on:close={() => (openAddFromTemplate = false)}
  />
{/if}

{#if openChangeFilterOrder}
  <ChangeFilterOrder
    {selectedItem}
    {totalResources}
    bind:open={openChangeFilterOrder}
    on:closeModal={() => (openChangeFilterOrder = false)}
    on:close={() => (openChangeFilterOrder = false)}
    on:onMove={(event) => {
      onMove(event.detail.from, event.detail.to, true);
      selectedItem = undefined;
      openCloseMoveDialog();
    }}
  />
{/if}

<DetailsFilter
  isOpen={openDrawer}
  on:clickAway={() => {
    openDrawer = false;
    selectedItem = undefined;
  }}
  on:backToList={() => {
    openDrawer = false;
    selectedItem = undefined;
  }}
  filterId={selectedItem?.id}
/>
