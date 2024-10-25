<script lang="ts">
  import { InlineLoading, Modal } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import { currentModuleId } from '$stores/module';
  import { createEventDispatcher } from 'svelte';
  import { currentOrganizationId } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import type { InformType } from '$lib/types';
  import { Save } from 'carbon-icons-svelte';
  import ItemStatus from '../Inform/ItemStatus.svelte';

  const client = new Client();
  const dispatch = createEventDispatcher<{ save: void }>();

  export let open = false;
  export let selectedThreadIds: number[];

  const options: InformType[] = ['NOT_IMPORTANT', 'POSITIVE', 'INFORMATIVE', 'NEGATIVE'];

  let saving = false;
  let status: InformType;

  async function changeRelevance() {
    saving = true;
    try {
      await client.threats.updateStatusMultiple(selectedThreadIds, $currentOrganizationId, $currentModuleId, status);

      $threatsStore.resources = $threatsStore.resources.map((resource: any) => {
        return {
          ...resource,
          ...($threatsStore.selectedRowIds.includes(resource.id) ? { inform: status } : {})
        };
      });
      $threatsStore?.selectedForDetails?.analysisCalcResult &&
        ($threatsStore.selectedForDetails.analysisCalcResult = status);
      open = false;
      dispatch('save');
    } finally {
      saving = false;
    }
  }
</script>

<Modal
  size="xs"
  bind:open
  on:open={() => (status = undefined)}
  modalHeading="Change Relevance"
  secondaryButtonText="Cancel"
  primaryButtonText="Change"
  primaryButtonDisabled={saving || !status}
  primaryButtonIcon={saving ? InlineLoading : Save}
  on:click:button--secondary={() => (open = false)}
  on:submit={changeRelevance}
>
  <div>
    {#each options as option, i}
      <div class="w-full" class:bg-gray-300={status === option}>
        <ItemStatus index={i} on:click={() => (status = option)} text={option} status={option} />
      </div>
    {/each}
  </div>
</Modal>
