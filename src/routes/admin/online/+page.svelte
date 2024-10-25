<script lang="ts">
  import { pageSizes } from '$lib/constants/pagination';
  import { Pagination } from 'carbon-components-svelte';
  import {
    DataTable,
    DataTableSkeleton,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    Button
  } from 'carbon-components-svelte';
  import { Renew } from 'carbon-icons-svelte';
  import Client from '$lib/client';
  import type { Online } from '$lib/types/admin';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'username', value: 'USERNAME' },
    { key: 'creationTime', value: 'CONNECTION' },
    { key: 'lastAccessedTime', value: 'LAST ACCESS' }
  ];

  let rows: Online[] = [];
  let loading = true;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let page = 1;

  $: getOnline();

  async function getOnline() {
    loading = true;
    rows = await client.admin.getOnline();
    loading = false;
  }
</script>

<h4>Online</h4>

{#if loading}
  <DataTableSkeleton {headers} rows={pageSize} showHeader={false} />
{:else}
  <DataTable
    {page}
    {pageSize}
    class="[&_td]:text-center"
    {headers}
    rows={rows.map((r) => ({
      ...r,
      id: r.username,
      creationTime: getHumanReadableDate(+r.creationTime),
      lastAccessedTime: getHumanReadableDate(+r.lastAccessedTime)
    }))}
    id="online-table"
  >
    <Toolbar>
      <ToolbarContent>
        <ToolbarSearch shouldFilterRows placeholder="Search for user name" />
        <Button kind="ghost" disabled={loading} icon={Renew} on:click={getOnline}>Refresh Online</Button>
      </ToolbarContent>
    </Toolbar>
  </DataTable>
{/if}
<Pagination {pageSizes} bind:pageSize bind:page totalItems={rows.length} />
