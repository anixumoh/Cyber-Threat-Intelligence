<script lang="ts">
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import type { Rss } from '$lib/types/settings';
  import Client from '$lib/client';
  import { currentOrganizationId } from '$stores/organization';
  import { currentModule } from '$stores/module';
  import preferencesStore from '$stores/preferences';
  import HeadOverTable from '$lib/components/Settings/HeadOverTable.svelte';
  import roleStore from '$stores/role';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import { AddAlt, Edit, TrashCan } from 'carbon-icons-svelte';
  import { DataTable, DataTableSkeleton, InlineLoading } from 'carbon-components-svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import EnableDisable from '$lib/components/EnableDisable/EnableDisable.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import type Module from '$lib/types/module';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import axios from 'axios';
  import { handleGenericResponse } from '$lib/utils/error';

  const client = new Client();

  let isLoading = false;
  let page = 1;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let totalResources = 0;
  let rows: Rss[] = [];
  let deleteConfirmation = false;
  let isDeleting = false;
  let deletingRssId: number;
  let headers: DataTableHeader[] = [];

  $: headers = [
    { key: 'name', value: 'NAME' },
    { key: 'url', value: 'URL' },
    { key: 'rssFeedTypeName', value: 'RSS TYPE', width: '150px' },
    { key: 'createdAt', value: 'CREATION DATE', display: getHumanReadableDate, width: '150px' },
    { key: 'processed', value: 'PROCESSED', display: getHumanReadableDate, width: '100px' },
    { key: 'enabled', value: 'ENABLED', width: '80px' },
    ...(canAddOrEdit
      ? [
          { key: 'edit', value: 'EDIT', width: '70px' },
          { key: 'delete', value: 'DELETE', width: '70px' }
        ]
      : [])
  ];

  $: numPages = Math.ceil(totalResources / maxRows);
  $: getRss($currentOrganizationId, $currentModule, page, maxRows);
  $: canAddOrEdit = !($roleStore.customer || $roleStore.operator);

  async function getRss(orgId: number, module: Module, page: number, total: number) {
    isLoading = true;
    const response = await client.settings.getRss(orgId, module, page, total);
    totalResources = response.total;
    rows = response.values;
    isLoading = false;
  }

  function onDeleteRss(rssId: number) {
    deletingRssId = rssId;
    deleteConfirmation = true;
  }

  async function onDelete() {
    isDeleting = true;
    try {
      await client.settings.deleteRss($currentOrganizationId, $currentModule, deletingRssId);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleGenericResponse(error.response.data);
      }
    }
    isDeleting = false;
    deleteConfirmation = false;
    if (page !== 1) {
      page = 1;
    } else {
      getRss($currentOrganizationId, $currentModule, page, maxRows);
    }
  }

  async function toggleEnable(rssId: number) {
    const rss = rows.find((r) => r.id === rssId);
    if (!rss) return;
    rss.enabled = !rss.enabled;
    rows = rows;

    try {
      await client.settings.toggleRssEnable($currentOrganizationId, $currentModule, rss.id, rss.enabled);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        handleGenericResponse(error.response.data);
      }
    }
  }
</script>

<HeadOverTable
  title="RSS"
  hideSearch
  {maxRows}
  on:changeSelected={(event) => {
    maxRows = +event.detail;
    page = 1;
  }}
>
  <svelte:fragment slot="action-buttons">
    {#if canAddOrEdit}
      <GenericButton
        href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/rss/new"
      >
        <AddAlt />
        <span class="ml-1">Add RSS</span>
      </GenericButton>
    {/if}
  </svelte:fragment>
</HeadOverTable>

{#if isLoading}
  <DataTableSkeleton rows={10} showHeader={false} showToolbar={false} />
{:else if rows.length}
  <DataTable id="rss-table" class="[&_td]:!bg-transparent [&_th]:text-left" {headers} {rows}>
    <svelte:fragment slot="cell" let:row let:cell>
      {#if cell.key === 'name'}
        <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={cell.value}>
          {cell.value}
        </div>
      {:else if cell.key === 'url'}
        <div class="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap" title={cell.value}>
          {cell.value}
        </div>
      {:else if cell.key === 'enabled'}
        <div class="flex justify-center">
          <EnableDisable
            data-test="toggle-enable"
            isEnabled={cell.value}
            disabled={!canAddOrEdit}
            on:click={() => toggleEnable(row.id)}
          />
        </div>
      {:else if cell.key === 'edit'}
        <div class="flex justify-center">
          <GenericButton
            data-test="edit"
            class="text-ctip-primary text-center"
            href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModule.id}/settings/rss/{row.id}/edit"
          >
            <Edit />
          </GenericButton>
        </div>
      {:else if cell.key === 'delete'}
        <div class="flex justify-center">
          <GenericButton data-test="delete" class="text-ctip-danger" on:click={() => onDeleteRss(row.id)}>
            <TrashCan />
          </GenericButton>
        </div>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
  {#if numPages > 1}
    <div class="flex items-center">
      <ResponsivePageNavigation loading={isLoading} total={numPages} bind:page />
    </div>
  {/if}
{:else}
  <EmptyData messageObj={{ msg: 'There are no RSS' }} />
{/if}

<WarningModal
  bind:open={deleteConfirmation}
  modalHeading="Confirmation"
  question="Are you sure you want to delete this rss?"
  secondMessage="This action cannot be undone."
  on:submit={onDelete}
  on:closeModal={() => (deleteConfirmation = false)}
  primaryButtonDisabled={isDeleting}
  primaryButtonIcon={isDeleting ? InlineLoading : undefined}
/>
