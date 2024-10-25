<script lang="ts">
  import { Button } from 'carbon-components-svelte';

  type T = $$Generic;

  export let items: T[];
  export let itemsToShow = items.length;
  export let rowsToShow = 2;

  let showAll = false;
  let divEl: HTMLDivElement;
  let timeoutResize: ReturnType<typeof setTimeout>;
  let screenResized = 0;

  $: shownItems = findIndexToCut(divEl, items, rowsToShow, screenResized);
  $: remainingItems = items.length - shownItems.length;

  function toggleShowAll() {
    showAll = !showAll;
  }

  function findIndexToCut(divEl: HTMLDivElement, items: T[], rowsToShow: number, _: number) {
    if (!divEl?.children?.length) return items;

    let currentY = 0;
    let rows = 0;
    let i = 0;
    for (const child of divEl.children) {
      const y = child.getBoundingClientRect().y;
      if (y > currentY) {
        currentY = y;
        rows++;
      }
      if (rows > rowsToShow) {
        return items.slice(0, i - 1);
      }
      i++;
    }
    return items;
  }

  function onResize() {
    clearTimeout(timeoutResize);
    timeoutResize = setTimeout(() => screenResized++, 250);
  }
</script>

<svelte:window on:resize={onResize} />

<div {...$$restProps} bind:this={divEl}>
  {#each remainingItems && !showAll ? shownItems : items as item}
    <slot {item}>{item}</slot>
  {/each}
  {#if remainingItems}
    <Button on:click={toggleShowAll} size="small" kind="ghost">
      {#if showAll}
        Show less
      {:else}
        <span>
          {remainingItems} more
        </span>
      {/if}
    </Button>
  {/if}
</div>
