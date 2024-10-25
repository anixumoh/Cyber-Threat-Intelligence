<script lang="ts">
  import { Close } from 'carbon-icons-svelte';
  import threatsStore from '$stores/threats';
  import { SkeletonText } from 'carbon-components-svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import Client from '$lib/client';
  import { onMount } from 'svelte';
  import { headerPreviewThreats } from '$lib/utils/headersDetailsThreats';
  import ExtraDataSection from './Details/ExtraDataSection.svelte';

  const client = new Client();

  onMount(() => {
    return () => {
      client.abort();
    };
  });
</script>

<div class="flex items-center justify-between header">
  <span class="ml-2 font-bold">DETAILS</span>
  <GenericButton kind="ghost" on:click={() => ($threatsStore.isOpenDetails = false)} class="al">
    <Close />
  </GenericButton>
</div>
<div>
  {#if $threatsStore.isLoadingDetails}
    <SkeletonText paragraph lines={35} />
  {:else}
    <ExtraDataSection headerData={headerPreviewThreats[$threatsStore.selectedForDetails.moduleType]} />
  {/if}
</div>

<style>
  :global(.light) .header {
    background-color: var(--ctip-grayMiddle);
  }
  .header {
    height: var(--cds-spacing-09, 3rem);
    border-bottom: 2px solid var(--ctip-primary);
  }
</style>
