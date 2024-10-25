<script lang="ts">
  import type { Incident, IncidentNotification, IncidentResource } from '$lib/client/services/incidents';
  import type { DataTableHeader, DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import {
    Button,
    CopyButton,
    DataTable,
    FileUploaderButton,
    InlineLoading,
    InlineNotification,
    Modal
  } from 'carbon-components-svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule, currentModuleId } from '$stores/module';
  import { Download, Folder, FolderOpen, Maximize, TrashCan } from 'carbon-icons-svelte';
  import Client from '$lib/client';
  import { createEventDispatcher } from 'svelte';
  import * as FileSaver from 'file-saver';
  import ActivityItem from './ActivityItem.svelte';
  import { checkUrl, resourceUrl } from './utils';
  import roleStore from '$stores/role';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';

  export let incident: Incident;

  const dispatch = createEventDispatcher();
  const client = new Client();
  let deletingResourceIds: number[] = [];
  let markingResourceIds: number[] = [];
  let deletingAttachmentNotificationIds: number[] = [];
  let loadingAttachmentNotificationIds: number[] = [];
  let selectedNotification: IncidentNotification;
  let attachToNotificationModalOpen = false;
  let viewAttachmentModalOpen = false;
  let files: File[];
  let attachmentImage: string;
  let isAddingAttachment = false;

  const headers: DataTableHeader[] = [
    { key: 'title', value: 'TITLE' },
    { key: 'url', value: 'URL' },
    { key: 'countries_id', value: 'COUNTRY' },
    { key: 'abuse', value: 'ABUSE' },
    { key: 'changed_at', value: 'DATE/TIME', display: getHumanReadableDate },
    { key: 'incidentStatus', value: 'STATUS' },
    { key: 'actions', value: '' }
  ];

  async function markAsOpenOrResolved(resource: IncidentResource | DataTableRow) {
    markingResourceIds = markingResourceIds.concat(resource.id);
    const markAs = (resource as IncidentResource).incidentStatus === 'OPEN' ? 'RESOLVED' : 'OPEN';
    await client.incidents.markResourceIssueAs(
      $currentOrganizationId,
      $currentModule,
      resource.id,
      incident.id,
      markAs
    );
    markingResourceIds = markingResourceIds.filter((resourceId) => resourceId !== resource.id);
    incident.notifications = incident.notifications.map((notification) => ({
      ...notification,
      resources: notification.resources.map((res) => ({
        ...res,
        incidentStatus: res.id === resource.id ? markAs : res.incidentStatus
      }))
    }));
  }

  async function deleteAnalyzedResource(resource: IncidentResource | DataTableRow) {
    deletingResourceIds = deletingResourceIds.concat(resource.id);
    await client.threats.deleteAssignedIssue($currentOrganizationId, $currentModule, resource.id, incident.id);
    deletingResourceIds = deletingResourceIds.filter((resourceId) => resourceId !== resource.id);
    incident.notifications = incident.notifications.map((notification) => ({
      ...notification,
      resources: notification.resources.filter((res) => res.id !== resource.id)
    }));
  }

  function openAttachToNotificationModal(notification: IncidentNotification) {
    selectedNotification = notification;
    attachToNotificationModalOpen = true;
  }

  async function attachFile() {
    isAddingAttachment = true;
    await client.incidents.attachFileToNotification(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      selectedNotification.id,
      files[0]
    );
    dispatch('fileAttached');
    attachToNotificationModalOpen = false;
    isAddingAttachment = false;
  }

  async function deleteNotificationAttachment(notification: IncidentNotification) {
    deletingAttachmentNotificationIds = deletingAttachmentNotificationIds.concat(notification.id);
    await client.incidents.deleteNotificationAttachment(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      notification.id
    );
    deletingAttachmentNotificationIds = deletingAttachmentNotificationIds.filter(
      (notificationId) => notificationId !== notification.id
    );
    dispatch('fileAttached');
  }

  async function viewNotificationAttachment(notification: IncidentNotification) {
    selectedNotification = notification;
    loadingAttachmentNotificationIds = loadingAttachmentNotificationIds.concat(notification.id);
    const response = await client.incidents.getNotificationAttachment(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      notification.id
    );
    const contentType = response.headers['content-type'];
    const image = response.data;
    const reader = new FileReader();
    reader.readAsBinaryString(image);
    reader.onload = () => {
      attachmentImage = `data:${contentType};base64,${btoa(reader.result as string)}`;
      viewAttachmentModalOpen = true;
      loadingAttachmentNotificationIds = loadingAttachmentNotificationIds.filter(
        (notificationId) => notificationId !== notification.id
      );
    };
  }

  async function downloadNotificationAttachment(notification: IncidentNotification) {
    loadingAttachmentNotificationIds = loadingAttachmentNotificationIds.concat(notification.id);
    const response = await client.incidents.getNotificationAttachment(
      $currentOrganizationId,
      $currentModuleId,
      incident.id,
      notification.id
    );
    loadingAttachmentNotificationIds = loadingAttachmentNotificationIds.filter(
      (notificationId) => notificationId !== notification.id
    );
    FileSaver.saveAs(response.data, notification.attachments[0].original_name);
  }
</script>

<h5>Publication history</h5>

{#each incident.notifications.slice().reverse() as notification}
  <div class="shadow-sm ">
    <div class="flex items-center justify-between p-2 border bg-ctip-ui">
      <div class="flex items-center gap-2">
        <div class="flex items-center justify-center w-8 h-8 font-bold text-white rounded-full bg-ctip-primary">J</div>
        <div>
          <div>{notification.notification_user}</div>
          <div class="text-ctip-secondary">{getHumanReadableDate(notification.notification_date)}</div>
        </div>
      </div>

      <div>
        {#if notification.attachments.length}
          {@const isDeletingAttachment = deletingAttachmentNotificationIds.includes(notification.id)}
          {@const isLoadingAttachment = loadingAttachmentNotificationIds.includes(notification.id)}
          {@const isImage = notification.attachments[0].content_type.startsWith('image/')}
          {#if !$roleStore.customer}
            <Button
              disabled={isDeletingAttachment}
              on:click={() => deleteNotificationAttachment(notification)}
              --cds-icon-01="var(--ctip-danger)"
              kind="ghost"
              size="small"
              icon={isDeletingAttachment ? InlineLoading : TrashCan}
              iconDescription="Delete attachment"
            />
          {/if}
          <Button
            on:click={() =>
              isImage ? viewNotificationAttachment(notification) : downloadNotificationAttachment(notification)}
            disabled={isLoadingAttachment}
            kind="ghost"
            size="small"
            icon={isLoadingAttachment ? InlineLoading : isImage ? Maximize : Download}
            iconDescription="{isImage ? 'View' : 'Download'} {notification.attachments[0].original_name}"
            tooltipPosition="left"
          />
        {:else if !$roleStore.customer}
          <GenericButton on:click={() => openAttachToNotificationModal(notification)} size="small" kind="tertiary">
            Add Attachment
          </GenericButton>
        {/if}
      </div>
    </div>

    <div class="p-4">
      <h5>Activity</h5>

      <div class="flex flex-col gap-4">
        {#each notification.activities as activity}
          <ActivityItem {activity} />
        {:else}
          <InlineNotification
            class="max-w-full"
            hideCloseButton
            lowContrast
            kind="info"
            title="There are no activities"
          />
        {/each}
      </div>
    </div>

    <div class="p-4">
      <h5>Analyzed resources</h5>
      {#if notification.resources.length}
        <div class="max-w-full pb-6 pr-2 overflow-x-auto">
          <DataTable
            --cds-spacing-05="0.5rem"
            class="max-w-full [&_td]:text-center"
            {headers}
            rows={notification.resources}
          >
            <svelte:fragment slot="cell" let:cell let:row>
              {#if cell.key === 'title'}
                <div class="max-w-[200px] 2xl:max-w-xs overflow-hidden text-ellipsis" title={cell.value}>
                  <a
                    class="no-underline text-ctip-secondary hover:text-ctip-primary whitespace-nowrap"
                    href={resourceUrl($currentOrganizationId, $currentModule, row.id)}
                  >
                    {cell.value}
                  </a>
                </div>
              {:else if cell.key === 'url'}
                {@const url = checkUrl(cell.value)}
                <div class="flex items-center justify-between">
                  <div class="max-w-[200px] 2xl:max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={url}>
                    {url}
                  </div>
                  {#if url !== '-'}
                    <CopyButton text={url} />
                  {/if}
                </div>
              {:else if cell.key === 'countries_id'}
                <div class="text-center">{cell.value || '-'}</div>
              {:else if cell.key === 'abuse'}
                <div class="text-center">{cell.value || '-'}</div>
              {:else if cell.key === 'incidentStatus'}
                <div class="text-center">
                  {cell.value}
                </div>
              {:else if cell.key === 'actions'}
                {#if !$roleStore.customer}
                  {@const isMarking = markingResourceIds.includes(row.id)}
                  {@const isDeleting = deletingResourceIds.includes(row.id)}
                  <div class="flex gap-2">
                    <Button
                      disabled={isMarking || isDeleting}
                      icon={isMarking ? InlineLoading : row.incidentStatus === 'OPEN' ? Folder : FolderOpen}
                      iconDescription={row.incidentStatus === 'OPEN' ? 'Mark as resolved' : 'Mark as open'}
                      on:click={() => markAsOpenOrResolved(row)}
                      kind="ghost"
                      size="small"
                    />
                    <Button
                      disabled={isDeleting}
                      on:click={() => deleteAnalyzedResource(row)}
                      kind="ghost"
                      size="small"
                      iconDescription="Delete attachment"
                      class="flex items-center px-2"
                    >
                      <TrashCan class={isDeleting ? '' : 'fill-ctip-danger'} />
                    </Button>
                  </div>
                {/if}
              {:else}
                {cell.display ? cell.display(cell.value) : cell.value}
              {/if}
            </svelte:fragment>
          </DataTable>
        </div>
      {:else}
        <InlineNotification class="max-w-full" hideCloseButton lowContrast kind="error" title="There are no results" />
      {/if}
    </div>
  </div>
{:else}
  <InlineNotification class="max-w-full" hideCloseButton lowContrast kind="error" title="There are no results" />
{/each}

<Modal
  on:open={() => (files = [])}
  primaryButtonDisabled={!files?.length || isAddingAttachment}
  on:click:button--primary={attachFile}
  on:click:button--secondary={() => (attachToNotificationModalOpen = false)}
  primaryButtonIcon={isAddingAttachment ? InlineLoading : undefined}
  primaryButtonText="Add Attachment"
  secondaryButtonText="Close"
  bind:open={attachToNotificationModalOpen}
  modalHeading="Add an attachment"
>
  <FileUploaderButton bind:files labelText="Choose file" />
</Modal>

<Modal
  on:click:button--primary={() => (viewAttachmentModalOpen = false)}
  primaryButtonText="Close"
  bind:open={viewAttachmentModalOpen}
  modalHeading="Publication Image"
  size="lg"
>
  {#if attachmentImage}
    <img class="w-full" src={attachmentImage} alt={selectedNotification.attachments[0].original_name} />
  {/if}
</Modal>
