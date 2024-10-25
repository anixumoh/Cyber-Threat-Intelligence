<script lang="ts">
  import type { StatusType } from '$lib/types';
  import { ClickableTile } from 'carbon-components-svelte';
  import { Temperature } from 'carbon-icons-svelte';

  export let count = 0;
  export let type: StatusType = 'Critical';
  export let isSelected = false;
</script>

<ClickableTile
  on:click
  class="w-full border-[1px] border-solid border-transparent rounded {isSelected ? 'bg-ctip-hover-ui border-ctip-border shadow' : ''}"
  clicked={isSelected}
>
  <h1 class="text-right">{count}</h1>
  <div
    class="border-solid border-b-4 pb-2"
    class:border-b-ctip-dangerThreat={type === 'High'}
    class:border-b-ctip-darkThreat={type === 'Critical'}
    class:dark:border-b-ctip-white={type === 'Critical'}
    class:border-b-ctip-amberThreat={type === 'Medium'}
    class:border-b-ctip-successThreat={type === 'Low'}
  >
    <div
      class="rounded-full w-10 h-10 flex justify-center items-center"
      class:bg-ctip-dangerThreat={type === 'High'}
      class:bg-ctip-darkThreat={type === 'Critical'}
      class:dark:bg-ctip-white={type === 'Critical'}
      class:bg-ctip-amberThreat={type === 'Medium'}
      class:bg-ctip-successThreat={type === 'Low'}
    >
      <Temperature class="text-ctip-white dark:text-black" />
    </div>
    <h5 class="mt-2 text-xl leading-5 font-medium">{type}</h5>
  </div>
</ClickableTile>
