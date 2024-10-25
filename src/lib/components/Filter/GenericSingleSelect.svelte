<script lang="ts">
  import { Popover } from 'carbon-components-svelte';
  import clickOutside from '$lib/actions/clickOutside';
  import { createEventDispatcher } from 'svelte';
  import { Checkmark } from 'carbon-icons-svelte';
  import type { AlignPopoverType, KindType } from '$lib/types';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { iconClasses, iconTextClasses } from '$lib/utils';

  type T = $$Generic;
  const dispatch = createEventDispatcher();

  export let items: T[] = [];
  export let display: keyof T = undefined;
  export let value: keyof T;
  export let selectedValue: any;
  export let title = '';
  export let icon: any = undefined;
  export let alwaysShowIcon = false;
  export let iconPosition: 'left' | 'right' = 'left';
  export let align: AlignPopoverType = 'bottom';
  export let customClass = '';
  export let activeClasses = '';
  export let highlightedWhenSeleted = true;
  export let btnKind: KindType = 'ghost';
  export let selectionZero = true;

  let open = false;

  $: hasSelections = selectedValue !== undefined && selectedValue !== null && selectionZero;

  function onChange(value: T[keyof T]) {
    dispatch('changeSelected', value);
    open = false;
  }
</script>

<div class="relative" data-outline use:clickOutside on:clickOutside={() => (open = false)}>
  <GenericButton
    {...$$restProps}
    class="text-ctip-btnLight dark:text-white
    {customClass} {highlightedWhenSeleted && hasSelections && activeClasses}"
    kind={btnKind}
    on:click={() => (open = !open)}
  >
    <slot name="btn" {selectedValue}>
      {#if icon}
        {#if iconPosition === 'left'}
          <svelte:component this={icon} class={alwaysShowIcon ? '' : iconClasses} />
          <div class={iconTextClasses}>{title}</div>
        {:else}
          <div class={`${iconTextClasses} mr-2`}>{title}</div>
          <svelte:component this={icon} class={alwaysShowIcon ? '' : iconClasses} />
        {/if}
      {:else}
        <div>{title}</div>
      {/if}
    </slot>
  </GenericButton>
  <Popover {open} {align}>
    <ul class="w-full max-h-52 overflow-y-auto">
      {#each items as item (item[value])}
        <li
          class="flex justify-between items-center text-left border-0 px-2 py-2 cursor-pointer hover:bg-ctip-selected hover:text-ctip-selectedText dark:text-white dark:hover:text-black"
          class:bg-ctip-border={selectedValue === item[value]}
          class:dark:!text-black={selectedValue === item[value]}
          on:click={() => onChange(item[value])}
        >
          <div class="flex">
            <slot name="label" {item}>
              {item[display]}
            </slot>
          </div>
          <div class="ml-3">
            {#if selectedValue === item[value]}
              <Checkmark />
            {/if}
          </div>
        </li>
      {/each}
    </ul>
  </Popover>
</div>
