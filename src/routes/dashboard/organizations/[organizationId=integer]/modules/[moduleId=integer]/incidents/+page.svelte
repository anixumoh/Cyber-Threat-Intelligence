<script lang="ts">
  import { browser } from '$app/environment';
  import Client from '$lib/client';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import IncidentFilters from '$lib/components/ThreatsCommons/IncidentFilters.svelte';
  import ThreatsTitle from '$lib/components/ThreatsCommons/ThreatsTitle/ThreatsTitle.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import threatsFilterStore from '$stores/filters';
  import { currentModuleId, moduleNameUrl } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import roleStore from '$stores/role';
  import { DataTable, DataTableSkeleton, Tag } from 'carbon-components-svelte';
  import { onMount } from 'svelte';

  const client = new Client();

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  let page = 1;
  let isLoading = false;
  let rows = [];
  let selectedRowIds = [];
  let totalIncidents = 0;

  $: page = $threatsFilterStore.page;
  $: browser && $threatsFilterStore && onFilterChange($currentOrganizationId, $currentModuleId, $moduleNameUrl);
  $: numPages = Math.ceil(totalIncidents / $threatsFilterStore.maxRows);

  async function onFilterChange(organizationId: number, moduleId: number, moduleNameUrl: string) {
    isLoading = true;
    const { total, incidents } = await client.incidents.list(
      organizationId,
      moduleId,
      moduleNameUrl,
      $threatsFilterStore
    );
    rows = incidents;
    totalIncidents = total;
    isLoading = false;
  }
</script>

<ModuleHeading title="INCIDENTS" />

<IncidentFilters
  {rows}
  {selectedRowIds}
  on:reload={() => onFilterChange($currentOrganizationId, $currentModuleId, $moduleNameUrl)}
/>

{#if isLoading}
  <DataTableSkeleton rows={10} showHeader={false} showToolbar={false} />
{:else if !rows.length}
  <EmptyData />
{:else}
  <DataTable
    headers={[
      { key: 'id', value: 'ID', width: '5%' },
      { key: 'title', value: 'TITLE', width: '30%' },
      { key: 'status', value: 'STATUS', width: '12%' },
      { key: 'numberOfAnalyzedResources', value: 'THREATS NR' },
      { key: 'lastUpdateUser', value: 'LAST UPDATE USER' },
      { key: 'creationDate', value: 'ADDED DATE' },
      { key: 'changedAt', value: 'CHANGE AT' },
      { key: 'assignee', value: 'ASSIGNEE' }
    ]}
    {rows}
    batchSelection={!$roleStore.customer}
    bind:selectedRowIds
  >
    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'title'}
        <ThreatsTitle
          href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/incidents/{row.id}"
          title={row.title}
          labels={row.labels}
        />
      {:else if cell.key === 'status'}
        {#if row.status === 'OPEN'}
          <Tag class="bg-ctip-successThreat text-ctip-white">{row.status}</Tag>
        {:else if row.status === 'NOTIFIED'}
          <Tag class="bg-ctip-primary text-ctip-white">{row.status}</Tag>
        {:else if row.status === 'CLOSED'}
          <Tag class="bg-ctip-dangerThreat text-ctip-white">{row.status}</Tag>
        {/if}
      {:else}
        {cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}
{#if rows.length}
  <div class="flex items-center">
    <ResponsivePageNavigation loading={isLoading} bind:page={$threatsFilterStore.page} total={numPages} />
  </div>
{/if}
