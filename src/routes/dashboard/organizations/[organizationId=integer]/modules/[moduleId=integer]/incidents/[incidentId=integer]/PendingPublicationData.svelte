<script lang="ts">
  import type { Incident, IncidentNotificationActivity, IncidentResource } from '$lib/client/services/incidents';
  import type { DataTableHeader, DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { CopyButton, DataTable, InlineNotification } from 'carbon-components-svelte';
  import { TrashCan } from 'carbon-icons-svelte';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule, currentModuleId } from '$stores/module';
  import Client from '$lib/client';
  import ActivityItem from './ActivityItem.svelte';
  import { checkUrl, resourceUrl } from './utils';
  import roleStore from '$stores/role';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';

  export let incident: Incident;

  const client = new Client();
  let deletingResourceIds: number[] = [];
  let deletingActivityIds: number[] = [];

  const headersAnalyzedResources: DataTableHeader[] = [
    { key: 'title', value: 'TITLE' },
    { key: 'url', value: 'URL' },
    { key: 'countries_id', value: 'COUNTRY' },
    { key: 'abuse', value: 'ABUSE' },
    { key: 'created_at', value: 'DATE/TIME', display: getHumanReadableDate },
    { key: 'delete', empty: true }
  ];

  async function deleteAnalyzedResource(resource: IncidentResource | DataTableRow) {
    deletingResourceIds = deletingResourceIds.concat(resource.id);
    await client.threats.deleteAssignedIssue($currentOrganizationId, $currentModule, resource.id, incident.id);
    deletingResourceIds = deletingResourceIds.filter((resourceId) => resourceId !== resource.id);
    incident.currentIncompleteNotification.resources = incident.currentIncompleteNotification.resources.filter(
      (r) => r.id !== resource.id
    );
  }

  async function deleteActivity(activity: IncidentNotificationActivity) {
    deletingActivityIds = deletingActivityIds.concat(activity.id);
    await client.incidents.deleteIncidentActivity($currentOrganizationId, $currentModuleId, incident.id, activity.id);
    deletingActivityIds = deletingActivityIds.filter((activityId) => activityId !== activity.id);
    incident.currentIncompleteNotification.activities = incident.currentIncompleteNotification.activities.filter(
      (act) => act.id !== activity.id
    );
  }
</script>

<div>
  <h5>Analyzed resources</h5>

  {#if incident?.currentIncompleteNotification?.resources?.length}
    <div class="max-w-full overflow-x-auto pb-4">
      <DataTable
        class="[&_td]:text-center"
        headers={headersAnalyzedResources}
        rows={incident.currentIncompleteNotification.resources}
      >
        <svelte:fragment slot="cell" let:cell let:row>
          {#if cell.key === 'title'}
            <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={cell.value}>
              <a
                class="text-ctip-secondary hover:text-ctip-primary"
                href={resourceUrl($currentOrganizationId, $currentModule, row.id)}
              >
                {cell.value}
              </a>
            </div>
          {:else if cell.key === 'url'}
            {@const url = checkUrl(cell.value)}
            <div class="flex items-center justify-between">
              <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={url}>
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
          {:else if cell.key === 'delete'}
            {#if !$roleStore.customer}
              {@const isDeleting = deletingResourceIds.includes(row.id)}
              <GenericButton
                kind="danger-tertiary"
                iconDescription="Delete"
                on:click={() => deleteAnalyzedResource(row)}
                disabled={isDeleting}
              >
                <TrashCan />
              </GenericButton>
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

<div class="mt-4">
  <h5>Activities</h5>

  {#if incident.currentIncompleteNotification?.activities?.length}
    <div class="flex flex-col gap-4">
      {#each incident.currentIncompleteNotification.activities as activity}
        {@const isDeleting = deletingActivityIds.includes(activity.id)}
        <ActivityItem
          allowDelete={!$roleStore.customer}
          {activity}
          {isDeleting}
          on:delete={() => deleteActivity(activity)}
        />
      {/each}
    </div>
  {:else}
    <InlineNotification class="max-w-full" hideCloseButton lowContrast kind="info" title="There are no activities" />
  {/if}
</div>
