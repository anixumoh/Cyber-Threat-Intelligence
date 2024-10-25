<script lang="ts">
  import Client from '$lib/client';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import { InlineLoading } from 'carbon-components-svelte';
  import { StarFilled } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  export let title = 'rating';
  export let tooltipText = '';

  const client = new Client();

  let sendDataRating = false;

  async function onUpdateStars(rating: number, resourceId: number, moduleId: number, moduleType: string) {
    sendDataRating = true;
    await client.threats.updateStars(
      rating,
      resourceId,
      $currentOrganization.id,
      moduleId || $currentModule.id,
      moduleType || $currentModule?.moduleName
    );
    $threatsStore.selectedForDetails.rating = rating;
    $threatsStore.resources = $threatsStore.resources.map((resource) => {
      return {
        ...resource,
        ...(resource.resourceId === resourceId ? { rating } : {})
      };
    });
    sendDataRating = false;
  }
</script>

<ViewDetailsItem {title} value={$threatsStore.selectedForDetails.title} icon={StarFilled} action {tooltipText}>
  <svelte:fragment slot="action">
    {#if sendDataRating}
      <InlineLoading />
    {:else}
      <StarRating
        resourceId={$threatsStore.selectedForDetails.resourceId}
        rating={$threatsStore.selectedForDetails.rating}
        on:setRating={(event) =>
          onUpdateStars(
            event.detail.rating,
            event.detail.resourceId,
            $threatsStore.selectedForDetails.moduleId,
            $threatsStore.selectedForDetails.moduleType
          )}
      />
    {/if}
  </svelte:fragment>
</ViewDetailsItem>
