<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import roleStore from '$stores/role';
  import { Button, Checkbox, InlineLoading, Search, TextArea, TooltipDefinition } from 'carbon-components-svelte';
  import type { TooltipDefinitionProps } from 'carbon-components-svelte/types/TooltipDefinition/TooltipDefinition.svelte';
  import { Add, InformationFilled, TrashCan } from 'carbon-icons-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { slide } from 'svelte/transition';

  type T = $$Generic;

  export let title = '';
  export let info = '';
  export let canAdd = false;
  export let placeholder = '';
  export let noItemsMessage = '';
  export let invalidInput = '';

  export let loading = false;
  export let items: T[] = [];
  export let itemKey: keyof T;
  export let itemValue: keyof T;

  export let hideSelectAll = false;
  export let selectedIds: T[typeof itemKey][] = [];
  export let hideSearch = false;

  export let addExpanded = false;
  export let addText = '';

  export let filterItem = (item: T, search: string) =>
    String(item[itemValue]).toLocaleLowerCase().includes(search.toLocaleLowerCase());

  const dispatch = createEventDispatcher<{ add: string; delete: T[] }>();

  onMount(() => (align = calculateTooltipPosition()));

  function calculateTooltipPosition(): TooltipDefinitionProps['align'] {
    if (infoDiv) {
      const bounds = infoDiv.getBoundingClientRect();
      if (bounds.x + 300 > window.innerWidth) return 'end';
    }
    return 'center';
  }

  function calculateTooltipPositionDebounce() {
    clearTimeout(tooltipPositionTimeout);
    tooltipPositionTimeout = setTimeout(() => (align = calculateTooltipPosition()), 200);
  }

  let infoDiv: HTMLDivElement;
  let align: TooltipDefinitionProps['align'] = 'center';
  let tooltipPositionTimeout: NodeJS.Timeout;
  let search = '';
  let searchExpanded = false;

  $: filteredItems = search ? items.filter((item) => filterItem(item, search)) : items;
  $: isAllSelected = selectedIds.length && selectedIds.length === items.length;
  $: if (items) resetSelected();

  function resetSelected() {
    selectedIds = [];
  }

  function onAdd() {
    dispatch('add', addText);
  }

  function onDelete(items: T[]) {
    dispatch('delete', items);
  }

  function selectUnselectAll() {
    if (isAllSelected) {
      selectedIds = [];
    } else {
      selectedIds = items.map((item) => item[itemKey]);
    }
  }
</script>

<svelte:window on:resize={calculateTooltipPositionDebounce} />

<div data-test={title} class="relative border rounded">
  <div class="relative border-b border-solid rounded-t border-ctip-border bg-ctip-ui text-ctip-text">
    <div class="flex flex-wrap items-center justify-between p-2">
      <div class="flex items-center">
        {#if !hideSelectAll}
          <Checkbox
            disabled={$roleStore.customer || $roleStore.operator || !items.length}
            on:change={selectUnselectAll}
            checked={isAllSelected}
            class="m-0 mr-2 [&_label]:m-0"
            hideLabel
          />
        {/if}
        {#if !searchExpanded}
          <span>{title}</span>
          <slot name="after-title" />
        {/if}
      </div>
      <div class="flex items-center gap-1">
        {#if !searchExpanded}
          {#if info}
            <div class="px-2" bind:this={infoDiv}>
              <TooltipDefinition {align}>
                <InformationFilled class="mt-1 fill-ctip-interactive" />
                <svelte:fragment slot="tooltip">
                  <slot name="info">
                    {info}
                  </slot>
                </svelte:fragment>
              </TooltipDefinition>
            </div>
          {/if}
          <slot name="actions" />
          {#if canAdd && !($roleStore.customer || $roleStore.operator)}
            <Button
              data-test="add"
              kind="ghost"
              class="px-2 rounded"
              size="small"
              on:click={() => (addExpanded = !addExpanded)}
            >
              <Add class="{addExpanded ? 'rotate-45' : ''} transition-transform" />
            </Button>
          {/if}
        {/if}
        {#if !hideSearch}
          <Search
            {placeholder}
            bind:value={search}
            size="sm"
            on:collapse={() => setTimeout(() => (searchExpanded = false), 100)}
            on:expand={() => (searchExpanded = true)}
            expandable
          />
        {/if}
      </div>
    </div>
    <div class="p-2">
      <slot name="under-title" />
    </div>
    {#if addExpanded}
      <div
        class="absolute z-10 grid w-full gap-2 p-2 border-b border-solid bg-ctip-ui text-ctip-text border-ctip-border"
      >
        <slot name="add-form">
          <TextArea invalid={!!invalidInput} bind:value={addText} rows={3} {placeholder} />
          <div class="flex flex-row-reverse gap-2">
            <GenericButton disabled={!addText} kind="primary" size="small" on:click={onAdd}>Add</GenericButton>
            <GenericButton
              kind="danger-tertiary"
              size="small"
              on:click={() => {
                addExpanded = false;
                addText = '';
              }}
            >
              Close
            </GenericButton>
          </div>
        </slot>
      </div>
    {/if}
  </div>
  <div class="relative overflow-x-auto h-72" class:!h-60={!!selectedIds.length}>
    {#if loading}
      <InlineLoading class="flex items-center justify-center h-full" />
    {:else if items.length}
      {#each filteredItems as item}
        <slot name="item" {item}>
          <div
            data-test="param-item"
            class="flex items-center justify-between w-full px-2 py-1 border-b border-solid border-ctip-border hover:bg-ctip-hover-ui"
          >
            <div title={String(item[itemValue])} class="grid items-center grid-flow-col grid-cols-[auto_1fr] w-full">
              <Checkbox
                disabled={$roleStore.customer || $roleStore.operator}
                bind:group={selectedIds}
                value={item[itemKey]}
                class="m-0 mr-2 [&_label]:m-0"
              />
              <div class="overflow-hidden text-ellipsis whitespace-nowrap">
                <slot name="item-display" {item}>
                  {item[itemValue]}
                </slot>
              </div>
            </div>

            <div class="flex justify-between gap-2">
              <slot name="item-actions" {item} />
              {#if !($roleStore.customer || $roleStore.operator)}
                <Button
                  data-test="delete-item"
                  on:click={() => onDelete([item])}
                  kind="ghost"
                  class="px-2 rounded"
                  size="small"
                >
                  <TrashCan class="fill-ctip-danger" />
                </Button>
              {/if}
            </div>
          </div>
        </slot>
      {/each}
    {:else}
      <div class="grid px-2 py-12">
        <img class="mx-auto" width="70" alt="no-resources-found" src="/assets/default_images/searching.svg" />
        <span class="mx-auto mt-2 text-base text-center text-ctip-interactive">
          {noItemsMessage}
        </span>
      </div>
    {/if}
    <slot name="after" />
  </div>
  {#if !!selectedIds.length}
    <div
      in:slide
      class="absolute bottom-0 left-0 flex justify-end w-full p-2 border-t border-solid bg-ctip-ui border-ctip-ui"
    >
      <Button
        on:click={() => onDelete(items.filter((item) => selectedIds.includes(item[itemKey])))}
        kind="danger"
        class="px-2 rounded"
        size="small"
      >
        Delete
      </Button>
    </div>
  {/if}
</div>
