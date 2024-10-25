<script lang="ts">
  import { Download } from 'carbon-icons-svelte';
  import ExtraDataSection from './ExtraDataSection.svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import { MODULE_NAME } from '$lib/constants/modules';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import Client from '$lib/client';
  import { page } from '$app/stores';

  const client = new Client();

  export let headerData = [];
  export let isMain = true;

  async function downloadPCAP() {
    const { resourceId } = $page.params;
    const { data } = await client.threats.downloadPCAP($currentOrganization.id, $currentModule.id, resourceId);
    open(data.url, '_blank');
  }
</script>

<div class="flex my-3">
  {#each headerData as header}
    <div class="w-full">
      <ExtraDataSection headerData={header} />
    </div>
  {/each}
</div>
{#if $currentModule?.moduleName === MODULE_NAME.MALWARE && isMain}
  <div class="my-3 px-3 flex justify-end">
    <GenericButton kind="primary" iconDescription="Delete" on:click={downloadPCAP} class="mr-1">
      <Download />
      <span class="ml-1">Download PCAP</span>
    </GenericButton>
  </div>
{/if}
