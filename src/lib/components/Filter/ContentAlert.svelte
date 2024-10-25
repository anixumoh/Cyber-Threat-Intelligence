<script lang="ts">
  import type Module from '$lib/types/module';
  import contentAlertStore from '$stores/contentAlert';
  import { Checkbox, InlineNotification, TooltipIcon } from 'carbon-components-svelte';
  import { Information } from 'carbon-icons-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import { ContentAlertValues } from '../FilterTemplate/constants';

  export let alertContentFields = [];
  export let disabled = false;
  export let module: Module = undefined;

  const dispatch = createEventDispatcher();

  onMount(() => {
    if (module) {
      if (alertContentFields.length) {
        contentAlertStore.updateFromEditContentAlerts(module?.type, alertContentFields);
      } else {
        contentAlertStore.updateFromNewContentAlerts(module?.type);
      }
      contentAlertStore.updateSelected(module?.type);
    }
  });

  function onChangeMarks() {
    alertContentFields = alertContentFields?.map?.((item) => ({
      ...item,
      enable: $contentAlertStore.selected.includes(item.name)
    }));
    dispatch('update-form');
  }
</script>

<div class="w-full mt-4 border border-gray-200 border-solid">
  <div class="flex justify-between p-2 border-b border-gray-200 border-solid">
    <div class="flex items-center">
      <span class="mr-2">Content Alert Email</span>
      <TooltipIcon class="my-tooltip" tooltipText="The content of the alerts in the emails." icon={Information} />
    </div>
  </div>
  <div class="w-full">
    {#if $contentAlertStore.sendAlert}
      <div class="m-3 grid grid-cols-2 {disabled ? 'opacity-80 pointer-events-none' : ''}">
        {#each $contentAlertStore.response[module.type] as { name }}
          <Checkbox
            bind:group={$contentAlertStore.selected}
            labelText={ContentAlertValues[name]}
            value={name}
            on:change={onChangeMarks}
          />
        {/each}
      </div>
    {:else}
      <InlineNotification
        hideCloseButton
        kind="error"
        subtitle="No Content Alert have been configured yet"
        class="max-w-full"
      />
    {/if}
  </div>
</div>
