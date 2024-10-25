<script lang="ts">
  import clickOutside from '$lib/actions/clickOutside';
  import type { FilterExplorerType } from '$lib/types/explorer';
  import { Button, DatePicker, DatePickerInput, Popover } from 'carbon-components-svelte';
  import { ChevronUp, ChevronDown, OverflowMenuVertical, FilterRemove } from 'carbon-icons-svelte';
  import { createEventDispatcher, tick } from 'svelte';
  import GenericButton from '../Buttons/GenericButton.svelte';
  import FilterButtons from '../Filter/FilterButtons.svelte';
  import SearchDebounce from '../SearchDebounce.svelte';
  import TableFilterMenu from './TableFilterMenu.svelte';

  const dispatch = createEventDispatcher();

  export let menuOpen = false;
  export let menuDisabled = false;
  export let openFilters = false;
  export let openSearch = false;
  export let hasFilters = false;
  export let filters: FilterExplorerType;

  let resettingDate = false;

  async function resetDate() {
    resettingDate = true;
    const { since, to, sinceToShow, toToShow, ...rest } = filters;
    filters = {
      ...rest,
      page: 0
    };
    await tick();
    resettingDate = false;
  }

  function onChangeDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      if (
        filters?.since?.getTime?.() !== event.detail.selectedDates[0]?.getTime?.() ||
        filters?.to?.getTime?.() !== event.detail.selectedDates[1]?.getTime?.()
      ) {
        filters = {
          ...filters,
          since: event.detail.selectedDates[0],
          to: event.detail.selectedDates[1],
          page: 0
        };
      }
    }
  }
</script>

<div class="flex flex-col p-2 bg-ctip-ui sm:sticky sm:top-14 sm:z-[2]">
  <div class="flex flex-col items-center justify-between sm:flex-row">
    <div
      class="self-start btn-group"
      use:clickOutside
      on:clickOutside={() => {
        menuOpen = false;
      }}
    >
      <Button
        data-test="actions"
        kind="ghost"
        tooltipPosition="right"
        tooltipAlignment="end"
        iconDescription="Actions"
        icon={OverflowMenuVertical}
        on:click={() => (menuOpen = !menuOpen)}
        disabled={menuDisabled}
      />

      <Popover open={menuOpen} align="right-top">
        <ul>
          <slot name="menu">
            <TableFilterMenu>Example</TableFilterMenu>
          </slot>
        </ul>
      </Popover>
    </div>

    <div class="flex flex-col gap-2 sm:flex-row">
      <slot name="pre-filter" />
      <slot name="filter-btn">
        {#if filters.since || filters.to}
          <Button class="px-2 rounded h-fit" on:click={resetDate} kind="danger-tertiary" size="small">
            Reset Dates
          </Button>
        {/if}
        {#if !resettingDate}
          <DatePicker
            bind:valueFrom={filters.sinceToShow}
            bind:valueTo={filters.toToShow}
            dateFormat="d/m/y"
            datePickerType="range"
            on:change={onChangeDate}
            class="h-31"
          >
            <DatePickerInput size="sm" placeholder="From" />
            <DatePickerInput size="sm" placeholder="To" />
          </DatePicker>
        {/if}
        <FilterButtons
          isActive={openFilters || hasFilters}
          on:click={() => {
            openFilters = !openFilters;
            openSearch = false;
          }}
        >
          <div class="flex items-center justify-center w-full">
            <div class="relative">
              <div class="bx--tooltip__label">
                Filters
                {#if openFilters}
                  <ChevronUp />
                {:else}
                  <ChevronDown />
                {/if}
              </div>
            </div>
          </div>
        </FilterButtons>
      </slot>
      <slot name="post-filter" />
    </div>
  </div>

  {#if openFilters || openSearch}
    <div class="flex justify-center mt-2 sm:justify-end">
      <div class="flex flex-col gap-2 sm:flex-row">
        {#if openFilters}
          <GenericButton on:click={() => dispatch('clear-filters')} kind="danger-tertiary">
            <FilterRemove />
            <span class="ml-2">Clear All</span>
          </GenericButton>
          <slot name="filters" />
        {/if}
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        {#if openSearch}
          <SearchDebounce
            name="search-cve"
            duration={1000}
            on:search={(e) => {
              filters = {
                ...filters,
                page: 0,
                q: e.detail
              };
            }}
            value={filters.q}
            startSearch={1}
          />
        {/if}
      </div>
    </div>
  {/if}
</div>
