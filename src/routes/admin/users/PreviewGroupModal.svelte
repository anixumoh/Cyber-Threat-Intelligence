<script lang="ts">
  import type { UserGroup } from '$lib/types/admin';
  import Client from '$lib/client';
  import { Modal, SkeletonPlaceholder } from 'carbon-components-svelte';
  import { createEventDispatcher } from 'svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  export let open = false;
  export let group: UserGroup;

  const dispatch = createEventDispatcher<{ edit: number }>();
  const client = new Client();

  async function getGroupDetails(groupId: number) {
    return await client.admin.getGroup(groupId);
  }

  function onClickEdit() {
    open = false;
    dispatch('edit', group.id);
  }
</script>

<Modal
  bind:open
  size="sm"
  modalHeading="Group Detail"
  primaryButtonText="Edit"
  secondaryButtonText="Close"
  on:click:button--primary={onClickEdit}
  on:click:button--secondary={() => (open = false)}
>
  <div class="px-8">
    <div class="p-4 bg-ctip-hover-ui">
      {group?.name}
    </div>

    {#if group?.id}
      {#await getGroupDetails(group.id)}
        <SkeletonPlaceholder class="w-full" />
      {:then groupDetail}
        <div class="border">
          {#each Object.values(groupDetail.userMap) as user}
            <div class="flex justify-between border p-2">
              <div>
                {user.name}
              </div>
              <div>
                {user.username}
              </div>
            </div>
          {:else}
            <EmptyData
              messageObj={{
                msg: 'No users on this group'
              }}
            />
          {/each}
        </div>
      {/await}
    {/if}
  </div>
</Modal>
