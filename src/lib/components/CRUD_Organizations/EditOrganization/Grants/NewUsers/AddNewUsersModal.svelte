<script lang="ts">
  import Client from '$lib/client';
  import {
    Button,
    DataTable,
    Loading,
    Modal,
    Pagination,
    ToolbarContent,
    ToolbarSearch
  } from 'carbon-components-svelte';
  import type { DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { orgToEdit } from '$stores/organization';
  import notifications from '$stores/notification';
  import type { Grant } from '$lib/types/admin';

  export let open = false;
  export let addedUsers: Grant[] = [];
  let page = 1;
  let pageSize = 10;
  let totalItems = 0;
  let search = '';
  let loading = false;
  let loadingAddedRemovedUser = false;
  let sortDirection: DataTableProps['sortDirection'] = 'none';
  let searchValueForUsersToAdd = '';
  let sortKey: string = null;
  let searchDebounce: ReturnType<typeof setTimeout>;

  const client = new Client();
  const dispatch = createEventDispatcher<{ onAddOrRemoveUser: void }>();
  let rows = [];
  $: onChangeSearch(searchValueForUsersToAdd);
  $: getUsers(page, pageSize, sortKey, sortDirection, search, open);

  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
        page = 1;
      }, 1000);
    }
  }
  async function getUsers(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search: string = '',
    open: boolean
  ) {
    if (!open) return;
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getUsers(page, pageSize, search, sortKey, ascending);
    totalItems = response.total_resources;
    rows = response.list;
    await tick();
    loading = false;
  }

  async function handleRemoveUser(userId) {
    try {
      loadingAddedRemovedUser = true;
      const userDetails = await client.admin.getUserGrants(userId);
      userDetails.superSearchGrants = userDetails.superSearchGrants.filter((grant) => grant.itemId !== $orgToEdit.id);
      await client.admin.saveUserGrantsForOrg(userId, userDetails);
      notifications.notify({
        title: 'User removed successfully',
        kind: 'success'
      });
      dispatch('onAddOrRemoveUser');
    } catch (error) {
      notifications.notify({
        title: 'Error',
        kind: 'error',
        subtitle: error.message
      });
    } finally {
      loadingAddedRemovedUser = false;
    }
  }
  async function handleAddNewUser(userId) {
    try {
      loadingAddedRemovedUser = true;
      const userDetails = await client.admin.getUserGrants(userId);

      const newGrant = {
        analyst: true,
        itemId: $orgToEdit.id,
        mssp_customer: false,
        operator: false,
        reputationalSearchGrants: []
      };
      userDetails.superSearchGrants.push(newGrant);

      await client.admin.saveUserGrantsForOrg(userId, userDetails);
      loadingAddedRemovedUser = false;
      notifications.notify({
        title: 'User added successfully',
        kind: 'success'
      });
      dispatch('onAddOrRemoveUser');
    } catch (error) {
      loadingAddedRemovedUser = false;
      notifications.notify({
        title: 'Error',
        kind: 'error',
        subtitle: error.message
      });
    }
  }
</script>

<Modal
  class="w-full h-full [&>div]:mb-auto [&>div]:min-w-[60vw] [&>div]:max-h-[100%]"
  bind:open
  modalHeading={`User grants for '${$orgToEdit.name}'`}
  size="sm"
  passiveModal
  preventCloseOnClickOutside
>
  {#if loading}
    <Loading withOverlay={true} />
  {:else}
    <DataTable
      size="compact"
      class="h-80 [&_th]:text-left"
      headers={[
        { key: 'name', value: 'All users', width: '85%' },
        { key: 'id', value: '', width: '15%' }
      ]}
      {rows}
    >
      <ToolbarContent>
        <ToolbarSearch class="max-w-md" bind:value={searchValueForUsersToAdd} />
      </ToolbarContent>

      {#if loadingAddedRemovedUser}
        <Loading withOverlay={true} />
      {/if}
      <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === 'name'}
          {cell.value}
        {/if}
        {#if cell.key === 'id'}
          {#if !addedUsers.find((user) => user.userId == cell.value)}
            <Button on:click={() => handleAddNewUser(row.id)} kind="ghost">Add</Button>
          {:else}
            <Button kind="danger-ghost" on:click={() => handleRemoveUser(row.id)}>Remove</Button>
          {/if}
        {/if}
      </svelte:fragment>
    </DataTable>
    {#if rows.length}
      <div class="fixed w-[95%]">
        <div>
          <Pagination
            class="mb-10 "
            bind:pageSize
            bind:page
            {totalItems}
            {pageSizes}
            itemRangeText={(min, max, total) => `${min}–${max}`}
          />
        </div>
      </div>
    {:else if !loading}
      <EmptyData />
    {/if}
  {/if}
</Modal>
