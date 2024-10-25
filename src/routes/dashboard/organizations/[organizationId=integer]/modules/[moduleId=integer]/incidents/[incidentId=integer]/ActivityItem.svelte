<script lang="ts">
  import type { IncidentNotificationActivity } from '$lib/client/services/incidents';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import { createEventDispatcher } from 'svelte';

  export let activity: IncidentNotificationActivity;
  export let allowDelete = false;
  export let isDeleting = false;

  const dispatch = createEventDispatcher();

  function onDelete() {
    dispatch('delete');
  }
</script>

<article class="shadow-sm border-[1px] border-solid border-gray-200">
  <div class="bg-gray-100 flex justify-between items-center px-2" class:py-2={!allowDelete}>
    <div>
      <span class="font-bold">
        {activity.creation_user}
      </span>
      <span class="px-2">·</span>
      <span class="text-ctip-secondary">
        {getHumanReadableDate(activity.creation_date)}
      </span>
    </div>
    <div class="py-2">
      {#if allowDelete}
        <GenericButton on:click={onDelete} kind="danger-tertiary" iconDescription="Delete" disabled={isDeleting}>
          Delete
        </GenericButton>
      {/if}
    </div>
  </div>
  <div class="p-2">
    <div>{activity.title}</div>
    <div class="text-ctip-secondary">{activity.content}</div>
  </div>
</article>
