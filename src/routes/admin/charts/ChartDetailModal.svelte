<script lang="ts">
  import type { ChartDataGen, ChartListItem } from '$lib/types/admin';
  import { Modal } from 'carbon-components-svelte';

  export let open = false;
  export let selectedChart: ChartListItem;
  export let datagen: ChartDataGen[];

  $: graphicDataGen = datagen?.find((dg) => dg.id === selectedChart?.graphicDataGenId);
  $: graphicStyle = graphicDataGen?.styleCompatibilities?.find((st) => st.id === selectedChart?.graphicStyleId);
</script>

<Modal
  size="sm"
  modalHeading="Graph Detail"
  bind:open
  primaryButtonText="Close"
  on:click:button--primary={() => (open = false)}
>
  {#if selectedChart}
    <div class="px-8">
      <div class="p-2.5 bg-ctip-hover-ui">Basic Info</div>

      <div class="border">
        <div class="flex justify-between items-center border p-2.5">
          <div>TITLE</div>
          <div>{selectedChart.title}</div>
        </div>

        <div class="flex justify-between items-center border p-2.5">
          <div>IS PRIVATE</div>
          <div>{selectedChart.isPrivate}</div>
        </div>

        <div class="flex justify-between items-center border p-2.5">
          <div>COMPLETE</div>
          <div>{selectedChart.complete}</div>
        </div>
      </div>
    </div>

    <div class="px-8 mt-4">
      <div class="p-2.5 bg-ctip-hover-ui">Extended Info</div>

      <div class="border">
        {#if selectedChart.organizationName}
          <div class="flex justify-between items-center border p-2.5">
            <div>ORGANIZATION NAME</div>
            <div>{selectedChart.organizationName}</div>
          </div>
        {/if}

        {#if selectedChart.moduleName}
          <div class="flex justify-between items-center border p-2.5">
            <div>MODULE NAME</div>
            <div>{selectedChart.moduleName}</div>
          </div>
        {/if}

        {#if graphicDataGen}
          <div class="flex justify-between items-center border p-2.5">
            <div>DATA GENERATOR</div>
            <div>{graphicDataGen.name}</div>
          </div>
        {/if}

        {#if graphicStyle}
          <div class="flex justify-between items-center border p-2.5">
            <div>STYLE GENERATOR</div>
            <div>{graphicStyle.name}</div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</Modal>
