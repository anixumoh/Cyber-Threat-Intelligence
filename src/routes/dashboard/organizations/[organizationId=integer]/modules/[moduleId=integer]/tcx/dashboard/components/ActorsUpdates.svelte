<script lang="ts">
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import type { Actor } from '$lib/client/services/actors';
  import CollapsableItems from '$lib/components/CollapsableItems/CollapsableItems.svelte';
  import FilterWrapper from '$lib/components/FilterWrapper/FilterWrapper.svelte';
  import Tlp from '$lib/components/Tlp/index.svelte';
  import REGIONS from '$lib/constants/regions';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    DatePicker,
    DatePickerInput,
    Dropdown,
    Modal,
    MultiSelect,
    Search,
    Tag
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableRow } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Checkmark, Close, Settings, Star, StarFilled } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { clone } from 'lodash';
  import { onDestroy, onMount } from 'svelte';

  const headers: DataTableHeader[] = [
    { key: 'new', value: '' },
    { key: 'favorite', value: '' },
    { key: 'name', value: 'NAME' },
    { key: 'aliases', value: 'ALIASES' },
    { key: 'types', value: 'TYPE' },
    { key: 'active', value: 'STATUS' },
    { key: 'tlp', value: 'TLP' }
  ];
  const configHeaders: DataTableHeader[] = [
    { key: 'name', value: 'NAME' },
    { key: 'aliases', value: 'ALIASES' },
    { key: 'tlp', value: 'TLP' },
    { key: 'favorite', value: 'FAVORITE' }
  ];

  const ITEMS_PER_ROW = 5;
  const client = new Client();
  const MONTHS_SINCE_IS_NEW = 12;

  onDestroy(() => client.abort());

  export let columns = 1;
  export let rows = 1;

  let actors: Actor[] = [];
  let numItems = rows * ITEMS_PER_ROW;
  let configureModalOpen = false;
  let search = '';
  let loading = false;
  let favoriteActorIds: string[] = [];
  let searchLoading = false;

  // FORM
  enum Status {
    ALL = 0,
    NEW = 1,
    UPDATED = 2
  }
  type ActorsForm = {
    status: Status;
    sinceDate?: Date;
    toDate?: Date;
    from: string;
    to: string;
    regions: string[];
  };

  let formData: ActorsForm = {
    status: Status.ALL,
    regions: [],
    from: '',
    to: ''
  };

  let newFormData: ActorsForm = clone(formData);

  $: numItems = rows * ITEMS_PER_ROW;
  $: favoriteActorIds = $preferencesStore.tcx_favorite_actors;
  $: getActors(formData);
  $: filteredActors = actors.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
  $: actorRegionPlaceholder = newFormData.regions.join(', ') || 'Actor region';

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  async function getActors(formData: ActorsForm) {
    loading = true;

    const dork = getDork(formData);
    const response = await client.actors.getActors(100, '-last_seen', dork ? { dork } : {});
    response.sort((a, b) => +favoriteActorIds.includes(b.id) - +favoriteActorIds.includes(a.id));
    actors = response;
    loading = false;
  }

  async function saveConfiguration() {
    configureModalOpen = false;
    $preferencesStore.tcx_favorite_actors = favoriteActorIds;
    preferencesStore.setAndSave($preferencesStore);
    getActors(formData);
  }

  function toggleFavorite(actorId: string) {
    if (favoriteActorIds.includes(actorId)) {
      favoriteActorIds = favoriteActorIds.filter((id) => id !== actorId);
    } else {
      favoriteActorIds = [...favoriteActorIds, actorId];
    }
  }

  function toggleFavoriteAndSave(actorId: string) {
    toggleFavorite(actorId);
    saveConfiguration();
  }

  function checkActorIsNew(actor: Actor | DataTableRow) {
    return dayjs(actor.first_seen).isAfter(dayjs().subtract(MONTHS_SINCE_IS_NEW, 'month'));
  }

  function handleChangeDate(event: CustomEvent<any>) {
    if (event.detail.selectedDates?.length === 2) {
      newFormData.sinceDate = event.detail.selectedDates[0];
      newFormData.toDate = event.detail.selectedDates[1];
    } else {
      newFormData.sinceDate = undefined;
      newFormData.toDate = undefined;
    }
  }

  function getDork(formData: ActorsForm) {
    let dorks = [];
    if (formData.sinceDate && formData.toDate) {
      const dateSince = `first_seen:>=${dayjs(formData.sinceDate).format('YYYY-MM-DD')}`;
      const dateTo = `first_seen:<=${dayjs(formData.toDate).format('YYYY-MM-DD')}`;
      dorks.push(`(${dateSince} AND ${dateTo})`);
    }

    if (formData.status === Status.NEW) {
      dorks.push(`(first_seen:>=${dayjs().subtract(MONTHS_SINCE_IS_NEW, 'month').format('YYYY-MM-DD')})`);
    } else if (formData.status === Status.UPDATED) {
      dorks.push(`(first_seen:<${dayjs().subtract(MONTHS_SINCE_IS_NEW, 'month').format('YYYY-MM-DD')})`);
    }

    if (formData.regions?.length) {
      dorks.push(`(${formData.regions.map((region) => `targets:"${region}"`).join(' OR ')})`);
    }

    const dork = dorks.join(' AND ');
    return dork;
  }

  function onApply() {
    formData = clone(newFormData);
  }

  function onCancel() {
    newFormData = clone(formData);
  }

  function onClear() {
    newFormData = formData = {
      status: Status.ALL,
      regions: [],
      sinceDate: null,
      toDate: null,
      from: '',
      to: ''
    };
  }

  function countFilters(formData: ActorsForm) {
    let num = 0;
    if (formData.regions.length) num++;
    if (formData.sinceDate) num++;
    if (formData.status) num++;
    return num;
  }
</script>

<div style:--cds-spacing-03="0" style:--cds-spacing-04="0.25rem" style:--cds-spacing-05="0.75rem">
  <div class="flex justify-between text-center">
    <h4>Actor updates</h4>

    <div class="flex gap-2">
      <FilterWrapper
        filtersCount={countFilters(formData)}
        formClass="w-[350px]"
        on:apply={onApply}
        on:cancel={onCancel}
        on:clear={onClear}
      >
        <div class="grid grid-cols-1 w-fit gap-4 mb-6">
          <DatePicker
            on:change={handleChangeDate}
            bind:valueFrom={newFormData.from}
            bind:valueTo={newFormData.to}
            dateFormat="d/m/y"
            datePickerType="range"
            flatpickrProps={{ maxDate: new Date() }}
          >
            <DatePickerInput labelText="Date from" placeholder="dd/mm/yy" />
            <DatePickerInput labelText="Date to" placeholder="dd/mm/yy" />
          </DatePicker>

          <Dropdown
            bind:selectedId={newFormData.status}
            titleText="Status"
            items={[
              { id: Status.ALL, text: 'All' },
              { id: Status.NEW, text: 'New' },
              { id: Status.UPDATED, text: 'Updated' }
            ]}
          />

          <MultiSelect
            filterable
            selectionFeedback="top"
            bind:selectedIds={newFormData.regions}
            titleText="Regions"
            label="label"
            placeholder={actorRegionPlaceholder}
            items={REGIONS.map((region) => ({ id: region, text: region }))}
          />
        </div>
      </FilterWrapper>

      <Button
        kind="ghost"
        size="small"
        icon={Settings}
        on:click={() => (configureModalOpen = true)}
        iconDescription="Actor dashboard settings"
        tooltipAlignment="end"
      />
    </div>
  </div>

  {#if loading}
    <DataTableSkeleton columns={3} rows={numItems} size="compact" showToolbar={false} showHeader={false} />
  {:else}
    <DataTable
      class="
      [&_th:nth-child(3)]:text-left
      [&_th:nth-child(4)]:text-left
      [&_th:nth-child(5)]:text-left
      "
      size="compact"
      {headers}
      rows={actors.slice(0, numItems)}
      --cds-spacing-04="0"
    >
      <svelte:fragment slot="cell" let:row let:cell>
        {#if cell.key === 'new'}
          {@const isNew = checkActorIsNew(row)}
          <Tag class="whitespace-nowrap" size="sm" type={isNew ? 'green' : 'purple'}>
            {isNew ? 'New' : 'Updated'}
          </Tag>
        {:else if cell.key === 'name'}
          <Button
            href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/actor/{row.id}"
            kind="ghost"
            size="small"
          >
            {cell.value}
          </Button>
        {:else if cell.key === 'aliases'}
          <CollapsableItems items={cell.value} let:item>
            <Tag size="sm">
              <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
                {item}
              </div>
            </Tag>
          </CollapsableItems>
        {:else if cell.key === 'types'}
          <CollapsableItems items={cell.value} let:item>
            <Tag size="sm">
              <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={String(item)}>
                {item}
              </div>
            </Tag>
          </CollapsableItems>
        {:else if cell.key === 'active'}
          <div class="flex items-center justify-center">
            {#if cell.value}
              <Checkmark class="fill-ctip-success" />
            {:else}
              <Close class="fill-ctip-danger" />
            {/if}
          </div>
        {:else if cell.key === 'tlp'}
          <Tlp readonly status={row.tlp.toUpperCase()} />
        {:else if cell.key === 'favorite'}
          <div class="flex items-center justify-center">
            <Button
              on:click={() => toggleFavoriteAndSave(row.id)}
              kind="ghost"
              icon={favoriteActorIds.includes(row.id) ? StarFilled : Star}
              iconDescription={favoriteActorIds.includes(row.id) ? 'Unmark as favorite' : 'Mark as favorite'}
              tooltipPosition="left"
            />
          </div>
        {:else}
          {cell.display ? cell.display(row) : cell.value}
        {/if}
      </svelte:fragment>
    </DataTable>
  {/if}

  <div class="flex flex-row-reverse">
    <Button
      kind="ghost"
      size="small"
      href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-actors"
    >
      See all actors
    </Button>
  </div>
</div>

<div use:modalTeleport>
  <Modal
    modalHeading="Actors updates - configuration"
    bind:open={configureModalOpen}
    on:click:button--secondary={() => (configureModalOpen = false)}
    on:click:button--primary={saveConfiguration}
    primaryButtonText="Save"
    secondaryButtonText="Close"
  >
    <Search bind:value={search} />

    {#if searchLoading}
      <DataTableSkeleton columns={4} size="compact" showToolbar={false} showHeader={false} />
    {:else}
      <DataTable size="compact" headers={configHeaders} rows={filteredActors}>
        <svelte:fragment slot="cell" let:row let:cell>
          {#if cell.key === 'aliases'}
            <div class="max-w-xs overflow-y-auto max-h-16 custom-scrollbar">
              {#each cell.value as alias}
                <Tag size="sm" title={alias}>
                  <div class="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap" title={alias}>
                    {alias}
                  </div>
                </Tag>
              {/each}
            </div>
          {:else if cell.key === 'tlp'}
            <Tlp readonly status={row.tlp.toUpperCase()} />
          {:else if cell.key === 'favorite'}
            <div class="flex items-center justify-center">
              <Button
                on:click={() => toggleFavorite(row.id)}
                kind="ghost"
                icon={favoriteActorIds.includes(row.id) ? StarFilled : Star}
                iconDescription={favoriteActorIds.includes(row.id) ? 'Unmark as favorite' : 'Mark as favorite'}
                tooltipPosition="left"
              />
            </div>
          {:else}
            {cell.display ? cell.display(row) : cell.value}
          {/if}
        </svelte:fragment>
      </DataTable>
    {/if}
  </Modal>
</div>
