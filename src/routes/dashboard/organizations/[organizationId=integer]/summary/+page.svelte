<script lang="ts">
  import { DataTable, DataTableSkeleton, SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import CardSummary from './CardSummary.svelte';
  import roleStore from '$stores/role';
  import ButtonReport from '$lib/components/ButtonReport/index.svelte';
  import SearchDebounce from '$lib/components/SearchDebounce.svelte';
  import Client from '$lib/client';
  import { onMount } from 'svelte';
  import { currentOrganizationId } from '$stores/organization';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import type { StatusType } from '$lib/types';
  import { goto } from '$app/navigation';

  let isLoading = false;
  let search = '';
  let incidents = {
    critical: [],
    high: [],
    medium: [],
    low: []
  };
  let selected: StatusType = 'Critical';

  const client = new Client();

  onMount(() => {
    onFilterChange($currentOrganizationId, search);
    return () => {
      client.abort();
    };
  });

  async function onFilterChange(organizationId: number, q: string) {
    isLoading = true;
    const queryParams = { extraFields: true, ...(q ? { q } : {}) };
    const { data } = await client.incidents.getOrgIncidents(organizationId, queryParams);
    incidents.critical = data.riskMap?.CRITICAL ? mapData(data.riskMap?.CRITICAL) : [];
    incidents.high = data.riskMap?.HIGH ? mapData(data.riskMap?.HIGH) : [];
    incidents.medium = data.riskMap?.MEDIUM ? mapData(data.riskMap?.MEDIUM) : [];
    incidents.low = data.riskMap?.LOW ? mapData(data.riskMap?.LOW) : [];
    isLoading = false;
  }

  function mapData(incidents: any[]) {
    return incidents?.map(({ id, title, description, user, organization_id, module_id }: any) => {
      return {
        id,
        title,
        description,
        assignee: user?.username || '',
        orgId: organization_id,
        moduleId: module_id
      };
    });
  }

  function setSelectedStatus(status: StatusType) {
    selected = status;
  }

  async function redirect(incident: any) {
    const { id, orgId, moduleId } = incident;
    const url = `dashboard/organizations/${orgId}/modules/${moduleId}/incidents/${id}`;
    await goto(url);
  }
</script>

<div class="flex flex-wrap mt-3 mb-5">
  {#if isLoading}
    <SkeletonPlaceholder class="w-[100%] lg:w-[24%] h-[11rem] ml-[2px] mr-[2px]" />
    <SkeletonPlaceholder class="w-[100%] lg:w-[24%] h-[11rem] ml-[2px] mr-[2px]" />
    <SkeletonPlaceholder class="w-[100%] lg:w-[24%] h-[11rem] ml-[2px] mr-[2px]" />
    <SkeletonPlaceholder class="w-[100%] lg:w-[24%] h-[11rem] ml-[2px] mr-[2px]" />
  {:else}
    <div class="flex w-full gap-4">
      <CardSummary
        count={incidents.critical.length}
        type="Critical"
        isSelected={selected === 'Critical'}
        on:click={() => setSelectedStatus('Critical')}
      />
      <CardSummary
        count={incidents.high.length}
        type="High"
        isSelected={selected === 'High'}
        on:click={() => setSelectedStatus('High')}
      />
      <CardSummary
        count={incidents.medium.length}
        type="Medium"
        isSelected={selected === 'Medium'}
        on:click={() => setSelectedStatus('Medium')}
      />
      <CardSummary
        count={incidents.low.length}
        type="Low"
        isSelected={selected === 'Low'}
        on:click={() => setSelectedStatus('Low')}
      />
    </div>
  {/if}
</div>
<div class="flex flex-wrap items-center justify-between p-2 mb-4 bg-ctip-ui">
  <div class="flex items-center">
    <h6 class="mb-0 mr-3 font-[400] leading-[1.2] text-[1rem]">Notified Incidents</h6>
    {#if selected === 'Critical'}
      <Tag class="text-white bg-ctip-darkThreat dark:bg-white dark:!text-ctip-black">Critical</Tag>
    {:else if selected === 'High'}
      <Tag class="text-white bg-ctip-dangerThreat">High</Tag>
    {:else if selected === 'Medium'}
      <Tag class="text-black bg-ctip-amberThreat">Medium</Tag>
    {:else if selected === 'Low'}
      <Tag class="text-white bg-ctip-successThreat">Low</Tag>
    {/if}
  </div>
  <div class="flex items-center">
    {#if $roleStore.master || $roleStore.superadmin || $roleStore.admin || $roleStore.grants.isAnyModuleAnalyst}
      <SearchDebounce
        bind:value={search}
        on:search={() => onFilterChange($currentOrganizationId, search)}
        startSearch={1}
      />
      <ButtonReport text="Monthly Report" params="all-incidents" />
    {/if}
  </div>
</div>

{#if isLoading}
  <DataTableSkeleton rows={10} showHeader={false} showToolbar={false} />
{:else if (selected === 'Critical' && !incidents.critical.length) || (selected === 'High' && !incidents.high.length) || (selected === 'Medium' && !incidents.medium.length) || (selected === 'Low' && !incidents.low.length)}
  <EmptyData />
{:else}
  <DataTable
    headers={[
      { key: 'id', value: 'Id' },
      { key: 'title', value: 'Title' },
      { key: 'description', value: 'Description' },
      { key: 'assignee', value: 'Assignee' }
    ]}
    rows={incidents[selected.toLowerCase()]}
  >
    <svelte:fragment slot="cell" let:row let:cell>
      <span class="cursor-pointer" on:click={() => redirect(row)}>
        {cell.value}
      </span>
    </svelte:fragment>
  </DataTable>
{/if}
