<script lang="ts">
  import type { MessageObjType } from '$lib/types/threat';
  import { Button, Tile } from 'carbon-components-svelte';
  import { View } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';

  export let messageObj: MessageObjType = { msg: 'There are no resources' };
  export let info = undefined;

  let displayMsj = false;
  const dispatch = createEventDispatcher();
  $: messageObj?.count && (displayMsj = true);

  function showMore() {
    dispatch('showMore');
  }
</script>

<div class="flex justify-center m-4">
  <div class="flex flex-col items-center p-5 mt-2.5 mb-2.5">
    <img src="assets/default_images/searching.svg" alt="Empty" class="w-[150px]" />
    <h3 class="text-center text-ctip-interactive" class:text-xl={info} class:mt-[22px]={info}>
      <slot>
        {messageObj.msg}
      </slot>
    </h3>
    {#if displayMsj}
      <Tile class="flex flex-col items-center text-center p-2.5 w-max m-auto text-sm">
        <span class="mb-2">but we have found results marked as not important </span>
        <Button kind="tertiary" on:click={showMore} icon={View}>Show</Button>
      </Tile>
    {/if}
  </div>
</div>
