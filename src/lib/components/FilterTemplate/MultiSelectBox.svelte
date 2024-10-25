<script lang="ts">
  import { TooltipDefinition, TooltipIcon } from 'carbon-components-svelte';
  import { Checkmark, Information } from 'carbon-icons-svelte';
  import BoxTitle from './BoxTitle.svelte';

  type T = $$Generic;

  export let title = '';
  export let canSearch = false;
  export let canInverse = false;
  export let initialSort = false;
  export let items: T[] = [];
  export let displayKey: keyof T;
  export let valueKey: keyof T;
  export let disabledKey: keyof T = undefined;
  export let tooltipKey: keyof T = undefined;
  export let selectedValues: T[keyof T][] = [];
  export let inversed = false;
  export let type: 'checkbox' | 'radio' = 'checkbox';
  export let large = false;
  export let tooltip = '';
  let searchValue = '';

  $: initialSort && sortItems();

  function sortItems() {
    items = [...items].sort((item) => (selectedValues.includes(item[valueKey]) ? -1 : 0));
  }
</script>

<div class="w-full">
  <BoxTitle bind:searchValue {title} {canSearch} {canInverse} bind:inversed>
    <svelte:fragment slot="title">
      <slot name="title">
        <div class="flex gap-1 justify-center items-center">
          {title}
          {#if tooltip}
            <TooltipIcon direction="right" tooltipText={tooltip} icon={Information} />
          {/if}
        </div>
      </slot>
    </svelte:fragment>
  </BoxTitle>

  <div class="w-full overflow-auto border rounded bg-ctip-background {large ? 'h-[464px]' : 'h-52'}">
    {#each items as item, i (item[valueKey])}
      {@const shown = String(item[displayKey]).toLowerCase().includes(searchValue.toLowerCase())}
      {@const disabled = disabledKey ? !!item[disabledKey] : false}
      <label
        class:hidden={!shown}
        class="relative m-0 w-full px-3 flex items-center justify-between
        {disabled ? '' : 'cursor-pointer hover:bg-ctip-hover-ui'}"
      >
        {#if !disabled}
          {#if type === 'checkbox'}
            <input class="peer" type="checkbox" hidden bind:group={selectedValues} value={item[valueKey]} />
          {:else if type === 'radio'}
            <input
              on:click={() => {
                if (selectedValues === item[valueKey]) {
                  selectedValues = null;
                }
              }}
              class="peer"
              type="radio"
              hidden
              bind:group={selectedValues}
              value={item[valueKey]}
            />
          {/if}
        {/if}
        <div
          class:opacity-50={disabled}
          class="text-sm overflow-hidden text-ellipsis peer-checked:font-bold peer-checked:text-ctip-interactive
          {disabled ? 'py-1.5' : 'py-2.5'}"
          title={`${item[displayKey]}`}
        >
          {item[displayKey]}
        </div>
        <div class="hidden w-4 peer-checked:block">
          <Checkmark class="text-ctip-interactive" />
        </div>
        {#if tooltipKey && item[tooltipKey]}
          <TooltipDefinition
            class="absolute w-full h-full inset-0 [&_button]:hidden [&>div]:max-w-[75%]"
            tooltipText={String(item[tooltipKey])}
            direction={i === items.length - 1 ? 'top' : 'bottom'}
          >
            <span />
          </TooltipDefinition>
        {/if}
      </label>
    {/each}
  </div>
</div>
