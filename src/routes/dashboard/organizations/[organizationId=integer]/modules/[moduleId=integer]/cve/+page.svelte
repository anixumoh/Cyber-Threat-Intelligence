<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import type { CVE, DownloadAllCVEInput, PriorityCVE } from '$lib/client/services/malware';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import ExplorerFilter from '$lib/components/Filter/ExplorerFilter.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import ResourceLabelModal from '$lib/components/ResourceLabelModal.svelte';
  import ScoreCve from '$lib/components/ScoreCve.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { pageSizes } from '$lib/constants/pagination';
  import type { SortType } from '$lib/types';
  import type { FilterExplorerType } from '$lib/types/explorer';
  import { getHumanReadableDate, getSinceOrToDate } from '$lib/utils/functions';
  import critical from '$src/assets/priority-images/critical.svg';
  import major from '$src/assets/priority-images/major.svg';
  import medium from '$src/assets/priority-images/medium.svg';
  import minor from '$src/assets/priority-images/minor.svg';
  import trivial from '$src/assets/priority-images/trivial.svg';
  import { PaginationStatus } from '$stores/createPaginationStore';
  import menuExpandedStore from '$stores/menuExpanded';
  import { currentModule, modulesStore } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganization } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import userStore from '$stores/user';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Modal,
    OverflowMenu,
    OverflowMenuItem,
    Pagination,
    RadioTile,
    TileGroup,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { CaretUp, Export, NewTab, TagGroup, TrashCan, ViewFilled, ViewOffFilled } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { onMount } from 'svelte';
  import CVEDetailsModal from './CVEDetailsModal.svelte';
  import cvePagination from './cvePaginationStore';

  const headers: DataTableHeader[] = [
    { key: 'cve', value: 'CVE', sort: false },
    { key: 'scoring', value: 'SCORE' },
    { key: 'countAffectedPlatforms', value: 'AFFECTED PLATFORMS', sort: false },
    { key: 'vendor', value: 'VENDOR', sort: false },
    { key: 'product', value: 'PRODUCT', sort: false },
    { key: 'version', value: 'VERSION', sort: false },
    { key: 'cpe', value: 'CPE', sort: false, width: '250px' },
    { key: 'publishedAt', value: 'DATE', display: getHumanReadableDate },
    { key: 'priority', value: 'RISK', sort: false }
  ];

  type RiskType = {
    key: PriorityCVE;
    name: string;
    value: number;
    img: string;
  };

  const RISK_TYPES: RiskType[] = [
    { key: 'TRIVIAL', name: 'Trivial', value: 0, img: trivial },
    { key: 'MINOR', name: 'Minor', value: 1, img: minor },
    { key: 'MEDIUM', name: 'Medium', value: 2, img: medium },
    { key: 'MAJOR', name: 'Major', value: 3, img: major },
    { key: 'CRITICAL', name: 'Critical', value: 4, img: critical }
  ];

  const {
    paginationPage,
    paginationResult,
    paginationForm,
    paginationTotalPages,
    setForm,
    paginationStatus,
    updatePageResult
  } = cvePagination;

  const client = new Client();
  let sheet: HTMLStyleElement;
  let mounted = false;

  $: $paginationPage = $paginationForm?.page || 1;
  $: appliedFielters = calculateHowManyFiltersAreApplied($paginationForm);

  onMount(() => {
    sheet = document.createElement('style');
    document.body.appendChild(sheet);
    initData();
    mounted = true;
    return () => {
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  let selectedRowIds = [];
  let exportAllModal = false;
  let exportAllLoading = false;
  let loadingExportSelected = false;
  let removeModalOpen = false;
  let removingCveLoading = false;
  let cveDetailsModalOpen = false;
  let selectedCveId: number;
  let selectedCVEs: CVE[] = [];
  let isLabelsModalOpen = false;
  let savingPriority = false;
  let changePriorityModalOpen = false;
  let selectedPriority: string;
  let innerWidth: number;

  $: maxToolbarSize = innerWidth - ($menuExpandedStore ? 285 : 110);
  $: loading = $paginationStatus === PaginationStatus.LOADING;
  $: browser && +$page.url.searchParams.get('id') && openDetails(+$page.url.searchParams.get('id'));
  $: currentLandingPage = `${$currentOrganization.name},${$currentOrganization.id},Explorer,${$currentModule.id}`;
  $: isDefaultLanding = $userStore?.landingPage === currentLandingPage;

  $: tcModule = $modulesStore?.find((mod) => mod.moduleName === MODULE_NAME.THREAT_CONTEXT);
  $: tcModuleId = tcModule?.id;
  $: isContracted = !!tcModule;

  // Table color of not read rows
  const notReadColor = COLORS.bgRowTables;
  $: notReads = $paginationResult?.list?.filter((row) => !row.read).map((row) => row.id);
  $: readSelectors = notReads?.map((id) => `#explorer-table tr[data-row="${id}"]:not(.bx--data-table--selected) td`);
  $: customStyle = readSelectors?.length ? `${readSelectors?.join(',\n')} {background-color: ${notReadColor}}` : '';
  $: if (mounted && sheet) sheet.innerHTML = `${customStyle}`;

  async function reloadCVEs() {
    setForm($paginationForm, true);
  }

  function initData() {
    const explorerPreferences = $preferencesStore?.modules?.[$currentOrganization.id]?.[$currentModule.id]?.explorer;

    const filters: FilterExplorerType = {
      page: +$page.url.searchParams.get('page') || 1,
      maxRows: $preferencesStore.defaultRows,
      sortKey: undefined,
      sortDirection: 'none',
      read: explorerPreferences?.read ?? 0,
      q: explorerPreferences?.q ?? '',
      selectedTerms: explorerPreferences?.terms?.split(',')?.map(Number) ?? [],
      selectedRisk: explorerPreferences?.priority?.split(',')?.map(Number) ?? [],
      startScore: explorerPreferences?.startScore,
      endScore: explorerPreferences?.endScore,
      labels: explorerPreferences?.labels?.split(',').map(Number) ?? [],
      labelsAnd: explorerPreferences?.labelsAnd?.split(',').map(Number) ?? [],
      excludeLabels: explorerPreferences?.excludeLabels?.split(',').map(Number) ?? [],

      ...(explorerPreferences?.since &&
        explorerPreferences?.to && {
          since: dayjs(explorerPreferences.since).toDate(),
          to: dayjs(explorerPreferences.to).toDate(),
          sinceToShow: dayjs(explorerPreferences.since).format('DD/MM/YYYY'),
          toToShow: dayjs(explorerPreferences.to).format('DD/MM/YYYY')
        })
    };

    setForm(filters, true);
  }

  function onClickHeader(e: CustomEvent) {
    const key = e?.detail?.header?.key;
    const direction: SortType = e?.detail?.sortDirection;
    if (!direction) return;
    setForm({
      ...$paginationForm,
      sortDirection: direction,
      sortKey: direction === 'none' ? undefined : key
    });
  }

  async function markAsDefault(landingPage: string) {
    await client.settings.setUserLanding(landingPage);
    $userStore.landingPage = landingPage;
  }

  function getRiskImg(riskKey: PriorityCVE) {
    const risk = RISK_TYPES.find((r) => r.key.toUpperCase() === riskKey.toUpperCase());
    return risk?.img ?? trivial;
  }

  // Actions
  async function changeReadStatus(read: boolean, ids?: number[]) {
    const cveIds = ids || selectedRowIds;
    updatePageResult($paginationPage, (results) => {
      results.list = results.list.map((cve) => (cveIds.includes(cve.id) ? { ...cve, read } : cve));
      return results;
    });
    await client.malware.markAsRead($currentOrganization.id, $currentModule.id, cveIds, read);
    selectedRowIds = [];
  }

  async function exportSelected() {
    loadingExportSelected = true;
    await client.malware.exportCve($currentOrganization.id, $currentModule.id, selectedRowIds);
    loadingExportSelected = false;
    selectedRowIds = [];
  }

  function openExportAll() {
    exportAllModal = true;
  }

  async function exportAll() {
    const theFilters: DownloadAllCVEInput = {
      startScore: $paginationForm.startScore,
      endScore: $paginationForm.endScore,
      q: $paginationForm.q,
      read: $paginationForm.read,
      priority: $paginationForm.selectedRisk.join(','),
      terms: $paginationForm.selectedTerms.join(',')
    };
    exportAllLoading = true;
    selectedRowIds = [];
    try {
      await client.malware.exportAllCve($currentOrganization.id, $currentModule.id, theFilters);
    } catch (error) {
      notifications.notify({
        kind: 'error',
        title: 'Error',
        subtitle: 'An error has ocurred'
      });
    }
    exportAllLoading = false;
    exportAllModal = false;
  }

  async function openNewTab() {
    selectedRowIds.forEach((id) => {
      const cve = $paginationResult.list.find((row) => row.id === id).cve;
      const route = `/dashboard/organizations/${$currentOrganization.id}/modules/${tcModuleId}/threat_context/cves/${cve}/?fromExplorer=true&explorerId=${$currentModule.id}`;
      window.open(route, '_blank');
    });
  }

  async function changePriority(priority: number, specificRowOnly?: string) {
    const ids = specificRowOnly ? [specificRowOnly] : selectedRowIds;
    const risk = RISK_TYPES.find((p) => p.value === priority);
    if (!risk) return;

    updatePageResult($paginationPage, (results) => {
      results.list = results.list.map((cve) => (ids.includes(cve.id) ? { ...cve, priority: risk.key } : cve));
      return results;
    });

    await client.malware.setCvePriority($currentOrganization.id, $currentModule.id, priority, ids);
    selectedRowIds = [];
  }

  function openRemove() {
    removeModalOpen = true;
  }
  async function deleteResources() {
    removingCveLoading = true;
    await client.malware.deleteCve($currentOrganization.id, $currentModule.id, selectedRowIds);
    removingCveLoading = false;
    selectedRowIds = [];
    removeModalOpen = false;

    setForm({ ...$paginationForm, page: 1 }, true);
  }

  function openDetails(id: number) {
    selectedCveId = id;
    cveDetailsModalOpen = true;
  }

  function openChangePriority() {
    changePriorityModalOpen = true;
  }

  function applyFilters(filtersParam: FilterExplorerType) {
    setForm(filtersParam, true);
  }

  function calculateHowManyFiltersAreApplied(filters: FilterExplorerType) {
    if (!filters) return 0;
    let count = 0;
    if (filters.labels.length || filters.labelsAnd.length || filters.excludeLabels.length) count++;
    if (filters.read == 1 || filters.read == 2) count++;
    if (filters.selectedTerms.length) count++;
    if (filters.selectedRisk.length) count++;
    if (filters.startScore || filters.endScore) count++;
    if (filters.since || filters.to) count++;
    return count;
  }

  function openLabelsModal() {
    selectedCVEs = $paginationResult.list.filter((cve) => selectedRowIds.includes(cve.id));
    isLabelsModalOpen = true;
  }

  function scrollToTopOfTable() {
    const target = document.getElementById('explorer-table');
    const yOffset = -50;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    (document.activeElement as HTMLElement)?.blur();
  }

  function getHref(_row: DataTableRow) {
    if (!tcModuleId) return '';
    const cve = _row as CVE;

    const params = new URLSearchParams({
      fromExplorer: 'true',
      selectedcveid: String(cve.id),
      explorerId: String($currentModule.id),
      read: $paginationForm.read,
      sortDirection: $paginationForm.sortDirection,
      p: String($paginationForm.page),
      excludeLabels: $paginationForm.excludeLabels.join(','),
      labels: $paginationForm.labels.join(','),
      labelsAnd: $paginationForm.labelsAnd.join(','),
      maxRows: String($paginationForm.maxRows),
      selectedRisk: $paginationForm.selectedRisk.join(','),
      selectedTerms: $paginationForm.selectedTerms.join(','),
      startScore: String($paginationForm.startScore || ''),
      endScore: String($paginationForm.endScore || ''),
      since: $paginationForm.since ? String(getSinceOrToDate($paginationForm.since).valueOf()) : '',
      to: $paginationForm.to ? String(getSinceOrToDate($paginationForm.to).valueOf()) : '',
      q: $paginationForm.q || ''
    });

    return `/dashboard/organizations/${$currentOrganization.id}/modules/${tcModuleId}/threat_context/cves/${cve.cve}/?${params}`;
  }
</script>

<svelte:window bind:innerWidth />

<ModuleHeading title="THREATS">
  <GenericButton
    kind={isDefaultLanding ? 'primary' : 'tertiary'}
    on:click={() => markAsDefault(isDefaultLanding ? '' : currentLandingPage)}
  >
    Mark as default
  </GenericButton>
</ModuleHeading>

{#if $paginationForm}
  <DataTable
    id="explorer-table"
    sortable
    selectable
    batchSelection
    sortKey={$paginationForm.sortKey}
    sortDirection={$paginationForm.sortDirection}
    on:click:header={onClickHeader}
    bind:selectedRowIds
    class="
    min-w-[900px]
    [&_thead]:sticky [&_thead]:top-[104px] [&_thead]:z-[1]
    [&_td]:align-top [&_td]:pt-4 [&_td]:text-center
    "
    --max-toolbar-width="{maxToolbarSize}px"
    {headers}
    rows={loading ? [] : $paginationResult?.list || []}
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  >
    <Toolbar class="toolbar-content-clip-path-none sticky grid top-14 !z-[5]">
      <ToolbarBatchActions>
        <Button
          on:click={exportSelected}
          disabled={loadingExportSelected}
          title="Export selected"
          icon={loadingExportSelected ? InlineLoading : Export}
        >
          <span class="hidden mr-1 2xl:block">Export selected</span>
        </Button>

        <Button on:click={() => changeReadStatus(true)} title="Mark as Read" icon={ViewFilled}>
          <span class="hidden mr-1 2xl:block">Mark as Read</span>
        </Button>
        <Button on:click={() => changeReadStatus(false)} title="Mark as Unread" icon={ViewOffFilled}>
          <span class="hidden mr-1 2xl:block">Mark as Unread</span>
        </Button>

        {#if isContracted}
          <Button on:click={openNewTab} title="Open new tab" data-test="Open_new_tab" icon={NewTab}>
            <span class="hidden mr-1 2xl:block">Open new tab</span>
          </Button>
        {/if}

        <Button on:click={openChangePriority} title="Change priority" icon={ViewOffFilled}>
          <span class="hidden mr-1 2xl:block">Change priority</span>
        </Button>

        <Button on:click={openLabelsModal} class="flex items-center justify-center" title="Labels" icon={TagGroup}>
          <span class="hidden mr-1 2xl:block">Labels</span>
        </Button>

        <Button
          on:click={openRemove}
          title="Delete"
          iconDescription="Delete"
          data-test="Delete_Result_Modal"
          kind="danger"
          icon={TrashCan}
        >
          <span class="hidden mr-1 2xl:block">Delete</span>
        </Button>
      </ToolbarBatchActions>

      <ToolbarContent>
        <div class="flex justify-between w-full">
          <ToolbarMenu data-testid="toolbar-menu" class="[&_ul]:!left-0">
            <ToolbarMenuItem on:click={openExportAll} primaryFocus>Export All</ToolbarMenuItem>
          </ToolbarMenu>

          <div class="flex justify-center items-center">
            <ExplorerFilter
              filtersCount={appliedFielters}
              allFilters={$paginationForm}
              on:apply-filters={(e) => {
                applyFilters(e.detail);
              }}
            />
          </div>
        </div>
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell-header" let:header>
      {#if header.key === 'countAffectedPlatforms'}
        <TooltipDefinition tooltipText="Platforms affected by a specific vulnerability">
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else}
        {header.value}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'scoring'}
        <ScoreCve score={cell.value} />
      {:else if cell.key === 'cve'}
        <div class="flex flex-col justify-start align-middle">
          <GenericButton
            class="bg-transparent text-ctip-interactive hover:text-ctip-hover-interactive"
            on:click={(e) => {
              changeReadStatus(true, [row.id]);
              if (!tcModuleId) {
                e.preventDefault();
                openDetails(row.id);
              }
            }}
            href={getHref(row)}
          >
            {cell.value}
          </GenericButton>
          <div class="ml-2 mt-1 mb-2 flex max-w-[800px] w-max flex-wrap gap-1">
            {#each row.labels as label}
              <LabelItem {label} />
            {/each}
          </div>
        </div>
      {:else if cell.key === 'cpe'}
        <div title={cell.value} class="overflow-hidden text-ellipsis">
          {cell.value}
        </div>
      {:else if cell.key === 'priority'}
        <OverflowMenu class="mx-auto" data-test="risk-select" flipped on:click={(event) => event.stopPropagation()}>
          <svelte:fragment slot="menu">
            <img class="w-5" src={getRiskImg(cell.value)} alt="" />
          </svelte:fragment>
          {#each RISK_TYPES as risk}
            <OverflowMenuItem
              data-test="risk-option"
              on:click={() => {
                changePriority(risk.value, row.id);
              }}
            >
              <div class="flex">
                <img class="w-4 mr-2" alt="" src={risk.img} />
                <span>{risk.name}</span>
              </div>
            </OverflowMenuItem>
          {/each}
        </OverflowMenu>
      {:else}
        {cell.display ? cell.display(cell.value) : cell.value}
      {/if}
    </svelte:fragment>
  </DataTable>
{/if}

{#if loading}
  <DataTableSkeleton class="[&_thead]:hidden" rows={10} showHeader={false} showToolbar={false} />
{:else if $paginationResult?.list?.length <= 0}
  <EmptyData messageObj={{ msg: 'There are no resources' }} />
{:else if $paginationTotalPages > 1}
  <div class="sticky bottom-0">
    <div>
      <Pagination
        class="mb-10"
        bind:pageSize={$paginationForm.maxRows}
        bind:page={$paginationForm.page}
        totalItems={$paginationTotalPages}
        {pageSizes}
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
{/if}

<div use:modalTeleport>
  <WarningModal
    bind:open={exportAllModal}
    modalHeading="Export to All"
    primaryButtonText="Export"
    secondaryButtonText="Cancel"
    question="Remember that there is a maximum of 5000 exportable rows."
    secondMessage="This process could take more than one minute."
    primaryButtonIcon={exportAllLoading && InlineLoading}
    primaryButtonDisabled={exportAllLoading}
    on:submit={exportAll}
    on:closeModal={() => (exportAllModal = false)}
  />
  <WarningModal
    bind:open={removeModalOpen}
    modalHeading="Remove resource / resources"
    primaryButtonText="Yes"
    secondaryButtonText="No"
    question="Are you sure you want to remove the selected resource / resources?"
    secondMessage="This action cannot be undone."
    primaryButtonIcon={removingCveLoading && InlineLoading}
    primaryButtonDisabled={removingCveLoading}
    on:submit={deleteResources}
    on:closeModal={() => (removeModalOpen = false)}
  />
  <ResourceLabelModal on:save={reloadCVEs} bind:open={isLabelsModalOpen} resources={selectedCVEs} />
  <CVEDetailsModal
    cveId={selectedCveId}
    bind:open={cveDetailsModalOpen}
    on:save={reloadCVEs}
    on:cveIsRead={(event) => changeReadStatus(true, [event.detail])}
  />

  <Modal
    primaryButtonText="Change"
    secondaryButtonText="Close"
    primaryButtonIcon={savingPriority ? InlineLoading : undefined}
    on:click:button--secondary={() => (changePriorityModalOpen = false)}
    on:click:button--primary={async () => {
      savingPriority = true;
      try {
        await changePriority(+selectedPriority);
      } finally {
        savingPriority = false;
        selectedPriority = undefined;
        changePriorityModalOpen = false;
      }
    }}
    primaryButtonDisabled={!selectedPriority || savingPriority}
    size="xs"
    bind:open={changePriorityModalOpen}
    modalHeading="Change priority"
    class="[&>div]:min-h-[500px]"
  >
    <TileGroup bind:selected={selectedPriority}>
      {#each RISK_TYPES as risk}
        <RadioTile class="m-0" value={String(risk.value)}>
          <img class="w-4 mr-2" alt="" src={risk.img} />
          <span>{risk.name}</span>
        </RadioTile>
      {/each}
    </TileGroup>
  </Modal>
</div>

<style>
  :global(.bx--table-toolbar) {
    max-width: var(--max-toolbar-width);
  }
</style>
