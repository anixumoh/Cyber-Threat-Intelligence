<script lang="ts">
  import type { AlignType, KindType, SizeType } from '$lib/types';
  import { Button, TooltipDefinition } from 'carbon-components-svelte';

  let className = '';

  export let kind: KindType = 'ghost';
  export let size: SizeType = 'small';
  export let href = '';
  export let icon: typeof import('svelte').SvelteComponent<any> = undefined;
  export let iconDescription = '';
  export let disabled = false;
  export let id = undefined;
  export { className as class };
  export let hasTooltip = false;
  export let tooltipAlign: AlignType = 'center';
  export let type = 'button';
  export let hasDefaultGenericButtonClasses = true;
</script>

<Button
  class={hasDefaultGenericButtonClasses ? `w-full sm:w-auto px-2 rounded h-fit ${className}` : ''}
  {id}
  {disabled}
  {kind}
  {size}
  {icon}
  {iconDescription}
  {type}
  on:click
  on:mouseenter
  on:mouseover
  on:mouseleave
  {...href ? { href } : {}}
  {...$$restProps}
>
  {#if hasTooltip}
    <TooltipDefinition tooltipText={iconDescription} align={tooltipAlign}>
      <span class={hasDefaultGenericButtonClasses ? 'color-icon text-ctip-white' : ''}>
        <slot />
      </span>
    </TooltipDefinition>
  {:else}
    <slot />
  {/if}
</Button>
