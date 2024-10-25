<script lang="ts">
  import { DataTable } from 'carbon-components-svelte';
  import threatsStore from '$stores/threats';
  import { currentModule } from '$stores/module';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { truncate } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import { currentOrganization } from '$stores/organization';
  import { getHumanReadableDate } from '$lib/utils/functions';

  const client = new Client();
  const pageSize = 10;

  let page = 1;

  $: numPages = Math.ceil(rows.length / pageSize);
  $: rows =
    $threatsStore?.selectedForDetails?.history?.map((history, index) => ({
      ...history,
      id: index
    })) ?? [];

  async function getHistoryVersion(version: number) {
    const p = window.open('');
    p.document.write('<div id="loading-state">Loading...</div>');
    const { data } = await client.threats.getHistoryVersion(
      $currentOrganization.id,
      $currentModule.id,
      $threatsStore.selectedForDetails.resourceId,
      version
    );
    const url = `/organization/${$currentOrganization.id}/module/${$currentModule.id}/resource/${$threatsStore.selectedForDetails.resourceId}/version/${version}`;
    p.document.getElementById('loading-state').style.display = 'none';
    p.document.write(data);
    p.history.pushState(null, 'Blueliv', url);
  }
</script>

<DataTable
  {rows}
  {pageSize}
  {page}
  headers={[
    { key: 'version', value: 'Version', width: '33.33%' },
    { key: 'timestamp', value: 'Date', width: '33.33%', display: getHumanReadableDate },
    { key: 'file', value: 'File', width: '33.33%' }
  ]}
>
  <svelte:fragment slot="cell" let:cell let:row>
    {#if cell.key === 'file'}
      <span class="flex text-center justify-center">
        <p
          class="flex items-center mb-0 hover:text-ctip-primary cursor-pointer"
          on:click={() => getHistoryVersion(row.version)}
        >
          <span use:truncate>{$currentModule?.moduleName !== MODULE_NAME.DARK_WEB ? row.file : row.version}</span>
        </p>
      </span>
    {:else}
      <span class="flex text-center justify-center">
        {cell.display ? cell.display(cell.value) : cell.value}
      </span>
    {/if}
  </svelte:fragment>
</DataTable>
<div class="flex items-center">
  <ResponsivePageNavigation bind:page total={numPages} />
</div>
