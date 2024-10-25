<script lang="ts">
  import Client from '$lib/client';
  import type { LabelType } from '$lib/client/services/modules';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import FilterButtons from '$lib/components/Filter/FilterButtons.svelte';
  import IncidentOverflowMenu from '$lib/components/IncidentOverflowMenu.svelte';
  import LabelItem from '$lib/components/LabelItem/LabelItem.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import { defaultStatusOptions } from '$lib/constants/threat';
  import type Module from '$lib/types/module';
  import type { ResetThreatsFiltersType, ThreatFilterType, ThreatSearchType } from '$lib/types/threat';
  import { activeClasses, iconClasses, iconTextClasses } from '$lib/utils';
  import threatsFilterStore from '$stores/filters';
  import { currentModule } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import preferencesStore from '$stores/preferences';
  import {
    Button,
    DatePicker,
    DatePickerInput,
    Modal,
    RadioButton,
    RadioButtonGroup,
    Search,
    SkeletonPlaceholder,
    StructuredList,
    StructuredListBody,
    StructuredListCell,
    StructuredListRow,
    Tooltip
  } from 'carbon-components-svelte';
  import { ChevronDown, ChevronUp, FilterRemove, List, Search as SearchIcon, TagGroup } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { isEqual } from 'lodash';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import GenericSingleSelect from '../Filter/GenericSingleSelect.svelte';

  type LabelFilterTypes = null | 'OR' | 'AND' | 'NOT';

  interface LabelItem extends LabelType {
    filter: LabelFilterTypes;
  }

  const client = new Client();
  const dispatch = createEventDispatcher();

  export let isIncident = false;
  export let selectedRowIds = [];
  export let rows = [];

  threatsFilterStore.getInitialIncidentsFilter();

  let openFilters = false;
  let openSearch = false;
  let labelModalOpen = false;
  let labelItems: LabelItem[] = [];
  let searchLabel: '';
  let resettingDate = false;
  let q = $threatsFilterStore.q || '';
  let qTimeoutId: NodeJS.Timeout;
  let filterTooltipOpen = false;
  let searchTooltipOpen = false;
  let isLoadingLabels = false;

  let from: Date;
  let to: Date;

  const initialFrom =
    $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModule.id]?.filters?.byDate?.sinceNumber;
  const initialTo =
    $preferencesStore?.modules?.[$currentOrganizationId]?.[$currentModule.id]?.filters?.byDate?.toNumber;
  from = initialFrom ? dayjs(initialFrom).toDate() : null;
  to = initialFrom ? dayjs(initialTo).toDate() : null;

  $: someFilter = !!Object.entries($threatsFilterStore)?.length;
  $: labelsFiltered = labelItems.filter((label) => label.label.toLowerCase().includes(searchLabel.toLowerCase()));
  $: onChangeQ(q);
  $: hasFilters = checkHasFilters($threatsFilterStore.filters);
  $: searchDisabled = hasFilters || openFilters;
  $: filterDisabled = openSearch || !!q;

  onMount(() => {
    return () => {
      client.abort();
    };
  });

  function onChangeQ(q: string) {
    clearTimeout(qTimeoutId);
    qTimeoutId = setTimeout(() => {
      if ($threatsFilterStore.q !== q && ($threatsFilterStore.q || q)) {
        $threatsFilterStore.page = 1;
        $threatsFilterStore.q = q;
      }
    }, 500);
  }

  function checkHasFilters(filters: ThreatFilterType) {
    if (!filters) return false;
    return Object.entries(filters).some(([key, value]) => {
      if (key === 'analysisCalcResult') {
        return !isEqual(value, defaultStatusOptions);
      } else if (key === 'read') {
        return !isEqual(value, 0);
      } else if (key !== 'analysisCalcResult' && Array.isArray(value)) {
        return value.length > 0;
      } else {
        return (value ?? undefined) !== undefined && (value ?? false) !== false;
      }
    });
  }

  async function loadLabels(orgId: number, module: Module) {
    isLoadingLabels = true;
    const labels = await client.modules.getLabels(orgId, module, true, true);

    const labelsOr = new Set($threatsFilterStore.filters.labels);
    const labelsAnd = new Set($threatsFilterStore.filters.labelsAnd);
    const labelsNot = new Set($threatsFilterStore.filters.excludeLabels);

    const labelsTmp: LabelItem[] = labels.map((label) => ({
      ...label,
      filter:
        (labelsOr.has(label.id) && 'OR') ||
        (labelsAnd.has(label.id) && 'AND') ||
        (labelsNot.has(label.id) && 'NOT') ||
        null
    }));
    const labelsSelected = labelsTmp.filter((label) => label.filter);
    const labelsUnSelected = labelsTmp.filter((label) => !label.filter);
    labelItems = [...labelsSelected, ...labelsUnSelected];
    isLoadingLabels = false;
  }

  async function resetDate() {
    $threatsFilterStore.since = $threatsFilterStore.to = from = to = null;
    resettingDate = true;
    await tick();
    resettingDate = false;
  }

  async function handleClearFilters() {
    if (!someFilter) return;
    (document.activeElement as HTMLButtonElement)?.blur();
    setTimeout(() => {
      const resetFilters: ResetThreatsFiltersType = {
        maxRows: $preferencesStore.defaultRows,
        ...($threatsFilterStore.since ? { since: $threatsFilterStore.since } : {}),
        ...($threatsFilterStore.to ? { to: $threatsFilterStore.to } : {})
      };
      threatsFilterStore.clearFilters(resetFilters);
    });
  }

  function handleChangeDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      if (
        $threatsFilterStore.since?.getTime() !== event.detail.selectedDates[0]?.getTime() ||
        $threatsFilterStore.to?.getTime() !== event.detail.selectedDates[1]?.getTime()
      ) {
        $threatsFilterStore.since = event.detail.selectedDates[0];
        $threatsFilterStore.to = event.detail.selectedDates[1];
        $threatsFilterStore.page = 1;
      }
    }
  }

  function setLabelSelection(id: number, filter: LabelFilterTypes) {
    const index = labelItems.findIndex((item) => item.id === id);
    labelItems[index].filter = filter;
  }

  function applyLabelFilters() {
    const temp: ThreatSearchType = { ...$threatsFilterStore, page: 1 };
    temp.filters.labels = [];
    temp.filters.labelsAnd = [];
    temp.filters.excludeLabels = [];
    labelItems.forEach((item) => {
      switch (item.filter) {
        case 'OR':
          temp.filters.labels.push(item.id);
          break;
        case 'AND':
          temp.filters.labelsAnd.push(item.id);
          break;
        case 'NOT':
          temp.filters.excludeLabels.push(item.id);
          break;
      }
    });
    $threatsFilterStore = temp;
    labelModalOpen = false;
  }

  function onReload() {
    dispatch('reload');
  }

  function getTitleAllRead() {
    if ($threatsFilterStore.filters.read === 1) {
      return 'Read';
    } else if ($threatsFilterStore.filters.read === 2) {
      return 'Not Read';
    }
    return 'All';
  }

  $: titleAllread = $threatsFilterStore && getTitleAllRead();
</script>

<div class="flex flex-col p-2 bg-ctip-ui text-ctip-text sm:sticky sm:top-14 sm:z-[2]">
  <div class="flex flex-col sm:flex-row justify-between items-center">
    <IncidentOverflowMenu filters={$threatsFilterStore} {selectedRowIds} {rows} on:reload={onReload} />

    <div class="flex flex-col sm:flex-row gap-2">
      {#if $threatsFilterStore.since || $threatsFilterStore.to}
        <Button class="px-2 rounded h-fit" on:click={resetDate} kind="danger-tertiary" size="small">Reset Dates</Button>
      {/if}

      {#if !resettingDate}
        <DatePicker
          bind:valueFrom={from}
          bind:valueTo={to}
          dateFormat="d/m/y"
          datePickerType="range"
          on:change={handleChangeDate}
          class="h-31"
        >
          <DatePickerInput size="sm" placeholder="From" />
          <DatePickerInput size="sm" placeholder="To" />
        </DatePicker>
      {/if}

      <FilterButtons
        class={filterDisabled ? 'cursor-not-allowed' : ''}
        isActive={openFilters || hasFilters}
        on:click={() => {
          if (filterDisabled) return;
          openSearch = false;
          openFilters = !openFilters;
        }}
        on:mouseover={() => (filterTooltipOpen = true)}
        on:mouseleave={() => (filterTooltipOpen = false)}
      >
        <div class="w-full flex items-center justify-center">
          {#if filterDisabled}
            <Tooltip hideIcon bind:open={filterTooltipOpen}>
              <svelte:fragment slot="triggerText">
                Filters <ChevronDown />
              </svelte:fragment>
              Clear search field and click magnifier to enable filters
            </Tooltip>
          {:else}
            <div class="relative">
              <div>
                Filters
                {#if openFilters}
                  <ChevronUp />
                {:else}
                  <ChevronDown />
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </FilterButtons>

      <FilterButtons
        class={searchDisabled ? '[&>*]:!cursor-not-allowed' : ''}
        isActive={openSearch || !!q}
        on:click={() => {
          if (searchDisabled) return;
          openFilters = false;
          openSearch = !openSearch;
        }}
        on:mouseover={() => (searchTooltipOpen = true)}
        on:mouseleave={() => (searchTooltipOpen = false)}
      >
        <div class="w-full flex items-center justify-center">
          {#if searchDisabled}
            <Tooltip hideIcon bind:open={searchTooltipOpen} align="end">
              <svelte:fragment slot="triggerText">
                <SearchIcon />
              </svelte:fragment>
              Press Clear All and then Filters to enable free text search
            </Tooltip>
          {:else}
            <div class="relative">
              <div class="bx--tooltip__label">
                <SearchIcon />
              </div>
            </div>
          {/if}
        </div>
      </FilterButtons>

      <GenericSingleSelect
        align="bottom-right"
        highlightedWhenSeleted={false}
        customClass="border text-ctip-btnLight"
        selectedValue={$threatsFilterStore.maxRows}
        items={pageSizes.map((size) => ({ text: size, value: size }))}
        value="value"
        display="text"
        title={`${$threatsFilterStore.maxRows}`}
        icon={List}
        alwaysShowIcon
        on:changeSelected={(event) => {
          $threatsFilterStore.maxRows = +event.detail;
          $threatsFilterStore.page = 1;
        }}
      />
    </div>
  </div>

  {#if openFilters || openSearch}
    <div class="flex justify-center sm:justify-end mt-2">
      <div class="flex flex-col sm:flex-row gap-2">
        {#if openFilters}
          <GenericButton kind="danger-tertiary" on:click={handleClearFilters}>
            <FilterRemove />
            <span class="ml-2">Clear All</span>
          </GenericButton>

          {#if !isIncident}
            <GenericSingleSelect
              selectedValue={$threatsFilterStore.filters.read}
              items={[
                { text: 'All', value: 0 },
                { text: 'Read', value: 1 },
                { text: 'Not Read', value: 2 }
              ]}
              value="value"
              title={titleAllread}
              display="text"
              {activeClasses}
              customClass="text-ctip-btnLight
              {$threatsFilterStore.filters.read === undefined || $threatsFilterStore.filters.read === 0
                ? 'border-ctip-border'
                : ''}"
              selectionZero={$threatsFilterStore.filters.read !== 0}
              on:changeSelected={(event) => {
                $threatsFilterStore.page = 1;
                $threatsFilterStore.filters.read = +event.detail;
              }}
            />
          {/if}

          {#if isIncident}
            <GenericSingleSelect
              data-test="filter-status"
              selectedValue={$threatsFilterStore.filters.status}
              items={[
                { text: 'Open', value: 0 },
                { text: 'Notified', value: 1 },
                { text: 'Closed ', value: 2 }
              ]}
              value="value"
              title="Status"
              {activeClasses}
              customClass={$threatsFilterStore.filters.status === undefined ? 'border-ctip-border' : ''}
              on:changeSelected={(event) => ($threatsFilterStore.filters.status = +event.detail)}
            >
              <svelte:fragment slot="label" let:item>
                <div
                  class="rounded-full cursor-pointer w-[0.9375em] h-[0.9375em]"
                  class:bg-ctip-successThreat={item.value === 0}
                  class:bg-ctip-primary={item.value === 1}
                  class:bg-ctip-dangerThreat={item.value === 2}
                />
                <span
                  class="ml-2"
                  class:text-ctip-successThreat={item.value === 0}
                  class:text-ctip-primary={item.value === 1}
                  class:text-ctip-dangerThreat={item.value === 2}>{item.text}</span
                >
              </svelte:fragment>
            </GenericSingleSelect>
          {/if}

          <FilterButtons
            isActive={!!$threatsFilterStore?.filters?.excludeLabels?.length ||
              !!$threatsFilterStore?.filters?.labels?.length ||
              !!$threatsFilterStore?.filters?.labelsAnd?.length}
            on:click={() => (labelModalOpen = true)}
          >
            <TagGroup class={iconClasses} />
            <div class={iconTextClasses}>Label</div>
          </FilterButtons>
        {/if}
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        {#if openSearch}
          <Search class="max-w-sm" size="sm" bind:value={q} />
        {/if}
      </div>
    </div>
  {/if}
</div>

<Modal
  bind:open={labelModalOpen}
  modalHeading="Label"
  primaryButtonText="Apply Filter"
  secondaryButtonText="Cancel"
  on:click:button--secondary={() => (labelModalOpen = false)}
  on:open={() => loadLabels($currentOrganizationId, $currentModule)}
  on:submit={applyLabelFilters}
>
  <Search bind:value={searchLabel} />

  <div class="mt-4">
    <StructuredList selection condensed flush on:change>
      <StructuredListBody>
        {#if isLoadingLabels}
          <SkeletonPlaceholder class="h-6 w-full" />
        {:else}
          {#each labelsFiltered as label}
            <StructuredListRow on:click={() => (label.filter = label.filter ? undefined : 'OR')}>
              <StructuredListCell style="width: 67%">
                <div style="margin-left: 10px">
                  <LabelItem {label} />
                </div>
              </StructuredListCell>
              <StructuredListCell>
                <div class:hidden={!label.filter}>
                  <RadioButtonGroup selected={label.filter} on:change={(e) => setLabelSelection(label.id, e.detail)}>
                    <RadioButton labelText="OR" value="OR" />
                    <RadioButton labelText="AND" value="AND" />
                    <RadioButton labelText="NOT" value="NOT" />
                  </RadioButtonGroup>
                </div>
              </StructuredListCell>
            </StructuredListRow>
          {/each}
        {/if}
      </StructuredListBody>
    </StructuredList>
  </div>
</Modal>
