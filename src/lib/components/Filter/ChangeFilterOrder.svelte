<script lang="ts">
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { createEventDispatcher, type SvelteComponent } from 'svelte';
  // import type { SettingsType } from '$lib/types/settings';

  const dispatch = createEventDispatcher();

  export let open = false;
  // export let selectedItem: SettingsType = undefined;
  export let selectedItem: any = undefined;
  export let totalResources = 0;
  export let primaryButtonIcon: typeof SvelteComponent = null;

  let filterOrder = undefined;
  let primaryButtonDisabled = false;

  $: primaryButtonDisabled =
    filterOrder === undefined ||
    filterOrder === '' ||
    isNaN(filterOrder) ||
    filterOrder < 1 ||
    filterOrder > totalResources;

  async function onSubmit() {
    if (primaryButtonDisabled) return;

    dispatch('onMove', { from: selectedItem.order, to: filterOrder });
  }

  function validateOrderInput(node, value) {
    return {
      update(value) {
        filterOrder = value === null || filterOrder < node.min ? '' : parseInt(value);
        filterOrder = filterOrder > totalResources ? totalResources : parseInt(filterOrder);
      }
    };
  }
</script>

<CommonModal
  bind:open
  modalHeading="Change filter order"
  primaryButtonText="Accept"
  secondaryButtonText="Cancel"
  passiveModal={false}
  {primaryButtonDisabled}
  {primaryButtonIcon}
  size="sm"
  on:submit={onSubmit}
  on:closeModal
>
  <div class="h-32">
    <div class="flex justify-between items-center mb-2">
      <span class="w-44">Filter name:</span>
      <span class="font-bold w-100">{selectedItem.name}</span>
    </div>
    <div class="flex justify-between items-center mb-2">
      <span class="w-44">Current position:</span>
      <span class="font-bold w-100">{selectedItem.order}</span>
    </div>
    <div class="flex items-center mb-2">
      <span class="w-32">Move to: (1 - {totalResources})</span>
      <input
        use:validateOrderInput={filterOrder}
        bind:value={filterOrder}
        min={1}
        max={totalResources}
        type="number"
        name="new-filter-order"
        class="w-auto"
      />
    </div>
  </div>
</CommonModal>
