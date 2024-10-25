<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import type { LabelType } from '$lib/types/admin';
  import {
    Button,
    DataTable,
    InlineLoading,
    Modal,
    TextInput,
    Toolbar,
    ToolbarContent,
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, Edit, TrashCan } from 'carbon-icons-svelte';
  import { tick } from 'svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME' },
    { key: 'actions', value: '', sort: false }
  ];

  let loading = false;
  let rows: LabelType[] = [];

  let selectedLabelTypeId: number;
  let name = '';
  $: selectedLabelType = rows.find((label) => label.id === selectedLabelTypeId);

  let deleteModalOpen = false;
  let editModalOpen = false;
  let actionLoading = false;

  $: getLabelTypes();

  async function getLabelTypes() {
    loading = true;
    rows = await client.admin.getLabelTypes();
    loading = false;
  }

  function onClickDelete(labelTypeId: number) {
    selectedLabelTypeId = labelTypeId;
    deleteModalOpen = true;
  }

  async function deleteLabelType(labelTypeId: number) {
    actionLoading = true;
    await client.admin.deleteLabelType(labelTypeId);
    actionLoading = false;
    deleteModalOpen = false;
    await getLabelTypes();
  }

  async function onClickEdit(labelTypeId: number) {
    selectedLabelTypeId = labelTypeId;
    await tick()
    name = selectedLabelType?.name ?? '';
    editModalOpen = true;
  }

  async function editLabelType(labelTypeId: number) {
    actionLoading = true;
    await client.admin.editLabelType(labelTypeId, name);
    actionLoading = false;
    deleteModalOpen = false;
    await getLabelTypes();
  }

  function onClickAdd() {
    selectedLabelTypeId = null;
    editModalOpen = true;
  }
</script>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}
    [&_th:nth-child(2)]:w-16
    "
    size="compact"
    {rows}
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarContent>
        <Button on:click={onClickAdd} icon={Add}>Add Type</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'actions'}
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

{#if !rows.length && !loading}
  <EmptyData />
{/if}

<WarningModal
  bind:open={deleteModalOpen}
  shouldSubmitOnEnter={false}
  modalHeading="Confirmation"
  question="Are you sure you want to delete the type {selectedLabelType?.name}?"
  secondMessage="This action cannot be undone."
  on:closeModal={() => (deleteModalOpen = false)}
  on:submit={() => deleteLabelType(selectedLabelTypeId)}
  primaryButtonDisabled={actionLoading}
  primaryButtonIcon={actionLoading ? InlineLoading : undefined}
/>

<Modal
  bind:open={editModalOpen}
  modalHeading="{selectedLabelTypeId ? 'Edit' : 'Create'} Type - Label"
  secondaryButtonText="Close"
  primaryButtonText="Save"
  primaryButtonDisabled={!name}
  on:click:button--secondary={() => (editModalOpen = false)}
  on:click:button--primary={() => {
    editModalOpen = false;
    editLabelType(selectedLabelTypeId);
  }}
>
  <div class="px-8">
    <TextInput bind:value={name} labelText="Name" />
  </div>
</Modal>
