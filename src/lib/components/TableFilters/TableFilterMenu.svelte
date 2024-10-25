<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let icon: typeof SvelteComponent<any> = undefined;
  export let danger = false;
</script>

<li
  class="flex items-center text-left border-0 px-2 py-2 cursor-pointer {$$restProps.class}"
  class:hover:text-ctip-primary={!danger}
  class:hover:bg-ctip-selected={!danger}
  class:text-ctip-dangerThreat={danger}
  class:hover:bg-ctip-dangerBgThreat={danger}
  on:click
  on:keydown
  on:keyup
  on:keypress
>
  {#if icon}
    <svelte:component this={icon} />
  {/if}
  <span class:ml-2={!!icon}>
    <slot />
  </span>
</li>
