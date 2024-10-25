<script lang="ts">
  import {
    BookmarkFilled,
    Checkmark,
    Time,
    TrashCan,
    ViewFilled,
    ViewOffFilled,
    WarningAltFilled
  } from 'carbon-icons-svelte';
  import { page } from '$app/stores';

  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import threatsStore from '$stores/threats';
  import roleStore from '$stores/role';
  import { currentOrganization } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import ActionButton from './ActionButton.svelte';
  import IncidentModal from '$lib/components/IncidentModal.svelte';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import { Button, CodeSnippet, TooltipIcon } from 'carbon-components-svelte';
  import { MODULE_NAME } from '$lib/constants/modules';
  import Comments from '../Comments/Comments.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import { THREAT_USER_MODIFIED_TOOLTIP } from '$lib/constants/text';

  const client = new Client();

  let openIncidentsModal = false;
  let openDeleteConfirmation = false;
  let openDeleteResources = false;
  let openBlockAllConfirmation = false;
  let openIsBlockConfirmation = false;
  let showFollowUpBtn = false;
  let openCommentsModal = false;

  onMount(() => {
    showFollowUpBtn = checkIfShowFollowUpBtn();
    return () => {
      client.abort();
    };
  });

  function checkIfShowFollowUpBtn() {
    return (
      $currentModule.moduleName === MODULE_NAME.CUSTOM ||
      $currentModule.moduleName === MODULE_NAME.MOBILE_APPS ||
      $currentModule.moduleName === MODULE_NAME.DOMAIN_PROTECTION ||
      $currentModule.moduleName === MODULE_NAME.DARK_WEB ||
      (($currentModule.moduleName === MODULE_NAME.DATA_LEAKAGE ||
        $currentModule.moduleName === MODULE_NAME.HACKTIVISM) &&
        ($page.url.hostname === 'tcallzgroup.blueliv.com' || $page.url.hostname === 'tcpre-production.blueliv.com'))
    );
  }

  async function onMarkAsFav() {
    const isFavorite = $threatsStore.selectedForDetails.favorite === 'USER_STARRED';
    await client.threats.markAsFav(
      isFavorite,
      $threatsStore.selectedForDetails.resourceId,
      $currentOrganization.id,
      $currentModule.id,
      $currentModule?.moduleName
    );
    $threatsStore.selectedForDetails.favorite =
      $threatsStore.selectedForDetails.favorite === 'NOT_STARRED' ? 'USER_STARRED' : 'NOT_STARRED';
  }

  async function markAsReadOrUnread() {
    const isRead = !$threatsStore.selectedForDetails.read;
    await client.threats.markAsRead(
      [$threatsStore.selectedForDetails.resourceId],
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName,
      isRead
    );
    const tmp = $threatsStore.resources.map((resource: any) => {
      return {
        ...resource,
        ...($threatsStore.selectedRowIds.includes(resource.id) ? { read: isRead } : {})
      };
    });
    $threatsStore.resources = tmp;
    $threatsStore.selectedForDetails.read = isRead;
  }

  async function onFollowUp() {
    if (checkIfShowFollowUpBtn()) {
      try {
        await client.threats.onFollowUp(
          $currentOrganization.id,
          $currentModule.id,
          $threatsStore.selectedForDetails.resourceId
        );
        $threatsStore.selectedForDetails.followedUp = !$threatsStore.selectedForDetails.followedUp;
        notifications.notify({
          kind: 'success',
          title: 'Follow up for this resource has been updated'
        });
      } catch (error) {
        const kind = error.type === 'warning' ? 'warning' : 'error';
        notifications.notify({
          kind,
          title: error?.message || 'Error'
        });
      }
    }
  }

  function openDeleteResourceModal() {
    const moduleType = $threatsStore.selectedForDetails.moduleType.toUpperCase();
    if (moduleType.toUpperCase() === 'CREDENTIAL' || moduleType.startsWith('CREDIT_CARD')) {
      openDeleteConfirmation = true;
    } else {
      openDeleteResources = true;
    }
  }

  function onTemporalDelete() {
    openDeleteResources = false;
    openDeleteConfirmation = true;
  }

  function onBlockUrl() {
    openDeleteResources = false;
    openBlockAllConfirmation = true;
  }

  function onBlockDomain() {
    openDeleteResources = false;
    openIsBlockConfirmation = true;
  }

  async function onDeleteResources() {
    const selectedThreadIds = [$threatsStore.selectedForDetails.resourceId];
    await client.threats.deleteResources(
      selectedThreadIds,
      $currentOrganization.id,
      $currentModule.id,
      $currentModule.moduleName
    );
    openDeleteConfirmation = false;
    notifications.notify({
      kind: 'success',
      title: 'Resource was succesfully deleted'
    });
    await goto(`/dashboard/organizations/${$currentOrganization.id}/modules/${$currentModule.id}`);
  }

  async function onBlockUrls() {
    const item = $threatsStore.selectedForDetails;
    if (!item) return;
    const items = [{ url: item.originalUrl, resourcesId: item.resourceId }];
    await client.threats.blockUrls($currentOrganization.id, $currentModule.id, items);
    openBlockAllConfirmation = false;
    await goto(`/dashboard/organizations/${$currentOrganization.id}/modules/${$currentModule.id}`);
  }

  async function onBlockDomains() {
    const item = $threatsStore.selectedForDetails;
    if (!item) return;
    const data = {
      url: item.originalUrl,
      fullDomain: true
    };
    const id = item.resourceId;
    await client.threats.blockDomain(id, $currentOrganization.id, $currentModule.id, data);
    openIsBlockConfirmation = false;
    await goto(`/dashboard/organizations/${$currentOrganization.id}/modules/${$currentModule.id}`);
  }

  async function refreshIncident(hasIncident: boolean) {
    $threatsStore.selectedForDetails.hasIncident = hasIncident;
  }
</script>

<div class="border-t-[1px] border-b-[1px] border-ctip-border bg-ctip-ui border-solid mt-3 p-2 flex justify-between">
  <div class="flex items-center gap-2">
    {#if !$roleStore.trial && !$roleStore.customer}
      <ActionButton
        isActive={$threatsStore.selectedForDetails?.hasIncident}
        on:click={() => (openIncidentsModal = true)}
        text="Mark as incident"
        icon={WarningAltFilled}
      />
    {/if}
    {#if !$roleStore.customer}
      <ActionButton
        isActive={$threatsStore.selectedForDetails?.favorite === 'USER_STARRED'}
        on:click={onMarkAsFav}
        text="Mark as favorite"
        icon={BookmarkFilled}
      />
    {/if}
    <ActionButton
      isActive={$threatsStore.selectedForDetails?.read}
      on:click={markAsReadOrUnread}
      text={`Mark as ${$threatsStore.selectedForDetails?.read ? 'unread' : 'read'}`}
      icon={$threatsStore.selectedForDetails?.read ? ViewFilled : ViewOffFilled}
    />

    {#if !$roleStore.trial && !$roleStore.customer}
      <GenericButton on:click={openDeleteResourceModal} kind="danger-ghost">
        <span class="hidden lg:block"> Delete threat </span>
        <TooltipIcon class="lg:hidden" tooltipText="Delete threat" icon={TrashCan} />
      </GenericButton>
    {/if}

    {#if $threatsStore.selectedForDetails?.userModified}
      <div class="mt-1" data-test="user-modified">
        <TooltipIcon direction="top" tooltipText={THREAT_USER_MODIFIED_TOOLTIP} icon={Checkmark} />
      </div>
    {/if}
  </div>
  <div>
    {#if !$roleStore.customer && showFollowUpBtn}
      <ActionButton
        isActive={$threatsStore.selectedForDetails?.followedUp}
        on:click={onFollowUp}
        text="Follow up"
        icon={Time}
        showIconWithText
      />
    {/if}

    {#if !$roleStore.customer}
      <ActionButton
        on:click={() => (openCommentsModal = true)}
        text={`Comments · ${$threatsStore.comments.length || 0}`}
        showIconWithText
      />
    {/if}
  </div>
</div>

<IncidentModal
  bind:open={openIncidentsModal}
  resources={[$threatsStore.selectedForDetails]}
  on:save={() => refreshIncident(true)}
  on:deleteAll={() => refreshIncident(false)}
/>

<WarningModal
  bind:open={openDeleteConfirmation}
  modalHeading="Remove resource"
  question="Are you sure you want to remove the selected resource?"
  secondMessage="This action cannot be undone."
  on:submit={onDeleteResources}
  on:closeModal={() => (openDeleteConfirmation = false)}
/>

<CommonModal
  bind:open={openDeleteResources}
  passiveModal
  size="xs"
  modalHeading="Choose an option"
  primaryButtonText="Yes"
  secondaryButtonText="No"
  class="delete"
  on:submit={onDeleteResources}
  on:closeModal={() => (openDeleteResources = false)}
>
  <div class="flex flex-col items-center justify-evenly">
    <CodeSnippet code={$threatsStore.selectedForDetails?.originalUrl} />
    <div class="flex justify-around mt-3">
      <Button kind="ghost" on:click={onTemporalDelete}>Temporal Delete</Button>
      <Button kind="ghost" on:click={onBlockUrl}>Block Url/subUrls</Button>
      <Button kind="ghost" on:click={onBlockDomain}>Block entire Domain</Button>
    </div>
  </div>
</CommonModal>

<WarningModal
  bind:open={openBlockAllConfirmation}
  modalHeading="Block domain / domains"
  question="Are you sure you want to block the selected domain / domains and its sub urls?"
  secondMessage="This action cannot be undone."
  on:submit={onBlockUrls}
  on:closeModal={() => (openBlockAllConfirmation = false)}
/>

<WarningModal
  bind:open={openIsBlockConfirmation}
  modalHeading="Block domain / domains"
  question="Are you sure you want to block the selected domain?"
  secondMessage="This action cannot be undone."
  on:submit={onBlockDomains}
  on:closeModal={() => (openIsBlockConfirmation = false)}
/>

<Comments {openCommentsModal} on:closeModal={() => (openCommentsModal = false)} />

<style>
  :global(.modal-external-link .bx--modal-container--xs) {
    width: 46%;
  }
</style>
