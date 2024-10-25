<script lang="ts">
  import { preloadCode } from '$app/navigation';
  import { Button } from 'carbon-components-svelte';
  import { tick } from 'svelte';
  import { slide } from 'svelte/transition';
  import type { Item } from './menu-helper';
  import { ChevronDown, ChevronRight, ChevronUp } from 'carbon-icons-svelte';

  export let menuExpanded: boolean;
  export let item: Item;
  export let scrollTop = 0;

  const boxSize = 48;

  let expanded = false;
  let submenuEl: HTMLDivElement;
  let collidesBottom = false;
  let doContractTimeout;

  $: expanded = menuExpanded;

  async function doExpand() {
    preloadCode(item.link);
    if (menuExpanded) return;
    clearTimeout(doContractTimeout);
    expanded = true;
    await tick();
    if (!submenuEl) return;
    const bounds = submenuEl.getBoundingClientRect();
    collidesBottom = bounds.y + bounds.height > window.innerHeight;
  }

  function doContract() {
    if (menuExpanded) return;
    clearTimeout(doContractTimeout);
    collidesBottom = false;
    doContractTimeout = setTimeout(() => {
      expanded = false;
    }, 100);
  }
</script>

<div class:w-60={menuExpanded} class="bg-ctip-ui" class:menu-active={item.active && item.submenu}>
  <Button
    on:mouseenter={doExpand}
    on:mouseleave={doContract}
    href={item.link}
    on:click={() => {
      item.action;
      if (item.hasChevronIcons) {
        item.active = !item.active;
      }
    }}
    kind="ghost"
    size="field"
    data-test={item.selector}
    class="border-solid border-l-4 pr-[12px] border-t-0 border-r-0 border-b-0 no-underline dark:hover:text-white dark:text-white
    {item.active ? 'border-ctip-primary dark:border-ctip-lightBlue' : ''}
    {menuExpanded
      ? 'w-full max-w-[15rem]'
      : expanded
      ? 'text-ctip-primary border-ctip-primary dark:border-ctip-lightBlue dark:text-lightBlue'
      : ''}
    "
  >
    <div class="py-1 overflow-hidden whitespace-nowrap text-ellipsis w-full">
      <div class="flex {menuExpanded ? (item.icon ? '' : 'pl-12') : 'w-52'}">
        {#if item.icon}
          <img src={item.icon} class="h-6 pr-3 dark:invert" alt={item.text} />
        {/if}
        <div
          class="overflow-hidden whitespace-nowrap text-ellipsis flex justify-between w-full"
          class:text-ctip-primary={item.active && item.enabled !== false}
          class:dark:text-ctip-lightBlue={item.active && item.enabled !== false}
          class:text-ctip-danger={item.enabled === false}
          class:uppercase={!!item.submenu}
          title={item.text}
        >
          <span class="overflow-hidden w-full text-ellipsis">
            {item.text}
          </span>
        </div>
        {#if item.hasChevronIcons}
          <div class="ml-auto" class:dark:text-ctip-lightBlue={item.active && item.enabled !== false}>
            {#if (item.active || !menuExpanded) && item.submenu && expanded}
              {#if menuExpanded}
                <ChevronUp class="pointer-events-none" />
              {:else}
                <ChevronRight class="pointer-events-none" />
              {/if}
            {:else}
              <ChevronDown class="pointer-events-none" />
            {/if}
          </div>
        {/if}
      </div>
    </div>
  </Button>
  {#if (item.active || !menuExpanded) && item.submenu && expanded}
    <div
      bind:this={submenuEl}
      transition:slide={{ duration: menuExpanded ? 400 : 0 }}
      on:mouseenter={doExpand}
      on:mouseleave={doContract}
      class="bg-ctip-ui text-ctip-text
      {menuExpanded ? '' : `w-60 fixed left-80 ${collidesBottom ? 'bottom-4' : '-mt-12'}`}"
      style:margin-top="{menuExpanded ? 0 : -(scrollTop + boxSize)}px"
    >
      {#each item.submenu as submenu}
        <Button
          href={submenu.link}
          on:mouseenter={() => preloadCode(submenu.link)}
          kind="ghost"
          size="field"
          data-test={submenu.text}
          class="
          flex border-solid border-t-0 border-r-0 border-b-0 border-l-4 no-underline dark:text-white
          {submenu.active
            ? 'border-ctip-primary text-ctip-primary dark:border-ctip-lightBlue dark:!text-ctip-lightBlue'
            : ''}
          "
        >
          <div class="py-1 {menuExpanded ? 'pl-10' : 'w-52'}">
            {submenu.text}
          </div>
        </Button>
      {/each}
    </div>
  {/if}
</div>
