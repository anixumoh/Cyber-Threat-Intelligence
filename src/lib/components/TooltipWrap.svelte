<script lang="ts">
  import type { TooltipProps } from 'carbon-components-svelte/types/Tooltip/Tooltip.svelte';
  import { Tooltip } from 'carbon-components-svelte';

  export let open = false;
  export let tooltip = '';
  export let align: TooltipProps['align'] = 'center';
  export let direction: TooltipProps['direction'] = 'bottom';
</script>

<Tooltip class="flex items-center justify-center p-0 tooltip-wrapper" bind:open {align} {direction}>
  <slot name="tooltip">
    {tooltip}
  </slot>
  <svelte:fragment slot="icon">
    <div on:mouseenter={() => (open = true)} on:mouseleave={() => (open = false)} {...$$restProps}>
      <slot />
    </div>
  </svelte:fragment>
</Tooltip>

<style>
  :global(.tooltip-wrapper .bx--tooltip) {
    padding: 4px 10px;
    margin: 0;
    min-width: fit-content;
  }
  :global(.tooltip-wrapper .bx--tooltip__label .bx--tooltip__trigger) {
    margin: 0;
  }
</style>
