<script lang="ts">
  import TcxLinkeable from '$lib/components/TcxLinkeable/TcxLinkeable.svelte';
  import threatsStore from '$stores/threats';
  import { TextLink } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  export let tooltipText = '';
</script>

<ViewDetailsItem title="sources" icon={TextLink} action {tooltipText}>
  <svelte:fragment slot="action">
    {#if $threatsStore.selectedForDetails.sources.length}
      <div class="flex flex-col justify-end">
        {#each $threatsStore.selectedForDetails.sources as source}
          <div class="flex items-center">
            <div class="rounded-full bg-ctip-black w-[10px] h-[10px] mr-1" />
            <TcxLinkeable value={source} checkForActors isCreditCard />
          </div>
        {/each}
      </div>
    {/if}
  </svelte:fragment>
</ViewDetailsItem>
