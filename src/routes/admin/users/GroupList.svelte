<script lang="ts">
  import Client from '$lib/client';
  import type { UserGroup } from '$lib/types/admin';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Toolbar,
    ToolbarContent
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, Edit, TrashCan } from 'carbon-icons-svelte';
  import EditGroupModal from './EditGroupModal.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import PreviewGroupModal from './PreviewGroupModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME' },
    { key: 'actions', value: '', width: '100px' }
  ];

  let loading = false;
  let groups: UserGroup[] = [];
  let editModalOpen = false;
  let confirmDeleteModalOpen = false;
  let selectedGroupId: number;
  let deleting = false;
  let previewModalOpen = false;

  $: getGroups();
  $: selectedGroup = groups.find((group) => group.id === selectedGroupId);

  async function getGroups() {
    loading = true;
    groups = await client.admin.getGroups();
    loading = false;
  }

  function onClickAdd() {
    selectedGroupId = null;
    editModalOpen = true;
  }

  function onClickEdit(id: number) {
    selectedGroupId = id;
    editModalOpen = true;
  }

  function onClickDelete(id: number) {
    selectedGroupId = id;
    confirmDeleteModalOpen = true;
  }

  async function deleteGroup() {
    if (!selectedGroupId) return;
    deleting = true;
    await client.admin.deleteGroup(selectedGroupId);
    deleting = false;
    confirmDeleteModalOpen = false;
    await getGroups();
  }

  function openPreview(id: number) {
    selectedGroupId = id;
    previewModalOpen = true;
  }
</script>

{#if loading}
  <DataTableSkeleton showHeader={false} />
{:else}
  <DataTable
    {headers}
    rows={groups}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
    class="[&_th]:text-left"
  >
    <Toolbar>
      <ToolbarContent>
        <Button on:click={onClickAdd} icon={Add}>Add group</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'name'}
        <Button size="small" kind="ghost" on:click={() => openPreview(row.id)}>
          {cell.value}
        </Button>
      {:else if cell.key === 'actions'}
        <div class="flex items-center justify-center gap-1.5">
          <Button
            on:click={() => onClickEdit(row.id)}
            class="rounded"
            size="small"
            kind="ghost"
            icon={Edit}
            iconDescription="Edit"
          />
          <Button
            on:click={() => onClickDelete(row.id)}
            class="rounded px-1.5 [&>svg]:ml-0"
            size="small"
            kind="danger-ghost"
            icon={TrashCan}
            iconDescription="Delete"
            tooltipAlignment="end"
          />
        </div>
      {:else}
        {cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}

<EditGroupModal bind:open={editModalOpen} group={selectedGroup} on:saved={getGroups} />

<PreviewGroupModal bind:open={previewModalOpen} group={selectedGroup} on:edit={(e) => onClickEdit(e.detail)} />

<WarningModal
  bind:open={confirmDeleteModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to delete the group {selectedGroup?.name}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (confirmDeleteModalOpen = false)}
  on:submit={() => deleteGroup()}
  primaryButtonDisabled={deleting}
  primaryButtonIcon={deleting ? InlineLoading : undefined}
/>
