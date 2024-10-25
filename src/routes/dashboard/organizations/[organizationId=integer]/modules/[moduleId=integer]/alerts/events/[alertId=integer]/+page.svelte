<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Client from '$lib/client';
  import type { AlertInfo, AlertResource } from '$lib/client/services/modules';
  import ButtonCopy from '$lib/components/ButtonCopy/ButtonCopy.svelte';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import Favorite from '$lib/components/Favorite/Favorite.svelte';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import IncidentModal from '$lib/components/IncidentModal.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { pageSizes } from '$lib/constants/pagination';
  import type Module from '$lib/types/module';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    SkeletonPlaceholder,
    Tile,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Calendar, CheckboxChecked, ChevronLeft, Lightning, List } from 'carbon-icons-svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    {
      key: 'title',
      value: 'TITLE',
      width: '25%'
    },
    {
      key: 'created_at',
      value: 'DATE/TIME',
      display: (date: number) => getHumanReadableDate(date),
      width: '25%'
    },
    {
      key: 'url',
      value: 'URL',
      width: '25%'
    },
    {
      key: 'analysis_calc_result',
      value: 'TYPE',
      width: '25%'
    },
    {
      key: 'favorite',
      value: 'FAV',
      width: '80px'
    }
  ];

  let p = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let loading = true;
  let info: AlertInfo;
  let selectedRowIds = [];
  let totalResources = 0;
  let incidentsModalOpen = false;
  let selectedResources = [];

  // EXPLORER
  let loadAngularDetailsModal = false;
  let selectedCve: string;
  let selectedCveId: number;

  $: isExplorer = $currentModule?.moduleName === MODULE_NAME.EXPLORER;
  $: if (maxRows) p = 1;
  $: numPages = Math.ceil(totalResources / maxRows);
  $: headerItems = [
    {
      title: 'FIRING DATE/TIME',
      icon: Calendar,
      display: info && getHumanReadableDate(info.createdAt)
    },
    {
      title: 'CAUSING FILTER',
      icon: Lightning,
      display: info?.filterName
    },
    {
      title: 'STATUS',
      icon: CheckboxChecked,
      display: info?.status
    }
  ];
  $: browser && getAlert($currentOrganizationId, $currentModule, +$page.params.alertId, p, maxRows);

  async function getAlert(organizationId: number, module: Module, alertId: number, p: number, maxRows: number) {
    loading = true;
    try {
      info = await client.modules.getAlert(organizationId, module, alertId, p, maxRows);
      totalResources = info.totalResources;
      await client.modules.markAsRead([alertId], $currentOrganizationId, $currentModule.id, $currentModule.moduleName);
      loading = false;
    } catch (error) {
      loading = false;
    }
  }

  function markIncident() {
    selectedResources = info.resources
      .filter((resource) => selectedRowIds.includes(resource.id))
      .map((resource) => ({
        hasIncident: true,
        resourceId: resource.id
      }));
    incidentsModalOpen = true;
  }

  async function markAsFavorite(resource) {
    const target = resource.fav === 'USER_STARRED' ? 'NOT_STARRED' : 'USER_STARRED';
    const index = info.resources.findIndex((r) => r.id === resource.id);
    info.resources[index].fav = target;
    await client.modules.toggleAlertResourceFav($currentOrganizationId, $currentModule, resource.id, target);
  }

  function getUrl(row: unknown, isExplorer: boolean) {
    const resource = row as AlertResource;
    if (isExplorer) {
      return `/dashboard/organizations/${resource.organization_id}/modules/${resource.module_id}/cve?id=${resource.id}`;
    }
    return `/dashboard/organizations/${resource.organization_id}/modules/${resource.module_id}/resource/${resource.id}`;
  }
</script>

<ModuleHeading title="ALERTS">
  <GenericButton href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/alerts">
    <ChevronLeft /><span class="ml-1">Back to list</span>
  </GenericButton>
</ModuleHeading>

<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-4">
  {#each headerItems as item}
    {#if loading}
      <SkeletonPlaceholder class="w-full h-20" />
    {:else}
      <Tile>
        <div class="flex justify-between p-2 border-b-4 border-ctip-primary border-solid">
          <svelte:component this={item.icon} />
          <div class="flex flex-col">
            <div class="text-right">{item.display}</div>
            <div>{item.title}</div>
          </div>
        </div>
      </Tile>
    {/if}
  {/each}
</div>

<div class="flex justify-between">
  <h5>Indexed Resources</h5>
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
{#if loading}
  <DataTableSkeleton showHeader={false} {headers} rows={10} />
{:else}
  <DataTable
    bind:selectedRowIds
    batchSelection
    {headers}
    rows={info.resources}
    id="events-alerts-table"
    --cds-spacing-04="0.35rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarBatchActions>
        <Button on:click={() => markIncident()}>Mark as Incident</Button>
      </ToolbarBatchActions>
      <ToolbarContent />
    </Toolbar>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'title'}
        <a href={getUrl(row, isExplorer)}>
          <div class="w-full h-full">
            <span class="line-clamp-3" title={cell.value}>
              {cell.value}
            </span>
            {#if row.labels.length}
              <div class="flex flex-wrap">
                {#each row.labels as label}
                  <LabelItem {label} />
                {/each}
              </div>
            {/if}
          </div>
        </a>
      {:else if cell.key === 'url'}
        <div class="grid grid-flow-col items-center">
          <ButtonCopy text={cell.value} />
          <div class="text-ellipsis whitespace-nowrap overflow-hidden" title={cell.value}>
            {cell.value}
          </div>
        </div>
      {:else if cell.key === 'favorite'}
        <div class="flex justify-center">
          <Favorite isFavorite={row.fav === 'NOT_STARRED'} on:setFavorite={() => markAsFavorite(row)} />
        </div>
      {:else}
        <div class="flex justify-center">
          {cell.display ? cell.display(cell.value) : cell.value}
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if info.resources.length === 0}
    <EmptyData />
  {/if}
{/if}

<ResponsivePageNavigation {loading} total={numPages} bind:page={p} />
<IncidentModal bind:open={incidentsModalOpen} resources={selectedResources} />
