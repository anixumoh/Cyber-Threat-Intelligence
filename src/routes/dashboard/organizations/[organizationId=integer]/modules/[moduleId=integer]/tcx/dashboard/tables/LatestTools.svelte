<script lang="ts">
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Button, DataTable, DataTableSkeleton, Tag } from 'carbon-components-svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import Client from '$lib/client';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { onDestroy } from 'svelte';

  interface ToolsResponse {
    data: Tool[];
  }

  interface Tool {
    id: string;
    attributes: ToolAttributes;
  }

  interface ToolAttributes {
    description: string;
    version: string;
    last_seen: string;
    created_at: string;
    name: string;
    targeted_platforms: string[];
    first_seen: string;
    tlp: string;
    updated_at: string;
    uuid?: string;
  }

  type ToolsMerged = Omit<Tool, 'attributes'> & ToolAttributes;

  const client = new Client();
  onDestroy(() => client.abort());

  const headers: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'targeted_platforms', value: 'Targeted Platforms' },
    { key: 'tlp', value: 'TLP' },
    { key: 'updated_at', value: 'Last seen', display: (x) => getHumanReadableDate(x.updated_at) }
  ];

  let rows: ToolsMerged[] = [];
  let loading = false;

  $: getCampaigns();

  async function getCampaigns() {
    loading = true;
    const url = '/api/v1/tool/';
    const response = await client.gateway.get<ToolsResponse>('THIAPP', url);
    rows = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes
    }));
    loading = false;
  }
</script>

{#if loading}
  <DataTableSkeleton rows={10} columns={headers.length} showHeader={false} showToolbar={false} />
{:else}
  <DataTable {headers} {rows}>
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

<div class="flex flex-row-reverse">
  <Button
    kind="ghost"
    size="small"
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-tools"
  >
    See all tools
  </Button>
</div>
