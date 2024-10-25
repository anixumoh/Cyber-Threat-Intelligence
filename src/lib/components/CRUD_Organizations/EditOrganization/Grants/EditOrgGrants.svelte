<script lang="ts">
  import { Button, Loading, ToolbarContent } from 'carbon-components-svelte';
  import { SettingsEdit } from 'carbon-icons-svelte';
  import AddNewUsersModal from './NewUsers/AddNewUsersModal.svelte';
  import { orgToEdit } from '$stores/organization';
  import Client from '$lib/client';
  import notifications from '$stores/notification';
  import type { Grant } from '$lib/types/admin';
  import PermissionTablePerOrganization from '$src/routes/admin/users/PermissionTablePerOrganization.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';

  let openAddUserModal = false;
  let loadingUsers = false;
  const client = new Client();

  let addedUsers: Grant[] = [];
  $: {
    loadUsers(true);
  }
  function onClickAddUser() {
    openAddUserModal = true;
  }
  export async function loadUsers(showLoadingAnimation = true) {
    try {
      if (showLoadingAnimation) {
        loadingUsers = true;
      }
      addedUsers = await client.admin.getGrantsByOrgId($orgToEdit.id);
    } catch (error) {
      notifications.notify({ title: 'Error', kind: 'error' });
    } finally {
      if (showLoadingAnimation) {
        loadingUsers = false;
      }
    }
  }
</script>

<div class="h-72">
  {#if loadingUsers}
    <div class="p-14 h-full w-full flex justify-center">
      <Loading class="h-[33vh]" withOverlay={false} />
    </div>
  {:else}
    <ToolbarContent>
      <Button on:click={onClickAddUser} icon={SettingsEdit}>Manage users</Button>
    </ToolbarContent>
    <PermissionTablePerOrganization
      on:onRemoveUser={() => {
        loadUsers(false);
      }}
      organization={$orgToEdit}
      users={addedUsers}
    />
  {/if}
  <AddNewUsersModal
    on:onAddOrRemoveUser={() => {
      loadUsers(false);
    }}
    {addedUsers}
    bind:open={openAddUserModal}
  />
  {#if addedUsers.length === 0}
    <EmptyData messageObj={{ msg: 'No users found' }} />
  {/if}
</div>
