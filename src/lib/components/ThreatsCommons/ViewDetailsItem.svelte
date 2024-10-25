<script lang="ts">
  import { TooltipIcon } from 'carbon-components-svelte';
  import type { TooltipIconProps } from 'carbon-components-svelte/types/TooltipIcon/TooltipIcon.svelte';

  export let title = 'Key';
  export let value: string | number | boolean = '';
  export let icon: TooltipIconProps['icon'] = undefined;
  export let action = false;
  export let buttonAction = false;
  export let isInverse = false;
  export let direction: TooltipIconProps['direction'] = 'left';
  export let tooltipText: TooltipIconProps['tooltipText'] = '';
  export let align: TooltipIconProps['align'] = 'center';
  export { className as class };

  let className = '';
</script>

<div class="flex justify-between items-center w-full">
  <div class="flex items-center">
    <div
      class="{className ? 'w-8 h-8' : 'w-10 h-10'}
    flex justify-center items-center text-ctip-white bg-ctip-primary"
    >
      {#if tooltipText}
        <TooltipIcon
          class="w-full h-full flex items-center justify-center bg-ctip-primary [&_svg]:fill-white"
          {tooltipText}
          {direction}
          {align}
          {icon}
        />
      {:else}
        <svelte:component this={icon} class={className ?? 'w-6 h-6'} />
      {/if}
    </div>
    <div class="m-2 uppercase font-bold">{title}</div>
    {#if isInverse}
      <slot name="inverse" />
    {/if}
    {#if buttonAction}
      <slot name="buttonAction" />
    {/if}
  </div>
  <div class="text-right">
    {#if action}
      <slot name="action" />
    {:else}
      <span class="break-all">{value}</span>
      <slot />
    {/if}
  </div>
</div>
