<script lang="ts">
  import InfoCard from '$lib/components/Card/InfoCard.svelte';
  import threatsStore from '$stores/threats';

  $: metadataKey = Object.keys($threatsStore.selectedForDetails?.metadata);
  $: metadataValue = (Object as any).values($threatsStore.selectedForDetails?.metadata);
</script>

<InfoCard title="Metadata" class="mt-3">
  {#each metadataKey as key, i}
    <ul>
      <li class="flex justify-between items-center">
        <b class="text-ctip-dark mb-0">{key}</b>
        <span class="text-ctip-secondary">{metadataValue[i]}</span>
      </li>
    </ul>
  {/each}
</InfoCard>
