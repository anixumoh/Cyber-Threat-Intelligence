<script lang="ts">
  import { Button, Popover } from 'carbon-components-svelte';
  import { OverflowMenuVertical, TagGroup, TrashCan } from 'carbon-icons-svelte';
  import clickOutside from '$lib/actions/clickOutside';
  import roleStore from '$stores/role';
  import Client from '$lib/client';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import type { IncidentStatusType } from '$lib/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import notifications from '$stores/notification';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import ResourceLabelModal from '$lib/components/ResourceLabelModal.svelte';
  import axios from 'axios';
  import modalTeleport from '$lib/actions/modalTeleport';

  const client = new Client();
  const dispatch = createEventDispatcher();

  export let selectedRowIds = [];
  export let rows = [];

  let selectedItems = [];
  let open = false;
  let openDeleteConfirmation = false;
  let openLabelsModal = false;

  $: disableOpen = selectedRowIds && checkItemHasSameStatus('OPEN');
  $: disableNotified = selectedRowIds && checkItemHasSameStatus('NOTIFIED');
  $: disableClosed = selectedRowIds && checkItemHasSameStatus('CLOSED');

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  function getCheckedItems() {
    return rows
      .filter((resource: any) => selectedRowIds.includes(resource.id))
      .map((resource) => ({ ...resource, resourceId: resource.id }));
  }

  function checkItemHasSameStatus(status: IncidentStatusType) {
    const itemsChecked = getCheckedItems();
    return itemsChecked.every((item) => item?.status === status || (item?.status === 'NOTIFIED' && status === 'OPEN'));
  }

  function validateItemBeforeSend(item: any, status: IncidentStatusType) {
    let validationMsg = '';
    if (item.status === status) {
      validationMsg = `At least one of selected Incidents is already marked as ${status}.`;
    } else if (item.status === 'NOTIFIED' && status === 'OPEN') {
      validationMsg = `At least one of selected incidents has been NOTIFIED and can't be set as ${status}.`;
    }
    return validationMsg;
  }

  async function changeStatus(status: IncidentStatusType) {
    if (checkItemHasSameStatus(status)) {
      return;
    }
    const requests$ = [];
    for (const item of rows) {
      if (selectedRowIds.includes(item.id)) {
        const invalidMsg = validateItemBeforeSend(item, status);
        if (invalidMsg) {
          notifications.notify({
            title: 'Error',
            subtitle: invalidMsg
          });
        }
        const body = new FormData();
        body.append('file', null);
        const request$ = await client.incidents.changeStatus(
          $currentOrganization.id,
          $currentModule.id,
          item.id,
          status,
          body
        );
        requests$.push(request$);
      }
    }
    try {
      if (requests$.length) {
        await axios.all(requests$);
        dispatch('reload');
      }
    } catch (error) {
      const msg =
        error.status === 400
          ? 'Incidents previously notified, must add new changes before set them as NOTIFIED.'
          : 'Something went wrong while trying to change incident status';
      notifications.notify({
        title: 'Error',
        subtitle: msg
      });
    }
  }

  function openLabelModal() {
    selectedItems = getCheckedItems();
    openLabelsModal = true;
  }

  function onLabelSave(event) {
    openLabelsModal = true;
    dispatch('reload');
  }

  async function deleteSelectedIncidents() {
    const requests$ = [];
    for (const item of rows) {
      if (selectedRowIds.includes(item.id)) {
        const request$ = await client.incidents.destroy($currentOrganization.id, $currentModule.id, item.id);
        requests$.push(request$);
      }
    }
    try {
      if (requests$.length) {
        await axios.all(requests$);
        openDeleteConfirmation = false;
        dispatch('reload');
      }
    } catch (error) {
      notifications.notify({
        title: 'Error',
        subtitle: 'Something went wrong while trying to remove incidents'
      });
    }
  }
</script>

<div class="btn-group" data-outline use:clickOutside on:clickOutside={() => (open = false)}>
  <Button
    kind="ghost"
    tooltipPosition="right"
    tooltipAlignment="end"
    iconDescription="Actions"
    icon={OverflowMenuVertical}
    on:click={() => (open = !open)}
    disabled={!selectedRowIds.length}
  />
  <Popover {open} align="right-top">
    <ul>
      {#if !$roleStore.customer}
        <li
          class:cursor-none={disableOpen}
          class:opacity-40={disableOpen}
          class="flex items-center text-left border-0 px-2 py-2 cursor-pointer"
          on:click={() => changeStatus('OPEN')}
        >
          <div class="flex">
            <div class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-successThreat" />
            <span class="ml-2 text-ctip-successThreat">Mark Open</span>
          </div>
        </li>
        <li
          class:cursor-none={disableNotified}
          class:opacity-40={disableNotified}
          class="flex items-center text-left border-0 px-2 py-2 cursor-pointer"
          on:click={() => changeStatus('NOTIFIED')}
        >
          <div class="flex">
            <div class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-primary" />
            <span class="ml-2 text-ctip-primary">Mark Notified</span>
          </div>
        </li>
        <li
          class:cursor-none={disableClosed}
          class:opacity-40={disableClosed}
          class="flex items-center text-left border-0 px-2 py-2 cursor-pointer"
          on:click={() => changeStatus('CLOSED')}
        >
          <div class="flex">
            <div class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em] bg-ctip-dangerThreat" />
            <span class="ml-2 text-ctip-dangerThreat">Mark Closed</span>
          </div>
        </li>
        <li class="flex items-center text-left border-0 px-2 py-2 cursor-pointer" on:click={openLabelModal}>
          <TagGroup /> <span class="ml-2">Labels</span>
        </li>
        <li
          class="flex items-center text-left border-0 px-2 py-2 cursor-pointer trash"
          on:click={() => (openDeleteConfirmation = true)}
        >
          <TrashCan /> <span class="ml-2">Delete</span>
        </li>
      {/if}
    </ul>
  </Popover>
</div>

<div use:modalTeleport>
  <WarningModal
    bind:open={openDeleteConfirmation}
    modalHeading="Remove incident / incidents"
    question="Are you sure you want to delete the selected incident / incidents?"
    secondMessage="This action cannot be undone."
    on:submit={deleteSelectedIncidents}
    on:closeModal={() => (openDeleteConfirmation = false)}
  />

  <ResourceLabelModal bind:open={openLabelsModal} resources={selectedItems} on:save={onLabelSave} isIncident />
</div>

<style>
  :global(.popover-child) {
    left: 140px;
  }

  .trash {
    color: var(--ctip-dangerThreat);
  }

  .trash:hover {
    background-color: var(--ctip-dangerBgThreat);
  }
</style>
