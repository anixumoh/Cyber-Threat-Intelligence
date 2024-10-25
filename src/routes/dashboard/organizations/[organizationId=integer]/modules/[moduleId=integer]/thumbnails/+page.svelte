<script lang="ts">
  import { goto } from '$app/navigation';
  import Client from '$lib/client';
  import type { ThumbnailItem } from '$lib/client/services/modules';
  import WarningModal from '$lib/components/CommonModal/WarningModal/WarningModal.svelte';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import Favorite from '$lib/components/Favorite/Favorite.svelte';
  import GenericSingleSelect from '$lib/components/Filter/GenericSingleSelect.svelte';
  import IncidentModal from '$lib/components/IncidentModal.svelte';
  import Inform from '$lib/components/Inform/Inform.svelte';
  import ResponsivePageNavigation from '$lib/components/ResponsivePageNavigation.svelte';
  import SafeImage from '$lib/components/SafeImage.svelte';
  import TooltipWithIcon from '$lib/components/TooltipWithIcon/TooltipWithIcon.svelte';
  import ModuleHeading from '$lib/components/module/ModuleHeading.svelte';
  import { COLORS } from '$lib/constants/colors';
  import { pageSizes } from '$lib/constants/pagination';
  import { currentModule, currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import roleStore from '$stores/role';
  import { SkeletonPlaceholder, Tag } from 'carbon-components-svelte';
  import { DataViewAlt, List, TrashCan, WarningAltFilled } from 'carbon-icons-svelte';

  const { danger, gray, primary } = COLORS;

  const client = new Client();

  let rows: ThumbnailItem[] = [];
  let page = 1;
  let total = 0;
  let maxRows = $preferencesStore.defaultRows ?? 10;
  let loading = false;
  let incidentModalOpen = false;
  let deleteModalOpen = false;
  let selectedResource: { resourceId: number; hasIncident: boolean };
  let selectedResourceToDelete: number;

  $: numPages = Math.ceil(total / maxRows);
  $: getThumbnails($currentOrganizationId, $currentModuleId, page, maxRows);

  async function reload() {
    getThumbnails($currentOrganizationId, $currentModuleId, page, maxRows);
  }

  async function getThumbnails(organizationId: number, moduleId: number, page: number, maxRows: number) {
    loading = true;
    const response = await client.modules.getThumbnails(organizationId, moduleId, page, maxRows);
    total = response.total_resources;
    rows = response.list;
    loading = false;
  }

  function openIncident(resource: any) {
    selectedResource = resource;
    incidentModalOpen = true;
  }

  async function markFavorite(resourceId: number, isFavorite: boolean) {
    rows = rows.map((row) => {
      if (row.id === resourceId) {
        return {
          ...row,
          fav: isFavorite ? 'NOT_STARRED' : 'USER_STARRED'
        };
      }
      return row;
    });
    await client.threats.markAsFav(
      isFavorite,
      resourceId,
      $currentOrganizationId,
      $currentModuleId,
      $currentModule.moduleName
    );
  }

  function viewDetails(resourceId: number) {
    const url = `/dashboard/organizations/${$currentOrganizationId}/modules/${$currentModuleId}/resource/${resourceId}`;
    goto(url);
  }

  function openDeleteModal(resourceId: number) {
    selectedResourceToDelete = resourceId;
    deleteModalOpen = true;
  }

  async function deleteSelectedResource() {
    deleteModalOpen = false;
    loading = true;
    await client.threats.deleteResources(
      [selectedResourceToDelete],
      $currentOrganizationId,
      $currentModuleId,
      $currentModule.moduleName
    );
    if (page !== 1) {
      page = 1;
    } else {
      await reload();
    }
    selectedResourceToDelete = null;
  }

  function setHasIncident(resourceId: number, hasIncident: boolean) {
    rows = rows.map((row) => {
      if (row.id === resourceId) {
        return { ...row, issued: hasIncident };
      }
      return row;
    });
  }
</script>

<ModuleHeading title="THUMBNAILS" />

<div class="flex flex-row-reverse mb-4">
  <GenericSingleSelect
    align="bottom-right"
    highlightedWhenSeleted={false}
    customClass="border text-ctip-btnLight"
    selectedValue={maxRows}
    items={pageSizes.map((size) => ({ text: size, value: size }))}
    value="value"
    display="text"
    title={`${maxRows}`}
    icon={List}
    alwaysShowIcon
    on:changeSelected={(event) => {
      maxRows = +event.detail;
      page = 0;
    }}
  />
</div>

{#if loading}
  <SkeletonPlaceholder class="w-full h-32" />
{:else if !rows.length}
  <EmptyData />
{:else}
  <div id="thumbnails-list">
    {#each rows as row}
      <article class="h-32 flex rounded border-[1px] border-solid">
        <div class="w-5/12 flex justify-center">
          <SafeImage src={row.image} />
        </div>
        <div class="w-7/12 flex flex-col pl-2 justify-around border-l border-solid border-gray-100">
          <div>
            <div title={row.title} class="text-xl text-ellipsis overflow-hidden whitespace-nowrap">{row.title}</div>
            <div class="whitespace-nowrap overflow-x-auto">
              {#each row.labels as label}
                <Tag>
                  {label.name}
                </Tag>
              {/each}
            </div>
          </div>
          <div class="flex gap-4">
            <TooltipWithIcon
              tooltipText={row.issued ? 'View incidents' : 'Mark as incident'}
              icon={WarningAltFilled}
              color={row.issued ? danger : gray}
              on:click={() => openIncident({ resourceId: row.id, hasIncident: row.issued })}
              data-test="incident-button"
            />
            <Favorite
              isFavorite={row.fav === 'NOT_STARRED'}
              on:setFavorite={(e) => markFavorite(row.id, e.detail.isFavorite)}
            />
            <TooltipWithIcon
              tooltipText="View Details"
              icon={DataViewAlt}
              color={primary}
              on:click={() => viewDetails(row.id)}
              data-test="view-details"
            />
            <Inform
              resource={{ ...row, resourceId: row.id }}
              status={row.analysis_user_result || row.analysis_calc_result}
            />
            {#if !$roleStore.customer}
              <TooltipWithIcon
                tooltipText="Delete"
                icon={TrashCan}
                color={danger}
                on:click={() => openDeleteModal(row.id)}
                data-test="detele-button"
              />
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
  <ResponsivePageNavigation bind:page {loading} total={numPages} />
{/if}

<IncidentModal
  bind:open={incidentModalOpen}
  resources={[selectedResource]}
  on:save={() => setHasIncident(selectedResource.resourceId, true)}
  on:deleteAll={() => setHasIncident(selectedResource.resourceId, false)}
/>

<WarningModal
  bind:open={deleteModalOpen}
  modalHeading="Remove resource"
  question="Are you sure you want to remove the selected resource?"
  secondMessage="This action cannot be undone."
  on:submit={() => deleteSelectedResource()}
  on:closeModal={() => (deleteModalOpen = false)}
/>

<style>
  #thumbnails-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    margin: 0 auto;
    gap: 16px;
  }
</style>
