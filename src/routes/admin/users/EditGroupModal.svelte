<script lang="ts">
  import Client from '$lib/client';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { User, UserDetail, UserGroup } from '$lib/types/admin';
  import preferencesStore from '$stores/preferences';
  import { validator } from '@felte/validator-yup';
  import {
    Button,
    DataTable,
    FormGroup,
    InlineLoading,
    Modal,
    Pagination,
    SkeletonPlaceholder,
    TextInput,
    TextInputSkeleton,
    Toolbar,
    ToolbarContent
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, Renew, Save, TrashCan, View } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { createEventDispatcher } from 'svelte';
  import * as yup from 'yup';

  export let open = false;
  export let group: UserGroup;

  let loading = false;
  let loadingUsers = false;

  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let rows: User[] = [];
  let totalItems = 0;
  let viewSelected = false;
  let selectedUsers: (User | UserDetail)[] = [];

  $: open && loadGroup(group);
  $: open && !viewSelected && getUsers(page, pageSize);

  const headers: DataTableHeader[] = [
    { key: 'name', value: 'FIRST NAME' },
    { key: 'username', value: 'USERNAME' },
    { key: 'actions', value: '', width: '120px' }
  ];
  const client = new Client();
  const dispatch = createEventDispatcher<{ saved: void }>();
  const schema = yup.object({
    name: yup.string().required(),
    users: yup.array().of(yup.number())
  });
  const { form, errors, isSubmitting, reset, handleSubmit, data, setData, setInitialValues, validate } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      if (group) {
        await client.admin.editGroup(group.id, values.name, values.users);
      } else {
        await client.admin.createGroup(values.name, values.users);
      }
      open = false;
      dispatch('saved');
    }
  });

  async function loadGroup(group: UserGroup) {
    viewSelected = false;
    if (group) {
      loading = true;
      const groupDetail = await client.admin.getGroup(group.id);
      loading = false;
      setInitialValues({
        name: groupDetail.name,
        users: Object.keys(groupDetail.userMap).map(Number)
      });
      selectedUsers = Object.entries(groupDetail.userMap).map(([id, user]) => ({ ...user, id: +id }));
    } else {
      setInitialValues({
        name: '',
        users: []
      });
      selectedUsers = [];
    }
    reset();
  }

  async function getUsers(page: number, pageSize: number) {
    loadingUsers = true;
    const response = await client.admin.getUsers(page, pageSize);
    totalItems = response.total_resources;
    rows = response.list;
    // await tick();
    loadingUsers = false;
  }

  function onSelectUser(userId: number) {
    const user = rows.find((u) => u.id === userId);
    if (!user) return;
    $data.users = [...$data.users, userId];
    selectedUsers = [...selectedUsers, user];
  }

  function onRemoveUser(userId: number) {
    $data.users = $data.users.filter((id) => id !== userId);
    selectedUsers = selectedUsers.filter((u) => u.id !== userId);
  }

  function onToggleViewSelectedUsers() {
    viewSelected = !viewSelected;
  }
</script>

<Modal
  bind:open
  modalHeading="{group ? 'Edit' : 'Create'} User Groups"
  primaryButtonText={group ? 'Save' : 'Create'}
  secondaryButtonText="Close"
  primaryButtonIcon={$isSubmitting ? InlineLoading : Save}
  primaryButtonDisabled={$isSubmitting}
  on:submit={handleSubmit}
  on:click:button--secondary={() => (open = false)}
>
  <div class="px-4 py-2">
    <form use:form>
      <FormGroup>
        {#if loading}
          <TextInputSkeleton />
        {:else}
          <TextInput
            bind:value={$data.name}
            name="name"
            labelText="Group Name"
            invalidText={$errors?.name?.join(', ')}
            invalid={!!$errors.name}
          />
        {/if}
      </FormGroup>
    </form>

    {#if loading}
      <SkeletonPlaceholder class="w-full h-96" />
    {:else}
      <DataTable
        {headers}
        rows={viewSelected ? selectedUsers : rows}
        class={loadingUsers ? '[&>table]:opacity-20 select-none' : ''}
        --cds-spacing-03="0"
        --cds-spacing-04="0.25rem"
        --cds-spacing-05="0.75rem"
      >
        <Toolbar>
          <ToolbarContent>
            <div class="flex justify-between w-full">
              <Button on:click={() => getUsers(page, pageSize)} kind="ghost" icon={Renew}>Refresh</Button>
              <Button on:click={onToggleViewSelectedUsers} kind="ghost" icon={View}>
                {#if viewSelected}
                  View all
                {:else}
                  View selected {$data?.users?.length}
                {/if}
              </Button>
            </div>
          </ToolbarContent>
        </Toolbar>

        <svelte:fragment slot="cell" let:cell let:row>
          {#if cell.key === 'actions'}
            {#if $data?.users?.includes(row.id)}
              <Button on:click={() => onRemoveUser(row.id)} size="small" kind="danger-ghost" icon={TrashCan}>
                Remove
              </Button>
            {:else}
              <Button on:click={() => onSelectUser(row.id)} size="small" kind="ghost" icon={Add}>Add</Button>
            {/if}
          {:else}
            {cell.value}
          {/if}
        </svelte:fragment>
      </DataTable>

      {#if viewSelected}
        {#if !selectedUsers.length}
          <EmptyData />
        {/if}
      {:else if rows.length}
        <Pagination
          bind:pageSize
          bind:page
          {totalItems}
          {pageSizes}
          itemRangeText={(min, max, total) => `${min}–${max}`}
        />
      {:else if !loadingUsers}
        <EmptyData />
      {/if}
    {/if}
  </div>
</Modal>
