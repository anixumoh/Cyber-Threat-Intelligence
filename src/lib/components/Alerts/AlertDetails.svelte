<script lang="ts">
  import { ChevronLeft, Code, Filter } from 'carbon-icons-svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import InfoCard from '../Card/InfoCard.svelte';
  import Drawer from '../Drawer/Drawer.svelte';
  import { createEventDispatcher } from 'svelte';
  import ViewDetailsItem from '../ThreatsCommons/ViewDetailsItem.svelte';
  import { COLORS } from '$lib/constants/colors';
  import GenericTag from '../GenericTag/GenericTag.svelte';

  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let alert = undefined;

  let analysisResultArray = [
    { name: 'Not Available', key: 0, selected: false, disabled: false },
    { name: 'Important', key: 6, selected: true, disabled: false },
    { name: 'Positive', key: 3, selected: true, disabled: false },
    { name: 'Negative', key: 4, selected: true, disabled: false },
    { name: 'Informative', key: 5, selected: true, disabled: false },
    { name: 'Not Important', key: 1, selected: false, disabled: false },
    { name: 'Not Processable', key: 2, selected: false, disabled: false }
  ];

  function onBackToList() {
    dispatch('backToList');
  }
</script>

<Drawer {isOpen} hasDefaultHeader={false} on:clickAway maxScreenSize="max-w-xl">
  <svelte:fragment slot="custom-header">
    <div
      class="border-[1px] border-ctip-border bg-ctip-ui border-solid flex justify-between items-center w-full h-14 px-3"
    >
      <div class="flex items-center">
        <div class="flex items-center justify-center rounded-md w-9 h-9 text-ctip-white bg-ctip-primary">
          <Filter class="w-4 h-4" />
        </div>
        <div class="ml-2 text-sm">
          <span>Alert Details</span>
          <span class="mx-1">|</span>
          <small class="text-ctip-secondary">SHOW</small>
        </div>
      </div>
      <div>
        <GenericButton kind="primary" on:click={onBackToList}>
          <ChevronLeft class="mr-2" />
          Back to list
        </GenericButton>
      </div>
    </div>
  </svelte:fragment>
  <div class="px-3" id="details-filter">
    <div class="mt-3 p-2 border-[1px] border-ctip-border border-solid flex justify-between flex-col w-full rounded-md">
      <h6 class="mt-2 mb-1 font-bold uppercase text-ctip-secondary">Name</h6>
      <p class="mb-0 text-ctip-dark">{alert?.filterName || '-'}</p>
      <hr class="w-100 mt-2 border-[2px] border-solid bg-ctip-primary" />
    </div>
    <InfoCard title="Filter Conditions" class="mt-3">
      <div class="flex flex-col w-full">
        <div class="py-2 mx-2">
          <ViewDetailsItem title="analysis status" icon={Code} action class="w-7 h-7">
            <svelte:fragment slot="action">
              <div class="flex flex-wrap justify-end">
                {#each analysisResultArray as result}
                  {#if result.selected}
                    <GenericTag label={result.name} background={COLORS.gray} />
                  {/if}
                {/each}
              </div>
            </svelte:fragment>
          </ViewDetailsItem>
        </div>
      </div>
    </InfoCard>
  </div>
</Drawer>
