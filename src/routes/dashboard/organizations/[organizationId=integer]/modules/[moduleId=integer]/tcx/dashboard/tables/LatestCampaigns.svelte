<script lang="ts">
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Button, DataTable, DataTableSkeleton } from 'carbon-components-svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import Client from '$lib/client';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModuleId } from '$stores/module';
  import { onDestroy } from 'svelte';

  type CampaignResponse = {
    data: Campaign[];
  };

  type Campaign = {
    id: string;
    attributes: CampaignAttributes;
  };

  type CampaignAttributes = {
    description: string;
    name: string;
    first_seen: string;
    tlp: string;
    updated_at: string;
    ioc_link: string;
    last_seen: string;
    created_at: string;
  };

  type CampaignMerged = Omit<Campaign, 'attributes'> & CampaignAttributes & ExtraData;

  type ExtraData = {
    threat_actors: string;
    indicators: string;
    tools: string;
    cve: string;
    attack_patterns: string;
    region: string;
    industry: string;
  };

  const client = new Client();
  onDestroy(() => client.abort());

  const headers: DataTableHeader[] = [
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

  let rows: CampaignMerged[] = [];
  let loading = false;

  $: getCampaigns();

  async function getCampaigns() {
    loading = true;
    const url = '/api/v1/campaign/?sort=-last_seen';
    const response = await client.gateway.get<CampaignResponse>('THIAPP', url);
    rows = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes,
      threat_actors: `(${Math.floor(Math.random() * 10)})`,
      indicators: `(${Math.floor(Math.random() * 10)})`,
      tools: `(${Math.floor(Math.random() * 10)})`,
      cve: `(${Math.floor(Math.random() * 10)})`,
      attack_patterns: `(${Math.floor(Math.random() * 10)})`,
      region: `(${Math.floor(Math.random() * 10)})`,
      industry: `(${Math.floor(Math.random() * 10)})`
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
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-campaigns"
  >
    See all campaigns
  </Button>
</div>
