<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Button, PaginationNav, SkeletonPlaceholder } from 'carbon-components-svelte';
  import menuExpandedStore from '$stores/menuExpanded';
  import { SkipBackFilled, SkipForwardFilled } from 'carbon-icons-svelte';

  export let page: number = 1;
  export let total: number = 10;
  export let shown: number = 1;
  export let loop: boolean = false;
  export let forwardText: string = 'Next page';
  export let backwardText: string = 'Previous page';
  export let goToTheFirstText = 'Go to the first page';
  export let goToTheLastText = 'Go to the last page';
  export let haveLastPageButton = true;
  export let loading = false;

  const boxWidth = 48;
  const hideSelectorsCss = '[&_select]:pointer-events-none';

  let el: HTMLDivElement;
  let timeoutId;

  onMount(() => {
    shown = getShown();
    return () => clearTimeout(timeoutId);
  });

  $: browser && calculateShown($menuExpandedStore);

  function calculateShown(_) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      shown = getShown();
    }, 250);
  }

  function getShown() {
    const width = el.clientWidth;
    const boxes = Math.floor(width / boxWidth);
    return Math.min(10, boxes - 5);
  }
</script>

<svelte:window on:resize={calculateShown} />

<div class="w-full" bind:this={el}>
  {#if loading}
    <SkeletonPlaceholder class="w-full h-12" />
  {:else}
    <div class="flex items-center">
      <Button
        kind="ghost"
        tooltipAlignment="center"
        tooltipPosition="bottom"
        iconDescription={goToTheFirstText}
        icon={SkipBackFilled}
        disabled={page === 1}
        on:click={() => (page = 1)}
        class="backFordwardButton"
      />
      <PaginationNav
        on:change
        on:click:button--next
        on:click:button--previous
        bind:page
        bind:total
        bind:shown
        bind:loop
        bind:forwardText
        bind:backwardText
        {...$$restProps}
        class="[&>ul]:mb-0{total > 1000 ? ` ${hideSelectorsCss}` : ''}"
      />
      {#if haveLastPageButton}
        <Button
          kind="ghost"
          tooltipAlignment="center"
          tooltipPosition="bottom"
          iconDescription={goToTheLastText}
          icon={SkipForwardFilled}
          disabled={page === total}
          on:click={() => (page = total)}
          class="backFordwardButton"
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  :global(button.backFordwardButton svg.bx--btn__icon) {
    width: 0.7rem;
  }
</style>
