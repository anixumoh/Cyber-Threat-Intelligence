<script lang="ts">
  import { COLORS } from '$lib/constants/colors';

  import type { AlignType, DirectionType } from '$lib/types';
  import { TooltipIcon } from 'carbon-components-svelte';
  const { gray } = COLORS;

  export let tooltipText = '';
  export let direction: DirectionType = 'top';
  export let align: AlignType = 'end';
  export let color = undefined;
  export let classStyle = '';
  export let disabled = false;
  export let icon;
</script>

<TooltipIcon
  {tooltipText}
  {direction}
  {align}
  {icon}
  {disabled}
  {...$$restProps}
  class={`${disabled ? '' : 'tooltip-icon'} ${classStyle}`}
  style="--color-tooltip: {color ?? gray}"
  on:click
/>

<style>
  :global(.tooltip-icon svg) {
    width: 19px;
    height: 19px;
    cursor: pointer;
    fill: var(--color-tooltip) !important;
  }
</style>
