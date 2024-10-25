<script lang="ts">
  import { Checkbox, Popover } from 'carbon-components-svelte';
  import clickOutside from '$lib/actions/clickOutside';
  import type { KindType } from '$lib/types';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { activeClasses, iconClasses, iconTextClasses } from '$lib/utils';

  type T = $$Generic;

  export let items: T[] = [];
  export let display: keyof T = undefined;
  export let value: keyof T;
  export let selectedValues: any[] = [];
  export let title = '';
  export let icon: any = undefined;
  export let kind: KindType = 'ghost';
  export let hasSelectionsForced = undefined;

  let open = false;

  $: hasSelections = selectedValues?.length > 0;
</script>

<div class="btn-group" data-outline use:clickOutside on:clickOutside={() => (open = false)}>
  <GenericButton
    {...$$restProps}
    class="ctip-interactive
    {hasSelectionsForced ?? hasSelections ? activeClasses : 'border-ctip-border'}"
    {kind}
    on:click={() => (open = !open)}
  >
    {#if icon}
      <svelte:component this={icon} class={iconClasses} />
      <div class={iconTextClasses}>{title}</div>
    {:else}
      <div>{title}</div>
    {/if}
  </GenericButton>
  <Popover {open} align="bottom">
    <ul class="w-full max-h-52 overflow-y-auto bg-ctip-ui">
      {#each items as item (item[value])}
        <li class="flex justify-between items-center text-left border-0" class:bg-ctip-border={false}>
          <label
            class="hover:bg-ctip-selected hover:text-ctip-selectedText w-full px-2 py-2 cursor-pointer flex justify-between"
          >
            <div>
              <slot name="label" {item}>
                {item[display]}
              </slot>
            </div>
            <div class="ml-2">
              <Checkbox class="m-0 [&_label]:m-0" on:change hideLabel bind:group={selectedValues} value={item[value]} />
            </div>
          </label>
        </li>
      {:else}
        <li class="p-4">No items to show</li>
      {/each}
    </ul>
  </Popover>
</div>
