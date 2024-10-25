<script lang="ts">
  import GenericSingleSelect from '../Filter/GenericSingleSelect.svelte';
  import SearchDebounce from '../SearchDebounce.svelte';
  import preferencesStore from '$stores/preferences';
  import { pageSizes } from '$lib/constants/pagination';
  import { List } from 'carbon-icons-svelte';

  export let title = undefined;
  export let q = '';
  export let maxRows = $preferencesStore.defaultRows ?? 10;
  export let placeholder = 'Search';
  export let hideSearch = false;
</script>

<div class="flex p-2 bg-ctip-ui text-ctip-text sm:sticky sm:top-14 sm:z-[2] justify-between flex-wrap">
  <div class="flex sm:flex-row justify-between items-center">
    {#if title}
      <span class="text-base mr-4">{title}</span>
    {/if}
    <slot name="action-buttons" />
  </div>
  <div class="flex justify-center sm:justify-end">
    <slot name="actions-aux" />
    {#if !hideSearch}
      <SearchDebounce bind:value={q} on:search startSearch={1} {placeholder} />
    {/if}
    <GenericSingleSelect
      align="bottom-right"
      highlightedWhenSeleted={false}
      customClass="border text-ctip-btnLight ml-2"
      selectedValue={maxRows}
      items={pageSizes.map((size) => ({ text: size, value: size }))}
      value="value"
      display="text"
      title={`${maxRows}`}
      icon={List}
      alwaysShowIcon
      on:changeSelected
    />
  </div>
</div>
