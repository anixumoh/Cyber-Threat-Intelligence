<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import CommonModal from '$lib/components/CommonModal/CommonModal.svelte';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import IncidentModal from '$lib/components/IncidentModal.svelte';
  import ResourceLabelModal from '$lib/components/ResourceLabelModal.svelte';
  import TooltipWrap from '$lib/components/TooltipWrap.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { MODULE_NAME } from '$lib/constants/modules';
  import { pageSizes } from '$lib/constants/pagination';
  import { NOT_AVAILABLE } from '$lib/constants/text';
  import type { SortType, TlpType } from '$lib/types';
  import type { Resource } from '$lib/types/resource';
  import { AnalysisCalcResultType } from '$lib/types/threat';
  import { headersAllThreats, headersObj, modulesWithUrl } from '$lib/utils/headersThreats';
  import { parseThreatMalwarePreview } from '$lib/utils/parseData';
  import threatsFilterStore from '$stores/filters';
  import menuExpandedStore from '$stores/menuExpanded';
  import notifications from '$stores/notification';
  import roleStore from '$stores/role';
  import threatsStore from '$stores/threats';
  import {
    Button,
    CodeSnippet,
    CopyButton,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Pagination,
    Toolbar,
    ToolbarBatchActions,
    ToolbarContent,
    ToolbarMenu,
    ToolbarMenuItem,
    TooltipDefinition
  } from 'carbon-components-svelte';
  import ThreatsTitle from '$lib/components/ThreatsCommons/ThreatsTitle/ThreatsTitle.svelte';
  import StarRating from '$lib/components/StarRating/index.svelte';
  import Inform from '$lib/components/Inform/Inform.svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import Favorite from '$lib/components/Favorite/Favorite.svelte';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import Severity from '$lib/components/ThreatsCommons/Severity/index.svelte';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import {
    ArrowsHorizontal,
    CheckboxCheckedFilled,
    CheckboxIndeterminateFilled,
    Export,
    NewTab,
    TagGroup,
    TrashCan,
    ViewFilled,
    ViewOffFilled,
    WarningAlt,
    WarningAltFilled,
    WarningFilled,
    CaretUp
  } from 'carbon-icons-svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import ChangeResourceRelevanceModal from '../ChangeResourceRelevanceModal.svelte';
  import ExternalLink from '../ExternalLink/ExternalLink.svelte';
  import MoveResources from '../MoveResources/MoveResources.svelte';
  import ViewDetails from '../ViewDetails.svelte';
  import FiltersButton from './FiltersButton.svelte';

  const { danger, gray } = COLORS;
  const dispatch = createEventDispatcher();
  const client = new Client();

  export let sortable = true;
  export let selectable = true;
  export let batchSelection = true;
  export let isAllThreats = false;

  $: headers = isAllThreats ? headersAllThreats : headersObj[$currentModule.moduleName];

  let sheet: HTMLStyleElement;
  let selectedThreads = [];
  let incidentsModalOpen = false;
  let sortKey: string;
  let sortDirection: SortType;
  let filterMenuOpen = false;
  let innerWidth: number = 0;
  let searchExpanded = false;
  let search = '';
  let searchTimeout: ReturnType<typeof setTimeout>;

  // Actions
  let openExportAllResources = false;
  let exportAllLoading = false;
  let loadingExportSelected = false;
  let openLabelsModal = false;
  let moveResourceOpen = false;
  let changeRelevanceOpen = false;
  let openDeleteResources = false;
  let openDeleteConfirmation = false;
  let openIsBlockConfirmation = false;
  let openBlockAllConfirmation = false;
  let isDeleting = false;
  let destroyed = false;
  onMount(() => {
    sheet = document.createElement('style');
    document.body.appendChild(sheet);
    return () => {
      destroyed = true;
      document.body.removeChild(sheet);
      client.abort();
    };
  });

  async function onUpdateStars(rating: number, resourceId: number, moduleId: number, moduleName: string) {
    await client.threats.updateStars(
      rating,
      resourceId,
      $currentOrganization.id,
      moduleId || $currentModule.id,
      moduleName || $currentModule?.moduleName
    );
    $threatsStore?.selectedForDetails?.rating && ($threatsStore.selectedForDetails.rating = rating);
    const index = $threatsStore.resources.findIndex((r) => r.resourceId === resourceId);
    if (index === -1) return;
    $threatsStore.resources[index] = {
      ...$threatsStore.resources[index],
      userModified: true,
      rating
    };
  }

  async function onUpdateTLP(tlpStatus: TlpType, resourceId: number, moduleId: number, moduleType: string) {
    await client.threats.updateTLP(
      tlpStatus,
      resourceId,
      $currentOrganization.id,
      moduleId || $currentModule.id,
      moduleType || $currentModule?.moduleName
    );
    const index = $threatsStore.resources.findIndex((r) => r.resourceId === resourceId);
    if (index === -1) return;
    $threatsStore.resources[index] = {
      ...$threatsStore.resources[index],
      userModified: true,
      tlpStatus
    };
  }

  async function onMarkAsFav(isFavorite: boolean, resourceId: number, moduleId: number, moduleType: string) {
    await client.threats.markAsFav(
      isFavorite,
      resourceId,
      $currentOrganization.id,
      moduleId || $currentModule.id,
      moduleType || $currentModule?.moduleName
    );
    const index = $threatsStore.resources.findIndex((r) => r.resourceId === resourceId);
    if (index === -1) return;
    $threatsStore.resources[index] = {
      ...$threatsStore.resources[index],
      userModified: true,
      favorite: isFavorite ? 'NOT_STARRED' : 'USER_STARRED'
    };
  }

  function getResourceUrl(row: any) {
    const resource = row as Resource;
    const moduleId = resource?.moduleId || $currentModule?.id;
    const params = isAllThreats ? '?from=allThreats' : '';
    const moduleType = resource?.moduleType || $currentModule?.moduleName;

    if (moduleType === MODULE_NAME.MALWARE) {
      return `/dashboard/organizations/${$currentOrganization.id}/modules/${moduleId}/resource/malware/${resource.resourceId}${params}`;
    }
    return `/dashboard/organizations/${$currentOrganization.id}/modules/${moduleId}/resource/${resource.resourceId}${params}`;
  }

  function onChangeSearch(q: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if ($threatsFilterStore.q !== q && ($threatsFilterStore.q || q)) {
        $threatsFilterStore.page = 1;
        $threatsFilterStore.q = q;
      }
    }, 500);
  }

  async function openPreview(data: any) {
    const tag = document.activeElement.tagName.toUpperCase();
    if (tag === 'A' || tag === 'BUTTON') return;

    const { resourceId } = data as Resource;
    $threatsStore.selectedForDetails = data;
    $threatsStore.isLoadingDetails = true;
    $threatsStore.isOpenDetails = true;
    await threatsStore.loadThreat(
      $currentOrganization.id,
      $threatsStore.selectedForDetails.moduleId,
      $threatsStore.selectedForDetails.moduleType,
      resourceId
    );

    if ($threatsStore.selectedForDetails.moduleType === MODULE_NAME.MALWARE) {
      $threatsStore.isLoadingDetails = true;
      const requests = [];
      ['shared', 'basic-info'].forEach((infoKey) => {
        requests.push(
          client.threats.getResourceMalware(
            $currentOrganization.id,
            $threatsStore.selectedForDetails.moduleId,
            $threatsStore.selectedForDetails.moduleType,
            resourceId,
            infoKey
          )
        );
      });
      const [shared, basicInfo] = await Promise.all(requests);
      $threatsStore.selectedForDetails = {
        ...$threatsStore.selectedForDetails,
        ...parseThreatMalwarePreview(shared.data, basicInfo.data)
      };
      $threatsStore.isLoadingDetails = false;
    }
  }

  function openIncidentModal(threats: any[]) {
    selectedThreads = threats;
    incidentsModalOpen = true;
  }

  function onClickHeader(e: CustomEvent) {
    const key = e?.detail?.header?.key;
    const direction: SortType = e?.detail?.sortDirection;
    const directionMap = {
      ascending: 'ASC',
      descending: 'DESC'
    };
    if (key && direction) {
      dispatch('sort', { key, mode: directionMap[direction] });
    }
    sortKey = direction === 'none' ? undefined : key;
    sortDirection = direction;
  }

  async function refreshList() {
    $threatsFilterStore.forceUpdate++;
  }

  function onShowNotImportants() {
    $threatsFilterStore.filters.analysisCalcResult = [AnalysisCalcResultType.NOT_IMPORTANT];
    threatsStore.restoreResourcesForLater();
  }

  function setSelectedResources(selectedRowIds: string[], resources: any[]) {
    const thisPageSelected = resources.filter((resource) => selectedRowIds.includes(resource.id));
    const thisPageIds = resources?.map?.((resource) => resource.id);
    $threatsStore.selectedResources = $threatsStore?.selectedResources
      ?.filter((resource) => !thisPageIds.includes(resource.id))
      .concat(thisPageSelected);
    return $threatsStore.selectedResources?.map?.((resource) => resource.resourceId);
  }

  // TOOLBAR ACTIONS
  function exportAll() {
    openExportAllResources = true;
  }
  async function onExportAll() {
    exportAllLoading = true;
    await client.threats.getExportAllThreatsResources($currentOrganization.id, $currentModule.id, $threatsFilterStore);
    exportAllLoading = false;
    openExportAllResources = false;
  }

  async function exportSelected() {
    loadingExportSelected = true;
    try {
      await client.threats.exportSelectedFile(
        selectedThreadIds,
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName
      );
    } finally {
      loadingExportSelected = false;
    }
  }

  function openLabelModal() {
    openLabelsModal = true;
  }
  function onLabelSave(event) {
    const isModified = event.detail.addedIds.length || event.detail.removedIds.length;
    $threatsStore.resources = $threatsStore.resources.map((resource) => {
      if ($threatsStore.selectedRowIds.includes(resource.id)) {
        const resourceLabelIds = resource.labels.map((label) => label.id);
        const labelsToInclude = event.detail.added.filter((label) => !resourceLabelIds.includes(label.id));
        resource.labels = [
          ...labelsToInclude,
          ...resource.labels.filter((label) => !event.detail.removedIds.includes(label.id))
        ];
        if (isModified) {
          resource.userModified = true;
        }
      }
      return resource;
    });
  }

  function openIncidentModalToolbar() {
    selectedThreads = $threatsStore.selectedResources;
    incidentsModalOpen = true;
  }

  async function markAsReadOrUnread(isRead: boolean) {
    try {
      client.threats.markAsRead(
        selectedThreadIds,
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName,
        isRead
      );
      const tmp = $threatsStore.resources.map((resource: any) => {
        return {
          ...resource,
          ...($threatsStore.selectedRowIds.includes(resource.id) ? { read: isRead } : {})
        };
      });
      $threatsStore.resources = tmp;
    } finally {
      $threatsStore.selectedRowIds = [];
    }
  }

  function openMoveResource() {
    moveResourceOpen = true;
  }

  function openNewTab() {
    client.threats.openBlankedResources(selectedThreadIds, $currentOrganization.id, $currentModule.id);
  }

  function openChangeRelevance() {
    changeRelevanceOpen = true;
  }

  function openDeleteResourcesModal() {
    if (
      $currentModule.moduleName !== MODULE_NAME.CREDENTIAL &&
      $currentModule.moduleName !== MODULE_NAME.MALWARE &&
      $currentModule.moduleName !== MODULE_NAME.CREDIT_CARD &&
      $threatsStore.selectedRowIds.length === 1
    ) {
      openDeleteResources = true;
    } else {
      openDeleteConfirmation = true;
    }
  }

  async function onDeleteResources() {
    try {
      isDeleting = true;

      await client.threats.deleteResources(
        selectedThreadIds,
        $currentOrganization.id,
        $currentModule.id,
        $currentModule.moduleName
      );

      notifications.notify({
        kind: 'success',
        title: 'Resources were succesfully deleted'
      });
      $threatsStore.selectedRowIds = [];
      isDeleting = false;
      openDeleteConfirmation = false;
      await refreshList();
    } catch (error) {
      isDeleting = false;
      notifications.notify({
        kind: 'error',
        title: error
      });
    }
  }
  function onTemporalDelete() {
    openDeleteResources = false;
    openDeleteConfirmation = true;
  }

  function onBlockUrl() {
    openDeleteResources = false;
    openBlockAllConfirmation = true;
  }

  function onBlockDomain() {
    openDeleteResources = false;
    openIsBlockConfirmation = true;
  }

  async function onBlockUrls() {
    try {
      const item = $threatsStore.selectedResources?.[0];
      if (!item) return;
      isDeleting = true;
      const items = [{ url: item.originalUrl, resourcesId: item.resourceId }];
      await client.threats.blockUrls($currentOrganization.id, $currentModule.id, items);
      isDeleting = false;
      openBlockAllConfirmation = false;
      await refreshList();
    } catch (error) {
      isDeleting = false;
      notifications.notify({
        kind: 'error',
        title: error
      });
    }
  }

  async function onBlockDomains() {
    try {
      const item = $threatsStore.selectedResources?.[0];
      if (!item) return;
      isDeleting = true;
      const data = {
        url: item.originalUrl,
        fullDomain: true
      };
      const id = item.resourceId;
      await client.threats.blockDomain(id, $currentOrganization.id, $currentModule.id, data);
      isDeleting = false;
      openIsBlockConfirmation = false;
      await refreshList();
    } catch (error) {
      isDeleting = false;
      notifications.notify({
        kind: 'error',
        title: error
      });
    }
  }
  function scrollToTopOfTable() {
    const target = document.getElementById('threats-table');
    const yOffset = -50;
    const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    (document.activeElement as HTMLElement)?.blur();
  }
  function resetSelectedIdsAndSetToModified() {
    $threatsStore.resources = $threatsStore.resources.map((r) => {
      if ($threatsStore.selectedRowIds.includes(r.id)) {
        r.userModified = true;
      }
      return r;
    });
    $threatsStore.selectedRowIds = [];
  }

  $: onChangeSearch(search);
  $: numPages = Math.ceil($threatsStore.totalResources / $threatsFilterStore.maxRows);

  const notReadColor = COLORS.bgRowTables;
  $: notReads = $threatsStore.resources.filter((resource) => !resource.read).map((resource) => resource.id);
  $: readSelectors = notReads.map((id) => `#threats-table tr[data-row="${id}"]:not(.bx--data-table--selected) td`);
  $: customStyle = readSelectors.length ? `${readSelectors.join(',\n')} {background-color: ${notReadColor}}` : '';

  // for malware
  $: manually = $threatsStore.resources
    .filter((resource) => resource.status && resource.status !== 'ANALYZED')
    .map((resource) => resource.id);
  $: manuallySelectors = manually.map((id) => `#threats-table > table > tbody > tr[data-row="${id}"]`);
  $: manuallyCustomStyle = manuallySelectors.length
    ? `${manuallySelectors.join(',\n')} {pointer-events: none; opacity: 0.4; background-color: ${COLORS.white};}`
    : '';

  $: isOpenDetails = $threatsStore.resources
    ?.filter?.((resource) => $threatsStore.selectedForDetails?.id === resource.id && $threatsStore.isOpenDetails)
    ?.map?.((resource) => resource.id);
  $: isOpenDetailsSelectors = isOpenDetails?.map((id) => `#threats-table > table > tbody > tr[data-row="${id}"]`);
  $: isOpenDetailsCustomStyle = isOpenDetailsSelectors?.length
    ? `${isOpenDetailsSelectors?.join(',\n')} {border-left-style: solid; border-left-width: 4px; border-left-color: ${
        COLORS.primary
      };}`
    : '';

  $: if (sheet) sheet.innerHTML = `${customStyle} ${manuallyCustomStyle} ${isOpenDetailsCustomStyle}`;

  $: selectedThreadIds = setSelectedResources($threatsStore.selectedRowIds, $threatsStore.resources);
  $: maxToolbarSize = innerWidth - ($menuExpandedStore ? 285 : 110);
  $: toDelete =
    $threatsStore.selectedRowIds.length === 1 &&
    $threatsStore.resources.find((resource) => $threatsStore.selectedRowIds.includes(resource.id));
</script>

<svelte:window bind:innerWidth />

<div class="absolute">
  <DataTable
    id="threats-table"
    {sortable}
    {selectable}
    {batchSelection}
    {sortKey}
    {sortDirection}
    {headers}
    rows={$threatsStore.resources}
    bind:selectedRowIds={$threatsStore.selectedRowIds}
    on:click:row={(event) => openPreview(event.detail)}
    class="
      min-w-[900px]
      threats
      [&_thead]:sticky [&_thead]:top-[104px] [&_thead]:z-[1]
      [&_td]:align-top [&_td]:pt-4
      "
    on:click:header={onClickHeader}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
    --max-toolbar-width="{maxToolbarSize}px"
  >
    <Toolbar
      class="toolbar-content-clip-path-none sticky grid top-14 !z-[5]
      {filterMenuOpen ? 'static lg:sticky' : ''}
      "
    >
      <ToolbarBatchActions class="2xl:[&_button]:px-2">
        {#if !$roleStore.customer}
          <Button
            on:click={exportSelected}
            disabled={loadingExportSelected}
            title="Export selected"
            icon={loadingExportSelected ? InlineLoading : Export}
          >
            <span class="hidden mr-1 2xl:block">Export selected</span>
          </Button>
          <Button on:click={openLabelModal} class="flex items-center justify-center" title="Labels" icon={TagGroup}>
            <span class="hidden mr-1 2xl:block">Labels</span>
          </Button>
          <Button on:click={openIncidentModalToolbar} title="Mark as Incident" icon={WarningAlt}>
            <span class="hidden mr-1 2xl:block">Mark as Incident</span>
          </Button>
        {/if}

        <Button on:click={() => markAsReadOrUnread(true)} title="Mark as Read" icon={ViewFilled}>
          <span class="hidden mr-1 2xl:block">Mark as Read</span>
        </Button>
        <Button on:click={() => markAsReadOrUnread(false)} title="Mark as Unread" icon={ViewOffFilled}>
          <span class="hidden mr-1 2xl:block">Mark as Unread</span>
        </Button>

        {#if $roleStore.master || $roleStore.superadmin || $roleStore.analyst}
          <Button on:click={openMoveResource} title="Move to Module" icon={ArrowsHorizontal}>
            <span class="hidden mr-1 2xl:block">Move to Module</span>
          </Button>
        {/if}

        <Button on:click={openNewTab} title="Open new tab" data-test="Open_new_tab" icon={NewTab}>
          <span class="hidden mr-1 2xl:block">Open new tab</span>
        </Button>

        {#if !$roleStore.customer && $currentModule?.moduleName !== MODULE_NAME.CREDENTIAL && $currentModule?.moduleName !== MODULE_NAME.MALWARE}
          <Button on:click={openChangeRelevance} title="Change relevance" data-test="Change_relevance" icon={WarningFilled}>
            <span class="hidden mr-1 2xl:block">Change relevance</span>
          </Button>
        {/if}

        {#if !$roleStore.customer}
          <Button
            on:click={openDeleteResourcesModal}
            title="Delete"
            iconDescription="Delete"
            data-test="Delete_Result_Modal"
            kind="danger"
            icon={TrashCan}
          >
            <span class="hidden mr-1 2xl:block">Delete</span>
          </Button>
        {/if}
      </ToolbarBatchActions>

      <ToolbarContent>
        <div class="flex items-center w-full">
          <div class="mr-auto">
            {#if !isAllThreats}
              <ToolbarMenu data-testid="toolbar-menu" class="[&_ul]:!left-0">
                <ToolbarMenuItem on:click={exportAll} primaryFocus>Export All</ToolbarMenuItem>
              </ToolbarMenu>
            {/if}
          </div>

          <FiltersButton bind:filterMenuOpen bind:search bind:searchExpanded {isAllThreats} />
        </div>
        {#if $threatsStore.isOpenDetails}
          <div class="relative">
            <div class="absolute top-full w-[500px] mt-11 z-40 grid right-0 bg-[var(--cds-layer)] shadow border">
              <ViewDetails />
            </div>
          </div>
        {/if}
      </ToolbarContent>
    </Toolbar>

    <svelte:fragment slot="cell-header" let:header>
      {#if header.key === 'title' && isAllThreats}
        {header.value} ({$threatsStore.totalResources})
      {:else if header.value === 'RELEVANCE'}
        <TooltipDefinition
          tooltipText="TYP: Use Relevance to classify the threat status as informative, positive, negative, or not important."
        >
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else if header.value === 'UPDATED AT'}
        <TooltipDefinition tooltipText="When platform has updated the result because it has changed.">
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else if header.value === 'RATING'}
        <TooltipDefinition tooltipText="User's own rating">
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else if header.value === 'EMAIL'}
        <TooltipDefinition
          tooltipText="Indicates if the username of the credential matches an email configured in the EMAILS settings."
        >
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else if header.value === 'BREACHED AT'}
        <TooltipDefinition tooltipText="When the user was infected. Unknown in case we don't have the date">
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else if header.value === 'CLASSIFICATION'}
        <TooltipDefinition
          tooltipText="Classification based on the settings in the Classify tab (by domain, subdomain or url path)"
        >
          <span class="flex items-center h-12 text-sm font-bold cursor-pointer">
            {header.value}
          </span>
        </TooltipDefinition>
      {:else}
        {header.value}
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="cell" let:cell let:row>
      {#if cell.key === 'title'}
        <ThreatsTitle
          href={getResourceUrl(row)}
          title={row.title}
          labels={row.labels}
          showHand={$currentModule?.moduleName === MODULE_NAME.MALWARE &&
            (row.status !== 'ANALYZED' || row.userSubmited)}
          moduleShortName={row.moduleShortName}
          moduleId={row.moduleId}
          userModified={row.userModified}
          {isAllThreats}
          isManual={row.sourceType === 'MANUAL'}
        />
      {:else if cell.key === 'rating'}
        <div class="flex justify-center text-center">
          <StarRating
            resourceId={row.resourceId}
            rating={row.rating}
            on:setRating={(event) =>
              onUpdateStars(event.detail.rating, event.detail.resourceId, row.moduleId, row.moduleType)}
          />
        </div>
      {:else if cell.key === 'searchPhrase'}
        <div class="break-all text-center">
          {cell.value}
        </div>
      {:else if cell.key === 'relevance'}
        <div class="flex justify-center items-center">
          <Inform
            resource={row}
            status={row.inform}
            isButton
            on:setStatus={(e) => {
              const index = $threatsStore.resources.findIndex((r) => r.id === row.id);
              if (index !== -1) {
                $threatsStore.resources[index].inform = e.detail.status;
                $threatsStore.resources[index].userModified = true;
              }
            }}
          />
        </div>
      {:else if cell.key === 'credential.isEmail'}
        <div class="flex justify-center text-center">
          {#if row.credential?.isEmail}
            <CheckboxCheckedFilled size={24} class="fill-ctip-success" />
          {:else}
            <CheckboxIndeterminateFilled size={24} class="fill-ctip-danger" />
          {/if}
        </div>
      {:else if cell.key === 'actions'}
        <div
          on:keypress={(e) => e.stopPropagation()}
          on:click={(e) => e.stopPropagation()}
          class="flex items-center justify-center gap-3 -mt-4"
        >
          {#if !isAllThreats && modulesWithUrl.includes($currentModule.moduleName)}
            <ExternalLink tooltipText={row.originalUrl} />
            <CopyButton class="w-5 bg-transparent" text={row.originalUrl} />
          {/if}

          {#if !$roleStore.customer}
            <TooltipWithIcon
              tooltipText={row.hasIncident ? 'View incidents' : 'Mark as incident'}
              icon={WarningAltFilled}
              color={`${
                ($currentModule?.moduleName === MODULE_NAME.MALWARE && row.status === 'ANALYZED' && row.hasIncident) ||
                row.hasIncident
                  ? danger
                  : gray
              }`}
              on:click={(event) => {
                event.stopImmediatePropagation();
                openIncidentModal([row]);
              }}
            />
          {/if}

          <Favorite
            isFavorite={row.favorite === 'NOT_STARRED'}
            on:setFavorite={(event) =>
              onMarkAsFav(event.detail.isFavorite, row.resourceId, row.moduleId, row.moduleType)}
          />

          <TooltipWrap direction="top" align="end">
            <span slot="tooltip" class="block w-48">
              TLP: A way to organize secure exchange of TI information with the right audience
            </span>
            <div class="py-2">
              <Tlp
                status={row.tlpStatus}
                on:setTlp={(event) => onUpdateTLP(event.detail.status, row.resourceId, row.moduleId, row.moduleType)}
              />
            </div>
          </TooltipWrap>
        </div>
      {:else if cell.key === 'severity'}
        <Severity severity={row.severity} />
      {:else if cell.key === 'credential.username'}
        {@const username = row?.credential?.username}
        {#if username}
          <div class="overflow-hidden text-ellipsis" title={username}>
            {username}
          </div>
        {:else}
          {NOT_AVAILABLE}
        {/if}
      {:else}
        <div class="flex justify-center text-center">
          {cell.display ? cell.display(row) : cell.value}
        </div>
      {/if}
    </svelte:fragment>
  </DataTable>

  {#if $threatsStore.isLoading}
    <DataTableSkeleton class="[&_thead]:hidden" rows={10} showHeader={false} showToolbar={false} />
  {:else if !$threatsStore.resources.length}
    <EmptyData messageObj={$threatsStore.messageObj} on:showMore={onShowNotImportants} />
  {:else if numPages > 1}
    <div style:max-width="{maxToolbarSize}px" class="sticky bottom-0">
      <div>
        <Pagination
          class="mb-10"
          bind:pageSize={$threatsFilterStore.maxRows}
          bind:page={$threatsFilterStore.page}
          totalItems={$threatsStore.totalResources}
          {pageSizes}
          pagesUnknown
          pageText={(page) => ''}
          itemRangeText={(min, max, total) => `${min}–${max}`}
        />
        <div class="absolute bottom-1 right-48">
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
</div>

<div use:modalTeleport>
  <IncidentModal
    bind:open={incidentsModalOpen}
    resources={selectedThreads}
    on:save={refreshList}
    on:deleteAll={refreshList}
  />
  <ResourceLabelModal bind:open={openLabelsModal} resources={$threatsStore.selectedResources} on:save={onLabelSave} />
  <MoveResources
    bind:open={moveResourceOpen}
    on:setMoveResources={() => {
      moveResourceOpen = false;
      $threatsStore.selectedRowIds = [];
    }}
  />
  <ChangeResourceRelevanceModal
    bind:open={changeRelevanceOpen}
    {selectedThreadIds}
    on:save={resetSelectedIdsAndSetToModified}
  />
  <CommonModal
    bind:open={openDeleteResources}
    passiveModal
    modalHeading="Choose an option"
    primaryButtonText="Yes"
    secondaryButtonText="No"
    on:submit={onDeleteResources}
    on:closeModal={() => (openDeleteResources = false)}
    primaryButtonIcon={isDeleting && InlineLoading}
  >
    <div class="flex flex-col items-center justify-evenly">
      <CodeSnippet data-test="Copy_clipboard" code={toDelete?.originalUrl} />
      <div class="flex justify-around mt-3">
    
        <Button kind="ghost" data-test="Delete_Temporal" on:click={onTemporalDelete}>Temporal Delete</Button>
        <Button kind="ghost" data-test="Delete_Block_Url/subUrl"on:click={onBlockUrl}>Block Url/subUrls</Button>
        <Button kind="ghost" data-test="Delete_Block_entire Domain"on:click={onBlockDomain}>Block entire Domain</Button>
      </div>
    </div>
  </CommonModal>

  <WarningModal
    bind:open={openBlockAllConfirmation}
    modalHeading="Block domain / domains"
    question="Are you sure you want to block the selected domain / domains and its sub urls?"
    secondMessage="This action cannot be undone."
    on:submit={onBlockUrls}
    on:closeModal={() => (openBlockAllConfirmation = false)}
    primaryButtonIcon={isDeleting && InlineLoading}
  />

  <WarningModal
    bind:open={openDeleteConfirmation}
    modalHeading="Remove resource / resources"
    question="Are you sure you want to remove the selected resource / resources?"
    secondMessage="This action cannot be undone."
    on:submit={onDeleteResources}
    on:closeModal={() => (openDeleteConfirmation = false)}
    primaryButtonIcon={isDeleting && InlineLoading}
  />

  <WarningModal
    bind:open={openIsBlockConfirmation}
    modalHeading="Block domain / domains"
    question="Are you sure you want to block the selected domain?"
    secondMessage="This action cannot be undone."
    on:submit={onBlockDomains}
    on:closeModal={() => (openIsBlockConfirmation = false)}
    primaryButtonIcon={isDeleting && InlineLoading}
  />
  <WarningModal
    bind:open={openExportAllResources}
    modalHeading="Export to Excel"
    primaryButtonText="Export"
    secondaryButtonText="Cancel"
    question="Remember that there is a maximum of 5000 exportable threats."
    secondMessage="This process could take more than one minute."
    primaryButtonIcon={exportAllLoading && InlineLoading}
    primaryButtonDisabled={exportAllLoading}
    on:submit={onExportAll}
    on:closeModal={() => (openExportAllResources = false)}
  />
</div>

<style>
  :global(#threats-table .bx--table-expand button) {
    width: 30px;
  }
  :global(.bx--table-toolbar) {
    max-width: var(--max-toolbar-width);
  }
</style>
