<script lang="ts">
  import type { TCXCVESingleResponse } from '$lib/types/tcx';
  import { DataTable, PaginationNav } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';

  const headers: DataTableHeader[] = [
    { key: 'title', value: 'TITLE' },
    { key: 'id', value: 'CPE' }
  ];

  const pageSize = 5;

  export let cveResponse: TCXCVESingleResponse;

  let page = 1;

  $: rows = cveResponse.data.attributes.platforms;
  $: totalPages = Math.ceil(rows.length / pageSize);
</script>

<DataTable {page} {pageSize} title="Affected Platforms" {headers} {rows} />

{#if totalPages > 1}
  <PaginationNav bind:page total={totalPages} />
{/if}
