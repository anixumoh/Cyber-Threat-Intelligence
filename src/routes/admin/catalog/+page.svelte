<script lang="ts">
  import Client from '$lib/client';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { IncidentCatalog } from '$lib/types/admin';
  import { scrollToTop } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import roleStore from '$stores/role';
  import {
    Button,
    DataTable,
    InlineLoading,
    Pagination,
    Toolbar,
    ToolbarContent,
    ToolbarSearch,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { CaretUp, Download, Settings, TrashCan, Upload } from 'carbon-icons-svelte';
  import * as FileSaver from 'file-saver';
  import { onMount } from 'svelte';
  import CatalogSettingsModal from './CatalogSettingsModal.svelte';
  import UploadCatalogModal from './UploadCatalogModal.svelte';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'name', value: 'NAME', sort: () => 0 },
    { key: 'id', value: 'UPLOADED', sort: () => 0 },
    { key: 'actions', empty: true }
  ];

  onMount(() => {
    mounted = true;
    return () => client.abort();
  });

  let mounted = false;
  let openUploadModal = false;
  let openSettingsModal = false;
  let openDeleteConfirmation = false;
  let selectedCatalogId: number;
  let isDeleting = false;

  let sortKey: string;
  let sortDirection: DataTableProps['sortDirection'] = 'none';

  let search = '';
  let loading = false;
  let rows: IncidentCatalog[] = [];
  let page = 1;
  let totalItems = 0;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let searchValue = '';
  let searchDebounce: ReturnType<typeof setTimeout>;

  $: onChangeSearch(searchValue);
  function onChangeSearch(value: string) {
    if (value === '' || value.length >= 3) {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        search = value;
        page = 1;
      }, 1000);
    }
  }

  $: customerId = $roleStore.superadmin || $roleStore.master ? null : $roleStore.customerId;
  $: mounted && getIncidentCatalogs(page, pageSize, search, sortDirection, sortKey);
  $: if (page > 1 && rows.length === 0 && !loading) page = 1;

  async function reload() {
    await getIncidentCatalogs(page, pageSize, search, sortDirection, sortKey);
  }

  async function getIncidentCatalogs(
    page: number,
    maxRows: number,
    search: string,
    sortDirection: DataTableProps['sortDirection'],
    sortKey: string
  ) {
    loading = true;
    const response = await client.admin.getIncidentCatalogs({
      page,
      maxRows,
      search,
      customerId,
      sortDirection,
      sortKey
    });
    rows = response.content;
    totalItems = response.totalElements;
    loading = false;
  }

  async function downloadCatalog(catalogId: number, fileName: string) {
    const blob = await client.admin.downloadCatalog(catalogId);
    FileSaver.saveAs(blob, `${fileName}.xlsx`);
  }

  function openDeleteModal(catalogId: number) {
    selectedCatalogId = catalogId;
    openDeleteConfirmation = true;
  }

  async function deleteSelectedCatalog() {
    isDeleting = true;
    await client.admin.deleteCatalog(selectedCatalogId);
    isDeleting = false;
    openDeleteConfirmation = false;
    await reload();
  }
</script>

<h4>Incidents Catalog</h4>

<div class="relative overflow-x-auto">
  <DataTable
    id="catalog-list"
    class="pb-5
    [&_th:nth-child(3)]:w-fit
    {loading ? '[&>table]:opacity-20 select-none' : ''}"
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
        <ToolbarSearch bind:value={searchValue} data-testid="search-catalog" class="max-w-md" />
        <Button icon={Upload} on:click={() => (openUploadModal = true)}>Upload new catalog</Button>
        <Button on:click={() => (openSettingsModal = true)} kind="tertiary" icon={Settings}>Settings</Button>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'actions'}
        <div class="flex items-center justify-end gap-1.5">
          <Button
            on:click={() => downloadCatalog(row.id, row.name)}
            size="small"
            kind="tertiary"
            icon={Download}
            data-testid="download-catalog">Download</Button
          >
          {#if row.name !== 'Blueliv Default' && row.associated === 0}
            <Button
              on:click={() => openDeleteModal(row.id)}
              size="small"
              kind="danger-tertiary"
              icon={TrashCan}
              data-testid="delete-catalog"
            >
              Delete
            </Button>
          {/if}

          {#if row.name !== 'Blueliv Default' && row.associated > 0}
            <TooltipDefinition
              class="[&>div]:w-80 [&>div]:max-w-[80rem]"
              tooltipText="This catalog is being used by an organization. Go to settings and remove the association of this catalog to the
organization"
              align="end"
              direction="top"
            >
              <Button disabled size="small" kind="danger-tertiary" icon={TrashCan} data-testid="delete-catalog">
                Delete
              </Button>
            </TooltipDefinition>
          {/if}
        </div>
      {:else if cell.key === 'id'}
        <div class="flex items-center justify-center">
          {row.created}
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
      <Pagination class="mb-10" bind:pageSize bind:page {totalItems} {pageSizes} />
      <div class="absolute bottom-1 right-60">
        <Button
          on:click={scrollToTop}
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

<UploadCatalogModal bind:open={openUploadModal} on:save={reload} />
<CatalogSettingsModal bind:open={openSettingsModal} />

<WarningModal
  bind:open={openDeleteConfirmation}
  modalHeading="Delete"
  question="You are about to delete a catalog, this action cannot be undone. Download the catalog before removing to keep a copy in case you need it in the future."
  secondMessage="Do you want to proceed?"
  on:submit={deleteSelectedCatalog}
  on:closeModal={() => (openDeleteConfirmation = false)}
  primaryButtonIcon={isDeleting ? InlineLoading : undefined}
  primaryButtonDisabled={isDeleting}
/>
