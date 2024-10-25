<script lang="ts">
  import { page } from '$app/stores';
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import type { PriorityCVE } from '$lib/client/services/malware';
  import type { LabelType, TermsType } from '$lib/client/services/modules';
  import GenericButton from '$lib/components/Buttons/GenericButton.svelte';
  import TooltipWrap from '$lib/components/TooltipWrap.svelte';
  import type { FilterExplorerType } from '$lib/types/explorer';
  import { activeClasses } from '$lib/utils';
  import critical from '$src/assets/priority-images/critical.svg';
  import major from '$src/assets/priority-images/major.svg';
  import medium from '$src/assets/priority-images/medium.svg';
  import minor from '$src/assets/priority-images/minor.svg';
  import trivial from '$src/assets/priority-images/trivial.svg';
  import { currentModule } from '$stores/module';
  import { currentOrganization } from '$stores/organization';
  import {
    Button,
    ButtonSet,
    DatePicker,
    DatePickerInput,
    FormGroup,
    Modal,
    Search,
    SkeletonPlaceholder,
    Tag,
    Tile
  } from 'carbon-components-svelte';
  import { Add, Checkmark, Document, Filter, FilterRemove } from 'carbon-icons-svelte';
  import { createEventDispatcher } from 'svelte';
  import GenericFilterMultiple from '../GenericFilterMultiple.svelte';
  import LabelItem from '../LabelItem/LabelItem.svelte';
  import SearchDebounce from '../SearchDebounce.svelte';
  import GenericSingleSelect from './GenericSingleSelect.svelte';

  export let filterMenuOpen = false;
  export let search = '';
  export let searchExpanded = false;
  export let filtersCount = 0;
  export let allFilters: FilterExplorerType = null;

  $: filterMenuOpen && loadLabels($currentOrganization.id, $currentModule.id);
  $: labelsFiltered = availiableLabels(
    labelItems,
    labelFilterType,
    searchLabel,
    allFilters.labels,
    allFilters.labelsAnd,
    allFilters.excludeLabels
  );
  $: getTerms();

  const client = new Client();
  const dispatch = createEventDispatcher<{
    'apply-filters': FilterExplorerType;
  }>();

  let formEl: HTMLFormElement;
  let labelModalRef: HTMLDivElement;
  let resetDate = 0;
  let labelItemMap: Record<number, LabelType> = {};
  let labelFilterType: LabelFilterType;
  let selectedLabels: number[] = [];
  let labelModalOpen = false;
  let loadingLabels = false;
  let labelItems: LabelType[] = [];
  let terms: TermsType[] = [];
  let searchLabel = '';
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

  enum LabelFilterType {
    OR = 'OR',
    AND = 'AND',
    NOT = 'NOT'
  }

  const READ_TYPES = {
    0: 'All',
    1: 'Read',
    2: 'Not Read'
  };
  function handleClickOutside(e: MouseEvent) {
    if (open && formEl && formEl.contains(e?.target as HTMLElement)) return;
    if (open && labelModalRef && labelModalRef.contains(e?.target as HTMLElement)) return;
    filterMenuOpen = false;
  }
  function handleChangeDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      allFilters.since = event.detail.selectedDates[0];
      allFilters.to = event.detail.selectedDates[1];
    } else {
      allFilters.since = undefined;
      allFilters.to = undefined;
    }
  }

  function removeLabel(labelId: number, filterType: LabelFilterType) {
    switch (filterType) {
      case LabelFilterType.OR:
        allFilters.labels = allFilters.labels.filter((id) => id !== labelId);
        break;
      case LabelFilterType.AND:
        allFilters.labelsAnd = allFilters.labelsAnd.filter((id) => id !== labelId);
        break;
      case LabelFilterType.NOT:
        allFilters.excludeLabels = allFilters.excludeLabels.filter((id) => id !== labelId);
        break;
    }
  }
  function filterLabels(filterType: LabelFilterType) {
    labelFilterType = filterType;
    selectedLabels = getLabels(labelFilterType);
    labelModalOpen = true;
  }
  function getLabels(filterType: LabelFilterType) {
    switch (filterType) {
      case LabelFilterType.OR:
        return allFilters.labels;
      case LabelFilterType.AND:
        return allFilters.labelsAnd;
      case LabelFilterType.NOT:
        return allFilters.excludeLabels;
    }
  }
  async function getTerms() {
    terms = await client.malware.getTerms($currentOrganization.id, $currentModule.id);
  }
  async function loadLabels(orgId: number, moduleId: number) {
    loadingLabels = true;
    labelItems = await client.modules.getExplorerLabels(orgId, moduleId);
    labelItems.forEach((label) => {
      labelItemMap[label.id] = label;
    });
    loadingLabels = false;
  }
  function onClose() {
    filterMenuOpen = false;
  }
  function onApply() {
    dispatch('apply-filters', allFilters);
    filterMenuOpen = false;
  }
  function setLabels() {
    labelModalOpen = false;
    switch (labelFilterType) {
      case LabelFilterType.OR:
        allFilters.labels = selectedLabels;
        break;
      case LabelFilterType.AND:
        allFilters.labelsAnd = selectedLabels;
        break;
      case LabelFilterType.NOT:
        allFilters.excludeLabels = selectedLabels;
        break;
    }
  }
  function availiableLabels(labelItems: LabelType[], filterType: LabelFilterType, search: string, ...watchingVars) {
    const otherLabelTypes = Object.values(LabelFilterType).filter((type) => type !== filterType);
    const notAviliableIds = otherLabelTypes.map((type) => getLabels(type)).flat();
    const labels = labelItems.filter(
      (label) => !notAviliableIds.includes(label.id) && label.label.toLowerCase().includes(search.toLowerCase())
    );
    const labelsSelected = labels.filter((label) => selectedLabels.includes(label.id));
    const labelsUnSelected = labels.filter((label) => !selectedLabels.includes(label.id));
    return [...labelsSelected, ...labelsUnSelected];
  }
  function clearFiltersLocally() {
    allFilters.sinceToShow = allFilters.toToShow = '';
    resetDate++;
    allFilters = {
      page: +$page.url.searchParams.get('page') || 1,
      maxRows: 10,
      sortKey: undefined,
      sortDirection: 'descending',
      read: 0,
      q: '',
      selectedTerms: [],
      selectedRisk: [],
      startScore: undefined,
      endScore: undefined,
      to: undefined,
      since: undefined,
      labels: [],
      labelsAnd: [],
      excludeLabels: []
    };
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="ml-auto mr-2">
  <SearchDebounce
    name="search-cve"
    duration={1000}
    on:search={(e) => {
      allFilters = {
        ...allFilters,
        page: 1,
        q: e.detail
      };
      dispatch('apply-filters', allFilters);
    }}
    value={allFilters.q}
    startSearch={1}
  />
</div>
{#if filtersCount > 0}
  <div class="lg:col-span-2 text-center ml-2 mr-2">
    <GenericButton
      on:click={() => {
        clearFiltersLocally();
        dispatch('apply-filters', allFilters);
      }}
      kind="danger-tertiary"
    >
      <FilterRemove />
      <span class="ml-2">Clear all filters</span>
    </GenericButton>
  </div>
{/if}
<div class="relative">
  {#if search || searchExpanded}
    <TooltipWrap direction="top" align="end">
      <span class="w-40 block" slot="tooltip">Clear search to enable filters</span>
      <GenericButton kind="primary" class="pr-10 min-w-[132px]" disabled icon={Filter}>Filters</GenericButton>
    </TooltipWrap>
  {:else}
    <GenericButton
      kind="primary"
      class="pr-10 min-w-[132px]"
      on:click={(e) => {
        e.stopImmediatePropagation();
        filterMenuOpen = !filterMenuOpen;
      }}
      icon={Filter}
    >
      <div>
        Filters
        {#if filtersCount}
          <Tag size="sm" class="ml-2 cursor-pointer" type="high-contrast">
            {filtersCount}
          </Tag>
        {/if}
      </div>
    </GenericButton>
  {/if}
</div>

{#if filterMenuOpen}
  <form bind:this={formEl} class="absolute top-full mt-11 z-50 grid right-0 w-[500px] lg:w-[725px] shadow border">
    <Tile class="grid grid-cols-1 px-4 pt-4 overflow-y-auto lg:overflow-y-visible lg:grid-cols-2">
      <div class="pr-4 mb-4 border-r border-ctip-border border-solid">
        <FormGroup class="flex gap-2">
          {#key resetDate}
            <DatePicker
              on:change={handleChangeDate}
              bind:valueFrom={allFilters.sinceToShow}
              bind:valueTo={allFilters.toToShow}
              dateFormat="d/m/y"
              datePickerType="range"
              flatpickrProps={{ maxDate: new Date() }}
            >
              <DatePickerInput labelText="Date from" placeholder="dd/mm/yy" />
              <DatePickerInput labelText="Date to" placeholder="dd/mm/yy" />
            </DatePicker>
          {/key}
          <Button
            class="rounded h-8 mt-auto mr-24 lg:mr-0"
            tooltipAlignment="center"
            tooltipPosition="top"
            iconDescription="Remove dates"
            kind="tertiary"
            size="small"
            icon={FilterRemove}
            on:click={() => {
              allFilters.sinceToShow = allFilters.toToShow = '';
              resetDate++;
              allFilters.since = undefined;
              allFilters.to = undefined;
            }}
          />
        </FormGroup>
        <div class="flex justify-center gap-2 flex-wrap">
          <GenericSingleSelect
            data-test="select-read"
            selectedValue={allFilters.read}
            items={Object.entries(READ_TYPES).map(([value, text]) => ({ value: +value, text }))}
            title={READ_TYPES[allFilters.read]}
            value="value"
            display="text"
            {activeClasses}
            customClass="text-ctip-btnLight
        {allFilters.read === undefined || allFilters.read === 0 ? 'border-ctip-border' : ''}"
            selectionZero={allFilters.read !== 0}
            on:changeSelected={(event) => {
              allFilters.read = +event.detail;
              allFilters.page = 1;
            }}
          />
          <GenericFilterMultiple
            data-test="select-product-vendor"
            bind:selectedValues={allFilters.selectedTerms}
            items={terms}
            value="id"
            title="Product and Vendor"
            icon={Document}
          >
            <svelte:fragment slot="label" let:item>
              {item.term} ({item.total})
            </svelte:fragment>
          </GenericFilterMultiple>
          <GenericFilterMultiple
            data-test="select-risk"
            bind:selectedValues={allFilters.selectedRisk}
            items={RISK_TYPES}
            display="name"
            title="Risk"
            value="value"
            icon={Document}
          />

          <div class="mt-2 flex items-center justify-center">
            <input
              bind:value={allFilters.startScore}
              min={0}
              max={10}
              step={0.1}
              class="w-36"
              type="number"
              placeholder="Score From"
              name="score-from"
            />
            <div class="px-1">-</div>
            <input
              bind:value={allFilters.endScore}
              min={0}
              max={10}
              step={0.1}
              class="w-36"
              type="number"
              placeholder="Score To"
              name="score-to"
            />
          </div>
        </div>
      </div>

      <div class="pl-0 lg:!pl-4">
        <FormGroup>
          <div>
            <div class="flex justify-between w-full mb-2 border-b border-gray-200 border-solid">
              <span>Labels</span>
            </div>

            <div>
              {#if loadingLabels}
                <SkeletonPlaceholder class="w-full h-36" />
              {:else}
                {#each Object.values(LabelFilterType) as labelFilterType}
                  <div class="flex gap-2 border-b border-gray-200 border-solid">
                    <div class="flex items-start mt-2.5 text-xs">{labelFilterType}</div>
                    <div class="flex flex-wrap items-center w-full gap-1 p-2">
                      {#if labelFilterType === LabelFilterType.OR}
                        {#each allFilters.labels as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {:else if labelFilterType === LabelFilterType.AND}
                        {#each allFilters.labelsAnd as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {:else if labelFilterType === LabelFilterType.NOT}
                        {#each allFilters.excludeLabels as labelId}
                          <LabelItem
                            filter
                            on:close={() => removeLabel(labelId, labelFilterType)}
                            label={labelItemMap[labelId]}
                          />
                        {/each}
                      {/if}
                      <Button
                        class="rounded"
                        tooltipAlignment="end"
                        tooltipPosition="top"
                        iconDescription="Add label filter ({labelFilterType})"
                        kind="tertiary"
                        size="small"
                        icon={Add}
                        on:click={() => filterLabels(labelFilterType)}
                      />
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </FormGroup>
      </div>
    </Tile>
    <ButtonSet class="flex w-full">
      <Button class="w-1/2 h-12 max-w-none" on:click={onClose} kind="secondary">Cancel</Button>
      <Button class="w-1/2 h-12 max-w-none" on:click={onApply}>Apply</Button>
    </ButtonSet>
  </form>
{/if}

<div use:modalTeleport>
  <Modal
    size="sm"
    bind:ref={labelModalRef}
    bind:open={labelModalOpen}
    modalHeading="Label"
    primaryButtonText="Set filters"
    secondaryButtonText="Cancel"
    on:click:button--secondary={() => (labelModalOpen = false)}
    on:submit={setLabels}
    on:open={() => (searchLabel = '')}
  >
    <Search bind:value={searchLabel} />

    <div class="mt-4">
      {#each labelsFiltered as label}
        {@const checked = selectedLabels.includes(label.id)}
        <label
          class="flex justify-between items-center w-full transition-colors hover:bg-ctip-hover-ui hover:cursor-pointer m-1 p-1.5"
          class:bg-ctip-hover-ui={checked}
        >
          <div>
            <LabelItem {label} />
          </div>
          {#if checked}
            <Checkmark />
          {/if}
          <input hidden type="checkbox" bind:group={selectedLabels} value={label.id} />
        </label>
      {/each}
    </div>
  </Modal>
</div>
