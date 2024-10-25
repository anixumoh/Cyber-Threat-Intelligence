<script lang="ts">
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { Button, ButtonSet, Tag, Tile } from 'carbon-components-svelte';
  import { Filter, FilterRemove } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';

  export let formClass = '';
  export let open = false;
  export let filtersCount = 0;

  let formEl: HTMLFormElement;

  const dispatch = createEventDispatcher<{ clear: void; cancel: void; apply: void }>();

  function onClear() {
    open = false;
    dispatch('clear');
  }

  function onCancel() {
    open = false;
    dispatch('cancel');
  }

  function onApply() {
    open = false;
    dispatch('apply');
  }

  function handleClickOutside(e: MouseEvent) {
    if (!open) return;
    if (!document.body.contains(e?.target as HTMLElement)) return; // clicked temporal element (dropdown, etc...)
    if (open && formEl && formEl.contains(e?.target as HTMLElement)) return; // clicked inside
    // clicked outside
    open = false;
    dispatch('cancel');
  }
</script>

<svelte:window on:click={handleClickOutside} />

{#if filtersCount}
  <GenericButton size="small" kind="danger-tertiary" data-test="Clear_filters" class="flex gap-2" on:click={onClear}>
    Clear filters
    <FilterRemove />
  </GenericButton>
{/if}

<div class="relative">
  <GenericButton
    size="small"
    kind="primary"
    data-test="filter"
    on:click={(e) => {
      e.stopImmediatePropagation();
      open = !open;
    }}
  >
    <div>
      Filters
      {#if filtersCount}
        <Tag size="sm" class="ml-2 cursor-pointer my-0" type="high-contrast">
          {filtersCount}
        </Tag>
      {/if}
      <Filter />
    </div>
  </GenericButton>

  {#if open}
    <form bind:this={formEl} class="absolute top-full z-10 grid right-0 shadow border {formClass}">
      <Tile class="px-4 pt-4">
        <slot {open} />
      </Tile>

      <ButtonSet class="flex w-full">
        <Button class="w-1/2 h-12 max-w-none" kind="secondary" on:click={onCancel}>Cancel</Button>
        <Button class="w-1/2 h-12 max-w-none" data-test="Apply" on:click={onApply}>Apply</Button>
      </ButtonSet>
    </form>
  {/if}
</div>
