<script lang="ts">
  import FilterButtons from '$lib/components/Filter/FilterButtons.svelte';
  import type { KindType } from '$lib/types';
  import { TooltipIcon } from 'carbon-components-svelte';

  export let isActive = false;
  export let text = '';
  export let icon = undefined;
  export let kind: KindType = 'ghost';
  export let showIconWithText = false;
</script>

<FilterButtons {kind} {isActive} on:click>
  <span class={`${icon ? 'hidden lg:flex' : ''} items-center gap-2`}>
    {#if icon && showIconWithText}
      <svelte:component this={icon} />
    {/if}
    {text}
  </span>
  <TooltipIcon class="lg:hidden" tooltipText={text} {icon} />
</FilterButtons>
