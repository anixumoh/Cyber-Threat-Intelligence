<script lang="ts">
  import { DataTable, DataTableSkeleton, Pagination } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import type { Category } from './types';

  export let loading = false;
  export let category: Category;
  export let data: Record<Category, Set<string>>;
  export let pageSize: number = 5;

  let page = 1;

  const headers: DataTableHeader[] = [
    { key: 'category', value: 'CATEGORY' },
    { key: 'description', value: 'DESCRIPTION' }
  ];

  function capitalize(text: string) {
    if (!text) return text;
    return `${text[0].toUpperCase()}${text.slice(1)}`;
  }
</script>

{#if loading}
  <DataTableSkeleton
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
    size="compact"
    {headers}
    showToolbar={false}
    showHeader={false}
    rows={pageSize}
  />
{:else}
  <DataTable
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
    size="compact"
    {headers}
    {page}
    {pageSize}
    rows={[...data[category]].map((description) => ({
      id: description,
      description,
      category: capitalize(category)
    }))}
  />
  <Pagination {pageSize} bind:page totalItems={data[category].size} pageSizeInputDisabled />
{/if}
