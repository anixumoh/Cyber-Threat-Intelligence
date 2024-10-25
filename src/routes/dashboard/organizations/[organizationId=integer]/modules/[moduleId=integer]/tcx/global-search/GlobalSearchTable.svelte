<script lang="ts">
  import type { Actor, Campaign, Tool } from '$lib/client/services/actors';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Button, DataTable, Tag } from 'carbon-components-svelte';
  import CollapsableItems from '$lib/components/CollapsableItems/CollapsableItems.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import { Checkmark, Close } from 'carbon-icons-svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModuleId } from '$stores/module';

  export let actors: Actor[] = [];
  export let campaigns: Campaign[] = [];
  export let tools: Tool[] = [];

  const actorHeaders: DataTableHeader[] = [
    { key: 'name', value: 'NAME' },
    { key: 'aliases', value: 'ALIASES' },
    { key: 'types', value: 'TYPE' },
    { key: 'active', value: 'STATUS' }
  ];
  const campaignHeaders: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'threat_actors', value: 'Threat Actors' },
    { key: 'indicators', value: 'Indicators' },
    { key: 'tools', value: 'Tools' },
    { key: 'cve', value: 'CVE' },
    { key: 'attack_patterns', value: 'Attack patterns' },
    { key: 'tlp', value: 'TLP' },
    { key: 'updated_at', value: 'Last seen', display: (x) => getHumanReadableDate(x.updated_at) },
    { key: 'region', value: 'Region' },
    { key: 'industry', value: 'Industry' }
  ];
  const toolHeaders: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'targeted_platforms', value: 'Targeted Platforms' },
    { key: 'tlp', value: 'TLP' },
    { key: 'updated_at', value: 'Last seen', display: (x) => getHumanReadableDate(x.updated_at) }
  ];

  $: campaignsFakeData = campaigns.map((campaign) => ({
    ...campaign,
    threat_actors: `(${Math.floor(Math.random() * 10)})`,
    indicators: `(${Math.floor(Math.random() * 10)})`,
    tools: `(${Math.floor(Math.random() * 10)})`,
    cve: `(${Math.floor(Math.random() * 10)})`,
    attack_patterns: `(${Math.floor(Math.random() * 10)})`,
    region: `(${Math.floor(Math.random() * 10)})`,
    industry: `(${Math.floor(Math.random() * 10)})`
  }));
</script>

{#if actors.length}
  <DataTable
    title="Actors"
    class="
      [&_th:nth-child(1)]:text-left
      [&_th:nth-child(2)]:text-left
      "
    headers={actorHeaders}
    rows={actors}
    --cds-spacing-04="0"
  >
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        <Button
          href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/actor/{row.id}"
          kind="ghost"
          size="small"
        >
          {cell.value}
        </Button>
      {:else if cell.key === 'aliases'}
        <CollapsableItems items={cell.value} let:item>
          <Tag size="sm">
            <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
              {item}
            </div>
          </Tag>
        </CollapsableItems>
      {:else if cell.key === 'types'}
        <CollapsableItems items={cell.value} let:item>
          <Tag size="sm">
            <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
              {item}
            </div>
          </Tag>
        </CollapsableItems>
      {:else if cell.key === 'active'}
        <div class="flex items-center justify-center">
          {#if cell.value}
            <Checkmark class="fill-ctip-success" />
          {:else}
            <Close class="fill-ctip-danger" />
          {/if}
        </div>
      {:else}
        {cell.display ? cell.display(row) : cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}

<!-- campaignsFakeData -->
{#if campaignsFakeData.length}
  <DataTable title="Campaigns" headers={campaignHeaders} rows={campaignsFakeData}>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        {cell.value}
      {:else if cell.key === 'tlp'}
        <Tlp readonly status={row.tlp.toUpperCase()} />
      {:else}
        <div class="text-center">
          {cell.display ? cell.display(row) : cell.value}
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}

{#if tools.length}
  <DataTable
    class="
  [&_th:nth-child(1)]:text-left
  [&_th:nth-child(2)]:text-left
  "
    title="Tools"
    headers={toolHeaders}
    rows={tools}
  >
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        {cell.value}
      {:else if cell.key === 'tlp'}
        <Tlp readonly status={row.tlp.toUpperCase()} />
      {:else if cell.key === 'targeted_platforms'}
        {#each cell.value as targeted_platform}
          <Tag size="sm">
            {targeted_platform}
          </Tag>
        {/each}
      {:else}
        <div class="text-center">
          {cell.display ? cell.display(row) : cell.value}
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}
