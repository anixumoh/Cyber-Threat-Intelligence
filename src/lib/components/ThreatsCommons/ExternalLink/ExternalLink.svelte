<script lang="ts">
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import { COLORS } from '$lib/constants/colors';
  import externalLinkStore from '$stores/externalLink';
  import { Button } from 'carbon-components-svelte';
  import { Launch } from 'carbon-icons-svelte';

  const { black } = COLORS;

  export let tooltipText = '';
  export let text = '';
  export let onlyText = false;
  export let width = undefined;
</script>

{#if onlyText}
  <Button
    class={width}
    size="small"
    kind="ghost"
    title={tooltipText}
    href={tooltipText}
    on:click={externalLinkStore.handleClick}
  >
    <div class="flex items-center h-full w-full">
      <div class="whitespace-nowrap overflow-hidden text-ellipsis">
        {text ? text : tooltipText}
      </div>
    </div>
  </Button>
{:else}
  <TooltipWithIcon {tooltipText} icon={Launch} color={black} on:click={() => externalLinkStore.set(tooltipText)} />
{/if}
