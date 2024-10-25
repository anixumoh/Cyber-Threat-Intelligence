<script lang="ts">
  import {
    FormGroup,
    RadioButton,
    RadioButtonGroup,
    Select,
    SelectItem,
    SelectSkeleton
  } from 'carbon-components-svelte';
  import Client from '$lib/client';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { currentModuleId, moduleCacheStore } from '$stores/module';
  import notifications from '$stores/notification';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { currentOrganizationId, organizationsStore } from '$stores/organization';
  import threatsStore from '$stores/threats';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher<{ setMoveResources: void }>();
  const client = new Client();

  export let open = false;

  const actions = [
    { labelText: 'Move', value: '0' },
    { labelText: 'Copy', value: '1' }
  ];

  let modules = [];
  let selectedActionValue = actions[0].value;
  let selectedOrgId = $currentOrganizationId;
  let selectedModuleId: number;
  let loadModules = false;

  $: browser && open && getModulesStandalone(selectedOrgId);

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function getModulesStandalone(orgId: number) {
    loadModules = true;
    if (!$moduleCacheStore[orgId]) {
      await moduleCacheStore.fetchModules(orgId);
    } else {
      await tick();
    }
    loadModules = false;
    modules = $moduleCacheStore[orgId];
    selectedModuleId = (modules.length && modules[0].id) || null;
  }

  async function onSubmit() {
    const copy = selectedActionValue === '1';
    const ids = $threatsStore.selectedRowIds.map((id) => `${$currentOrganizationId}_${$currentModuleId}_${id}`);
    try {
      const dataSend = {
        ids,
        copy,
        destinationOrgId: selectedOrgId,
        destinationModuleId: selectedModuleId
      };
      const { data } = await client.threats.moveResource($currentOrganizationId, $currentModuleId, dataSend);
      setResponseCodes(data, copy);
      dispatch('setMoveResources');
    } catch (error) {
      notifications.notify({
        title: `The resources could not be ${copy ? 'copied' : 'moved'}`
      });
    }
  }

  function setResponseCodes({ itemResults }: any, isCopy: boolean) {
    if (itemResults instanceof Array && itemResults.length) {
      for (const i of itemResults) {
        switch (i['resultCode']) {
          case 0:
            notifications.notify({
              kind: 'success',
              title: `The resources were successfully ${isCopy ? 'copied' : 'moved'}`
            });
            break;
          case -1:
            notifications.notify({
              title: 'Unexpected error'
            });
            break;
          case -2:
            notifications.notify({
              kind: 'warning',
              title: 'One or more items already exist in destination'
            });
            break;
          case -3:
            notifications.notify({
              title: 'Error while copying'
            });
            break;
          case -4:
            notifications.notify({
              kind: 'warning',
              title: 'One or more items cannot be moved, they are part of an incident'
            });
            break;
          case -5:
            notifications.notify({
              kind: 'warning',
              title: 'One or more items cannot be moved, the destination is not suitable'
            });
            break;
          case -6:
            notifications.notify({
              kind: 'warning',
              title: 'One or more items cannot be moved, insufficient permissions'
            });
            break;
          default:
            break;
        }
      }
    }
  }
</script>

<CommonModal
  bind:open
  modalHeading="Choose Destination Module"
  primaryButtonText="Accept"
  secondaryButtonText="Cancel"
  primaryButtonDisabled={!selectedOrgId || !selectedModuleId}
  on:submit={onSubmit}
>
  <FormGroup class="mb-3">
    <RadioButtonGroup bind:selected={selectedActionValue}>
      {#each actions as { labelText, value }}
        <RadioButton {labelText} {value} />
      {/each}
    </RadioButtonGroup>
  </FormGroup>
  <FormGroup class="mb-3">
    <Select labelText="Organization" bind:selected={selectedOrgId}>
      {#each $organizationsStore as { id, name }}
        <SelectItem value={id} text={name} />
      {/each}
    </Select>
  </FormGroup>
  <FormGroup class="mb-3">
    {#if loadModules}
      <SelectSkeleton />
    {:else}
      <Select labelText="Modules" bind:selected={selectedModuleId}>
        {#each modules as { id, name }}
          <SelectItem value={id} text={name} />
        {/each}
      </Select>
    {/if}
  </FormGroup>
</CommonModal>
