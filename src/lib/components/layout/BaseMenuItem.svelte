<script lang="ts">
  import { Button } from 'carbon-components-svelte';
  import { ChevronDown, ChevronRight, ChevronUp } from 'carbon-icons-svelte';
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { Item } from './menu-helper';
  import SubmenuItem from './SubmenuItem.svelte';

  export let menuExpanded: boolean;
  export let expanded: boolean;
  export let hightlight: boolean;
  export let icon: any;
  export let items: Item[];
  export let title: string;

  let isExpanded = false;
  let expandedMenuEl: HTMLDivElement;
  let maxHeight: number;
  let scrollTop = 0;

  $: isExpanded = menuExpanded ? expanded : false;

  let doContractTimeout;
  async function doExpand() {
    if (menuExpanded) return;
    clearTimeout(doContractTimeout);
    isExpanded = true;
    await tick();
    setMaxHeight();
  }

  function setMaxHeight() {
    const bounds = expandedMenuEl.getBoundingClientRect();
    maxHeight = window.innerHeight - bounds.y;
  }

  function doContract() {
    if (menuExpanded) return;
    clearTimeout(doContractTimeout);
    doContractTimeout = setTimeout(() => {
      isExpanded = false;
    }, 100);
  }
</script>

{#if items.length}
  <Button
    on:mouseenter={doExpand}
    on:mouseleave={doContract}
    kind="ghost"
    size="field"
    data-test={title}
    class="flex w-full h-12 dark:text-white justify-between items-center hover:opacity-90 border-l-4 border-transparent
    {hightlight ? 'border-l-ctip-primary dark:border-l-ctip-lightBlue menu-active' : ''}
    {menuExpanded ? '' : 'pl-1'}"
    on:click={() => (expanded = !expanded)}
  >
    {#if menuExpanded}
      <div>
        <svelte:component this={icon} size={24} />
        <span class="ml-3" class:text-ctip-primary={hightlight} class:dark:text-ctip-lightBlue={hightlight}>
          <slot name="title">
            {title}
          </slot>
        </span>
      </div>
      <svelte:component
        this={expanded ? ChevronUp : ChevronDown}
        class={hightlight ? 'text-ctip-primary dark:text-ctip-lightBlue' : ''}
        size={24}
      />
    {:else}
      <ChevronRight class={hightlight ? 'text-ctip-primary dark:text-ctip-lightBlue' : ''} size={24} />
      <svelte:component this={icon} size={24} />
    {/if}
  </Button>
  {#if isExpanded}
    <div
      on:scroll={(e) => (scrollTop = e.target?.scrollTop || 0)}
      bind:this={expandedMenuEl}
      transition:slide={{ duration: menuExpanded ? 400 : 0 }}
      on:mouseenter={doExpand}
      on:mouseleave={doContract}
      style="max-height: {maxHeight}px"
      class={menuExpanded ? 'grid' : 'absolute left-20 -mt-12 overflow-y-auto no-scrollbar'}
    >
      {#each items as item}
        <SubmenuItem {scrollTop} {item} {menuExpanded} />
      {/each}
    </div>
  {/if}
{/if}

<style>
  .no-scrollbar::-webkit-scrollbar {
    width: 0;
  }
</style>
