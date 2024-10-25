<script lang="ts">
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import {
    Button,
    DataTable,
    FormGroup,
    InlineLoading,
    Loading,
    Modal,
    Pagination,
    TextInput,
    Toolbar,
    ToolbarContent
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Add, CaretUp, Edit, TrashCan } from 'carbon-icons-svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import preferencesStore from '$stores/preferences';
  import Client from '$lib/client';
  import { orgToEdit } from '$stores/organization';
  import { tick } from 'svelte';
  import { validator } from '@felte/validator-yup';

  import * as yup from 'yup';
  import type { Blacklist } from '$lib/types/admin';
  import { createForm } from 'felte';
  import notifications from '$stores/notification';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  let pageSize = $preferencesStore?.defaultRows || 10;
  let loading = false;
  let deletingBlacklist = false;
  let addEditBlacklistModalOpen = false;
  let blacklistSelectedId: number;
  let blacklistToDelete: number;
  $: selectedBlacklist = rows.find((blist) => blist.id === blacklistSelectedId);
  $: addEditBlacklistModalOpen && initForm(selectedBlacklist);

  const headers: DataTableHeader[] = [
    { key: 'id', value: 'URL/IP/DOMAIN ', sort: false, width: '50%' },
    { key: 'createdAt', value: 'CREATED AT', sort: false },
    { key: 'actions', value: '', sort: false }
  ];
  let sortKey: string = 'date';
  let sortDirection: DataTableProps['sortDirection'] = 'ascending';
  let page = 1;
  let totalItems = 0;
  const client = new Client();
  let rows: Blacklist[] = [];
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;
  $: getBlacklist(page, pageSize, sortKey, sortDirection);
  const schema = yup.object({
    url: yup.string().required()
  });
  const { form, errors, isSubmitting, validate, isValid, reset, handleSubmit, data, setInitialValues } = createForm<
    yup.InferType<typeof schema>
  >({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      try {
        if (selectedBlacklist) {
          await client.admin.editBlacklist(selectedBlacklist.id, values.url, $orgToEdit.id);
        } else {
          await client.admin.addBlacklist(values.url, $orgToEdit.id);
        }
        addEditBlacklistModalOpen = false;
        await getBlacklist(page, pageSize, sortKey, sortDirection);
      } catch (error) {
        notifications.notify({
          kind: 'error',
          title: 'Error',
          subtitle: `There was an error while saving the blacklist.`
        });
      }
    }
  });

  function initForm(blacklist: Blacklist) {
    if (blacklist) {
      setInitialValues({
        url: blacklist.url
      });
    } else {
      setInitialValues({
        url: ''
      });
    }
    reset();
  }

  function scrollToTopOfTable() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function getBlacklist(page, pageSize, sortKey, sortDirection) {
    loading = true;
    const ascending = sortDirection === 'ascending';
    const response = await client.admin.getBlacklist(page, pageSize, sortKey, ascending, $orgToEdit.id);
    totalItems = response.totalRegistres;
    rows = response.blacklist;
    await tick();
    loading = false;
  }
  function getCorrectDateFormat(dateInNumber: number) {
    const date = new Date(dateInNumber);
    const result = date.toLocaleString('es-ES', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    return result;
  }
  async function doDelete() {
    try {
      deletingBlacklist = true;
      await client.admin.deleteBlacklist(blacklistToDelete, $orgToEdit.id);
      await getBlacklist(page, pageSize, sortKey, sortDirection);
      blacklistToDelete = null;
      deletingBlacklist = false;
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: `There was an error while deleting the blacklist.`
      });
    }
  }
  function onClickEdit(id: number) {
    addEditBlacklistModalOpen = true;
    blacklistSelectedId = id;
  }
  function onClickAdd() {
    addEditBlacklistModalOpen = true;
    blacklistSelectedId = null;
  }
  function onClickDelete(id: number) {
    blacklistToDelete = id;
  }
</script>

<div class="relative overflow-x-auto">
  <DataTable
    class="pb-5
        [&_th]:text-left
        [&_th]:uppercase
        [&_th:nth-child(1)]:w-10
        [&_th:nth-child(7)]:w-16
        "
    size="compact"
    {rows}
    sortable
    bind:sortKey
    bind:sortDirection
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar>
      <ToolbarContent>
        <div class="flex items-center justify-center gap-4">
          <Button on:click={onClickAdd} icon={Add}>Add new blacklist entry</Button>
        </div></ToolbarContent
      >
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'id'}
        {row.url}
      {:else if cell.key === 'createdAt'}
        {getCorrectDateFormat(row.createdAt)}
      {:else}
        <div class="flex items-center justify-end gap-1">
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
      {/if}
    </svelte:fragment>
  </DataTable>
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
        <div class="absolute bottom-1 right-72">
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

  <Modal
    class="w-full h-full"
    preventCloseOnClickOutside
    primaryButtonText="Save"
    secondaryButtonText="Close"
    primaryButtonDisabled={$isSubmitting}
    primaryButtonIcon={$isSubmitting ? InlineLoading : undefined}
    on:click:button--secondary={() => {
      addEditBlacklistModalOpen = false;
    }}
    on:click:button--primary={() => {
      handleSubmit();
    }}
    modalHeading={selectedBlacklist ? 'Edit blacklist' : 'Add new blacklist entry'}
    bind:open={addEditBlacklistModalOpen}
  >
    <form use:form>
      <FormGroup>
        <TextInput
          name="url"
          labelText="URL/IP/DOMAIN"
          invalidText={$errors?.url?.join(', ')}
          invalid={!!$errors.url}
        />
      </FormGroup>
    </form>
  </Modal>
</div>
<WarningModal
  class="h-full w-full"
  open={blacklistToDelete !== null && blacklistToDelete !== undefined}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this?"
  secondMessage="This action cannot be undone."
  primaryButtonDisabled={deletingBlacklist}
  primaryButtonIcon={deletingBlacklist ? InlineLoading : null}
  on:submit={doDelete}
  on:closeModal={() => (blacklistToDelete = null)}
/>
