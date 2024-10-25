<script lang="ts">
  import { browser } from '$app/environment';
  import { Close } from 'carbon-icons-svelte';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';

  const dispatch = createEventDispatcher();

  onDestroy(() => {
    document.body.style.overflow = 'auto';
  });

  export let isOpen = false;
  export let title = 'Drawer';
  export let hasDefaultHeader = true;
  // by default Drawer opens from right. Make left-0 for left opening
  export let placement = 'right-0';
  // max size of content section
  export let maxScreenSize = 'max-w-lg';

  $: browser && scrollLock(isOpen);

  // scrolllock for content underneath
  function scrollLock(isOpen) {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
  }

  function onClickAway() {
    dispatch('clickAway');
    isOpen = !isOpen;
  }
</script>

<aside>
  <div class="fixed inset-0 w-full h-full z-50 overflow-hidden {isOpen ? 'visible' : 'invisible'}">
    <div
      class="w-screen h-full bg-gray-500 dark:bg-neutral-800 cursor-pointer duration-500 transition-opacity overflow-hidden
      {isOpen ? 'opacity-50' : 'opacity-0'}"
      on:click={onClickAway}
    />
    <div
      class="absolute {placement} top-0 shadow-xl overflow-y-auto bg-ctip-background text-ctip-text transition-all duration-300 h-full {maxScreenSize}
      {isOpen ? 'w-screen' : 'w-0'}"
    >
      {#if hasDefaultHeader}
        <div class="flex justify-between m-2">
          <h5>{title}</h5>
          <GenericButton on:click={onClickAway}>
            <Close class="w-6 h-6 cursor-pointer" />
          </GenericButton>
        </div>
      {:else}
        <slot name="custom-header" />
      {/if}
      <slot />
    </div>
  </div>
</aside>
