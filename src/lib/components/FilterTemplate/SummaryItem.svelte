<script lang="ts">
  import { TooltipIcon } from 'carbon-components-svelte';
  import { ChevronLeft, Code } from 'carbon-icons-svelte';

  export let title: string;
  export let inversed = false;
  export let icon: typeof import('svelte').SvelteComponent<any> = Code;
</script>

<div class="flex items-center justify-between">
  <div class="flex items-center justify-between gap-3">
    <div class="flex items-center p-2 text-white bg-ctip-primary">
      <svelte:component this={icon} />
    </div>
    <div class="text-xs font-bold">
      {title}
    </div>
    {#if inversed}
      <TooltipIcon
        --cds-icon-02="var(--ctip-primary)"
        class="text-ctip-primary"
        icon={ChevronLeft}
        tooltipText="Inverse search"
      />
    {/if}
  </div>

  <div class="ml-10">
    <slot />
  </div>
</div>
