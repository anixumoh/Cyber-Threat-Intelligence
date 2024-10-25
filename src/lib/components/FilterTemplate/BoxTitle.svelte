<script lang="ts">
  import { Search, Toggle } from 'carbon-components-svelte';

  export let title = '';
  export let canSearch = false;
  export let canInverse = false;
  export let inversed = false;

  export let searchValue = '';

  let searchExpanded = false;
</script>

<div class="flex items-center justify-between w-full h-8">
  {#if !searchExpanded}
    <slot name="title">
      <div class="text-base">
        {title}
      </div>
    </slot>
  {:else}
    <div />
  {/if}
  <div class="flex items-centerz">
    <div>
      {#if canSearch}
        <Search bind:value={searchValue} size="sm" expandable bind:expanded={searchExpanded} />
      {/if}
    </div>

    {#if canInverse}
      <Toggle class="mt-2 mr-14" size="sm" hideLabel bind:toggled={inversed}>
        <span slot="labelA">Inverse</span>
        <span slot="labelB" class="font-bold text-ctip-primary">Inverse</span>
      </Toggle>
    {/if}
  </div>
</div>
