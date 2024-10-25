<script lang="ts">
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import Client from '$lib/client';
  import ScoreCve from '$lib/components/ScoreCve.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import { Button, DataTable, DataTableSkeleton } from 'carbon-components-svelte';
  import { onDestroy } from 'svelte';

  interface CVEResponse {
    data: CveData[];
  }

  interface CveData {
    id: string;
    attributes: CVEAttributes;
  }

  interface CVEAttributes {
    description: string;
    name: string;
    updated_at: string;
    num_malware: number;
    exploits: Exploit[];
    published_at: string;
    ioc_link: string;
    platforms: Platform[];
    num_pocs: number;
    cvss: {};
    popularity: number;
    score: number;
    status: string;
    created_at: string;
    num_signatures: number;
    microsoft_bulletins: MicrosoftBulletin[];
    bl_score: number;
    references: any[];
    popularity_changed: boolean;
  }

  interface Exploit {
    url: string;
    date?: string;
    name: string;
    port: number | string;
    type?: string;
    author?: string;
    platform?: string;
    id?: number | string;
  }

  interface MicrosoftBulletin {
    date: string;
    title: string;
    impact: string;
    severity: string;
    bulletin_id: string;
    knowledgebase_id: string;
  }

  interface Platform {
    id: string;
    title?: string;
    vulnerable?: boolean;
  }

  type CVE = Omit<CveData, 'attributes'> & CVEAttributes;

  const client = new Client();
  onDestroy(() => client.abort());

  const headers: DataTableHeader[] = [
    { key: 'name', value: 'Name' },
    { key: 'published_at', value: 'Publication date', display: (x) => getHumanReadableDate(x.published_at) },
    { key: 'exploits', value: 'Exploits' },
    { key: 'score', value: 'Score' }
  ];

  let rows: CVE[] = [];
  let loading = false;

  $: getCVE();

  async function getCVE() {
    loading = true;
    const url = '/api/v1/cve/?page&limit=10';
    const response = await client.gateway.get<CVEResponse>('THIAPP', url);
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
      {:else if cell.key === 'exploits'}
        {#if cell.value?.length}
          <div class="text-base text-center text-ctip-success">
            {cell.value.length}
          </div>
        {:else}
          <div class="text-base text-center text-ctip-danger">X</div>
        {/if}
      {:else if cell.key === 'score'}
        <div class="text-center">
          <ScoreCve score={cell.value} />
        </div>
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
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-cve"
  >
    See all CVE
  </Button>
</div>
