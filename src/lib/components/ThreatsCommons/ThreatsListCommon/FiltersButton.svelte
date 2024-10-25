<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import ThreatFilterForm from '$lib/components/ThreatFilterForm.svelte';
  import TooltipWrap from '$lib/components/TooltipWrap.svelte';
  import threatsFilterStore, { filtersCount } from '$stores/filters';
  import { Select, SelectItem, Tag, ToolbarSearch } from 'carbon-components-svelte';
  import { Filter, FilterRemove } from 'carbon-icons-svelte';

  export let filterMenuOpen = false;
  export let isAllThreats = false;
  export let search = '';
  export let searchExpanded = false;
</script>

{#if $filtersCount || filterMenuOpen}
  <TooltipWrap direction="top" align="end">
    <span class="w-40 block" slot="tooltip">Clear filters to enable free text search</span>
    <ToolbarSearch class="opacity-30" disabled />
  </TooltipWrap>
{:else}
  <ToolbarSearch bind:expanded={searchExpanded} bind:value={search} class="max-w-sm" />
{/if}

<div class="w-2" />

{#if isAllThreats}
  <div class="-mt-3 mr-2">
    <Select bind:selected={$threatsFilterStore.days}>
      <SelectItem value={15} text="Last 15 days" />
      <SelectItem value={30} text="Last 30 days" />
      <SelectItem value={90} text="Last 90 days" />
    </Select>
  </div>
{/if}

{#if $filtersCount}
  <GenericButton
    kind="danger-tertiary"
    data-test="Clear_filters"
    class="mr-2 pr-10 min-w-[125px]"
    on:click={() => threatsFilterStore.clearFilters()}
    icon={FilterRemove}
  >
    Clear filters
  </GenericButton>
{/if}

<div class="relative">
  {#if search || searchExpanded}
    <TooltipWrap direction="top" align="end">
      <span class="w-40 block" slot="tooltip">Clear search to enable filters</span>
      <GenericButton kind="primary" class="pr-10 min-w-[132px]" disabled icon={Filter}>Filters</GenericButton>
    </TooltipWrap>
  {:else}
    <GenericButton
      kind="primary"
      data-test="filter"
      class="pr-10 min-w-[132px]"
      on:click={(e) => {
        e.stopImmediatePropagation();
        filterMenuOpen = !filterMenuOpen;
      }}
      icon={Filter}
    >
      <div>
        Filters
        {#if $filtersCount}
          <Tag size="sm" class="ml-2 cursor-pointer" type="high-contrast">
            {$filtersCount}
          </Tag>
        {/if}
      </div>
    </GenericButton>
  {/if}

  <ThreatFilterForm bind:open={filterMenuOpen} {isAllThreats} />
</div>
