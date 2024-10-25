<script lang="ts">
  import Inform from '$lib/components/Inform/Inform.svelte';
  import threatsStore from '$stores/threats';
  import { InlineLoading } from 'carbon-components-svelte';
  import { Warning } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  export let title = 'status';
  export let tooltipText = '';

  let sendDataInform = false;

  async function onUpdateInform(event) {
    sendDataInform = true;
    const { status, resourceId } = event.detail;
    $threatsStore.selectedForDetails.analysisCalcResult = status;
    $threatsStore.resources = $threatsStore.resources.map((resource) => {
      return {
        ...resource,
        ...(resource.resourceId === resourceId ? { inform: status } : {})
      };
    });
    sendDataInform = false;
  }
</script>

<ViewDetailsItem {title} icon={Warning} action {tooltipText}>
  <svelte:fragment slot="action">
    {#if sendDataInform}
      <InlineLoading />
    {:else}
      <Inform
        align="left"
        resource={$threatsStore.selectedForDetails}
        status={$threatsStore.selectedForDetails.analysisCalcResult}
        isButton
        on:setStatus={(event) => onUpdateInform(event)}
      />
    {/if}
  </svelte:fragment>
</ViewDetailsItem>
