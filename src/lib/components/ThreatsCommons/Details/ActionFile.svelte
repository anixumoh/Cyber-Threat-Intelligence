<script lang="ts">
  import Client from '$lib/client';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import { InlineLoading } from 'carbon-components-svelte';
  import { Document, Download } from 'carbon-icons-svelte';
  import ViewDetailsItem from '../ViewDetailsItem.svelte';

  export let title = 'file';
  export let tooltipText = '';

  const client = new Client();

  let isDownloading = false;

  async function downloadFile() {
    isDownloading = true;
    await client.threats.downloadFileDetails(
      $currentOrganization.id,
      $currentModule.id,
      $currentModule?.moduleName,
      $threatsStore.selectedForDetails.resourceId,
      $threatsStore.selectedForDetails.contentType
    );
    isDownloading = false;
  }
</script>

<ViewDetailsItem {title} icon={Document} action {tooltipText}>
  <svelte:fragment slot="action">
    <div class="flex items-center">
      {#if isDownloading}
        <InlineLoading />
      {:else}
        <GenericButton on:click={downloadFile} iconDescription="Download file"><Download /></GenericButton>
      {/if}
      <span>{$threatsStore.selectedForDetails.file}</span>
    </div>
  </svelte:fragment>
</ViewDetailsItem>
