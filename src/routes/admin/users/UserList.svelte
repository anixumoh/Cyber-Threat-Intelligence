<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { User } from '$lib/types/admin';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import roleStore from '$stores/role';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Toggle,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarSearch,
    TooltipIcon
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, Locked, Password, TrashCan, WarningAlt } from 'carbon-icons-svelte';
  import { tick } from 'svelte';
  import ChangePasswordModal from './ChangePasswordModal.svelte';
  import EditUserModal from './EditUserModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'FIRST NAME', sort: () => 0 },
    { key: 'firstSurname', value: 'SURNAME', sort: () => 0 },
    { key: 'username', value: 'USERNAME', sort: () => 0 },
    { key: 'job', value: 'COMPANY', sort: () => 0 },
    { key: 'lastLoginAt', value: 'LAST LOGIN', display: getHumanReadableDate, sort: () => 0 },
    { key: 'status', value: 'STATUS', sort: false },
    { key: 'masterGrant', value: 'ROL', sort: () => 0 },
    { key: 'actions', value: '', sort: false }
  ];

  let selectedRowIds = [];
  let loading = false;
  let rows: User[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let search = '';
  let searchDebounce: ReturnType<typeof setTimeout>;
  let changingStatus: Record<number, boolean> = {};
  let actionLoading = false;

  let selectedUserId: number;
  $: selectedUser = rows.find((user) => user.id === selectedUserId);

  let reset2FAModalOpen = false;
  let deleteModalOpen = false;
  let changePasswordModalOpen = false;
  let editUserModalOpen = false;

  let sortKey: string = null;
  let sortDirection: DataTableProps['sortDirection'] = 'none';

  let searchValue = '';
  $: onChangeSearch(searchValue);
  $: getUsers(page, pageSize, sortKey, sortDirection, search);
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;

  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
        page = 1;
      }, 1000);
    }
  }

  async function refresh() {
    await getUsers(page, pageSize, sortKey, sortDirection, search);
  }

  async function getUsers(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    search: string = ''
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getUsers(page, pageSize, search, sortKey, ascending);
    totalItems = response.total_resources;
    rows = response.list;
    await tick();
    loading = false;
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function changeSelectedUserStatus(enabled: boolean) {
    const userIds = rows
      .filter((user) => selectedRowIds.includes(user.id))
      .filter((user) => (enabled ? user.status !== 'ENABLED' : user.status === 'ENABLED'))
      .filter(
        (user) =>
          user.status === 'ENABLED' ||
          user.status === 'DISABLED' ||
          user.status === 'LOCKED' ||
          user.status === 'EXPIRED'
      )
      .map((user) => user.id);

    if (!userIds.length) return;
    loading = true;
    await Promise.all(userIds.map((id) => client.admin.changeUserStatus(id, enabled)));
    await refresh();
    loading = false;
    selectedRowIds = [];
  }

  async function changeUserStatus(userId: number, enabled: boolean) {
    if (loading) return;
    const index = rows.findIndex((u) => u.id === userId);
    const user = rows.find((u) => u.id === userId);
    if (!user) return;
    if (
      !(
        user.status === 'ENABLED' ||
        user.status === 'DISABLED' ||
        user.status === 'LOCKED' ||
        user.status === 'EXPIRED'
      )
    ) {
      rows[index].status = user.status;
      return;
    }
    if (index === -1) return;
    loading = true;
    changingStatus[userId] = true;
    await client.admin.changeUserStatus(userId, enabled);
    changingStatus[userId] = false;
    rows[index].status = enabled ? 'ENABLED' : 'DISABLED';
    await tick();
    loading = false;
  }

  function onClickReset2FA(userId: number) {
    selectedUserId = userId;
    reset2FAModalOpen = true;
  }

  async function reset2FA(userId: number) {
    const index = rows.findIndex((user) => user.id === userId);
    if (index === -1) return;
    actionLoading = true;
    await client.admin.disable2FA(userId);
    rows[index].hasMFA = false;
    actionLoading = false;
    reset2FAModalOpen = false;
  }

  function onClickDelete(userId: number) {
    selectedUserId = userId;
    deleteModalOpen = true;
  }

  async function deleteUser(userId: number) {
    const index = rows.findIndex((user) => user.id === userId);
    if (index === -1) return;
    actionLoading = true;
    await client.admin.deleteUser(userId);
    actionLoading = false;
    deleteModalOpen = false;
    await refresh();
  }

  function onClickChangePassword(userId: number) {
    selectedUserId = userId;
    changePasswordModalOpen = true;
  }

  function onClickEditUser(userId: number) {
    selectedUserId = userId;
    editUserModalOpen = true;
  }

  function onClickAddUser() {
    selectedUserId = null;
    editUserModalOpen = true;
  }
</script>

<div class="relative overflow-x-auto">
  <DataTable
    id="user-list"
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}"
    size="compact"
    {rows}
    sortable
    batchSelection
    bind:selectedRowIds
    bind:sortKey
    bind:sortDirection
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarBatchActions
        formatTotalSelected={(totalSelected) => `${totalSelected} user${totalSelected === 1 ? '' : 's'} selected`}
      >
        <Button data-testid="batch-enable" on:click={() => changeSelectedUserStatus(true)}>Enable users</Button>
        <Button data-testid="batch-disable" on:click={() => changeSelectedUserStatus(false)} kind="danger"
          >Disable users</Button
        >
      </ToolbarBatchActions>
      <ToolbarContent>
        <ToolbarSearch data-testid="search-users" class="max-w-md" bind:value={searchValue} />
        <Button on:click={onClickAddUser} icon={Add}>Add user</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'status'}
        <div class="flex items-center justify-center gap-2">
          <Toggle
            disabled={changingStatus[row.id]}
            on:toggle={(e) => changeUserStatus(row.id, e.detail.toggled)}
            class="flex items-center justify-center"
            size="sm"
            toggled={cell.value === 'ENABLED'}
            labelA=""
            labelB=""
            data-testid="toggle-status"
          />

          {#if cell.value === 'PASSWORD_EXPIRED'}
            <TooltipIcon
              --cds-icon-02="var(--ctip-warningIcon)"
              class="mt-1"
              icon={WarningAlt}
              tooltipText="User password has been expired. Please, reset the password"
            />
          {:else if cell.value === 'EXPIRED'}
            <TooltipIcon
              --cds-icon-02="var(--ctip-warningIcon)"
              class="mt-1"
              icon={WarningAlt}
              tooltipText="User is expired"
            />
          {:else if row?.daysToPasswordChange <= 15}
            <TooltipIcon
              --cds-icon-02="var(--ctip-warningIcon)"
              class="mt-1"
              icon={WarningAlt}
              tooltipText="The password will expire in {row.daysToPasswordChange} day(s)"
            />
          {/if}
        </div>
      {:else if cell.key === 'actions'}
        <div class="flex items-center justify-center gap-1.5">
          {#if $roleStore.superadmin}
            <Button
              on:click={() => onClickReset2FA(row.id)}
              disabled={!row.hasMFA}
              class="rounded"
              size="small"
              kind="ghost"
              icon={Locked}
              iconDescription="Reset 2FA"
              data-testid="reset-2fa"
            />
          {/if}
          <Button
            on:click={() => onClickChangePassword(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Password}
            iconDescription="Change Password"
            data-testid="change-password"
          />
          <Button
            on:click={() => onClickEditUser(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
            data-testid="edit-user"
          />
          <Button
            on:click={() => onClickDelete(row.id)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
            data-testid="delete-user"
          />
        </div>
      {:else if cell.key === 'masterGrant'}
        <div class="flex items-center justify-center">
          {#if row.status === 'LOCKED'}
            LOCKED
          {:else}
            {cell.value}
          {/if}
        </div>
      {:else if cell.key === 'name'}
        <div class="pl-2.5">
          {cell.value}
        </div>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value || '-'}
      {/if}
    </svelte:fragment>
  </DataTable>

  {#if loading}
    <div class="absolute inset-0 flex pointer-events-none">
      <InlineLoading class="flex items-center justify-center" />
    </div>
  {/if}
</div>

{#if rows.length}
  <div class="sticky bottom-0 -mt-12">
    <div>
      <Pagination
        class="mb-10"
        bind:pageSize
        bind:page
        {totalItems}
        {pageSizes}
        itemRangeText={(min, max, total) => `${min}–${max}`}
      />
      <div class="absolute bottom-1 right-60">
        <Button
          on:click={scrollToTopOfTable}
          size="small"
          tooltipPosition="top"
          iconDescription="Scroll to top"
          kind="primary"
          icon={CaretUp}
        />
      </div>
    </div>
  </div>
{:else if !loading}
  <EmptyData />
{/if}

<WarningModal
  class="reset-2fa-modal"
  bind:open={reset2FAModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to reset 2FA for the user {selectedUser?.name}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (reset2FAModalOpen = false)}
  on:submit={() => reset2FA(selectedUserId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>

<WarningModal
  class="confirm-delete-modal"
  bind:open={deleteModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to delete the user {selectedUser?.name}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={() => deleteUser(selectedUserId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>

<ChangePasswordModal bind:open={changePasswordModalOpen} userId={selectedUserId} />

<EditUserModal bind:open={editUserModalOpen} userId={selectedUserId} on:saved={refresh} />
