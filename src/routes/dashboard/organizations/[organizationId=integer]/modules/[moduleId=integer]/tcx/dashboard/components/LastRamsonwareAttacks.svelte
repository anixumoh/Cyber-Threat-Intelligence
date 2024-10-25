<script lang="ts">
  import Client from '$lib/client';
  import type { Actor } from '$lib/client/services/actors';
  import FilterWrapper from '$lib/components/FilterWrapper/FilterWrapper.svelte';
  import INDUSTRIES from '$lib/constants/industries';
  import REGIONS from '$lib/constants/regions';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import {
    DataTable,
    DataTableSkeleton,
    DatePicker,
    DatePickerInput,
    MultiSelect,
    Search
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import dayjs from 'dayjs';
  import { clone } from 'lodash';
  import { onDestroy } from 'svelte';

  export let columns = 1;
  export let rows = 1;

  const client = new Client();
  onDestroy(() => client.abort());

  const headers: DataTableHeader[] = [
    { key: 'created_at', value: 'DATE', display: getHumanReadableDate },
    { key: 'name', value: 'THREAT ACTOR' },
    { key: 'organization', value: 'ORGANIZATION', display: () => 'organization' },
    { key: 'sector', value: 'SECTOR', display: () => 'sector' },
    { key: 'industry', value: 'INDUSTRY', display: () => 'industry' },
    { key: 'country', value: 'COUNTRY', display: () => 'country' }
  ];

  let data: Actor[] = [];
  let loading = false;

  $: pageSize = rows * 5;
  $: getData(formData, pageSize);

  $: actorRegionPlaceholder = newFormData.regions.join(', ') || 'Actor region';
  $: actorIndustryPlaceholder = newFormData.industries.join(', ') || 'Actor industry';

  async function getData(formData: ActorsForm, pageSize: number) {
    loading = true;
    const dork = getDork(formData);
    data = await client.actors.getActors(pageSize, '-last_seen', { dork });
    loading = false;
  }

  // FORM
  type ActorsForm = {
    sinceDate?: Date;
    toDate?: Date;
    from: string;
    to: string;
    actor: string;
    regions: string[];
    industries: string[];
  };

  let formData: ActorsForm = {
    regions: [],
    industries: [],
    actor: '',
    from: '',
    to: ''
  };

  let newFormData: ActorsForm = clone(formData);

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
    let dorks = ['attack_patterns:"Data Encrypted for Impact"'];
    if (formData.sinceDate && formData.toDate) {
      const dateSince = `first_seen:>=${dayjs(formData.sinceDate).format('YYYY-MM-DD')}`;
      const dateTo = `first_seen:<=${dayjs(formData.toDate).format('YYYY-MM-DD')}`;
      dorks.push(`(${dateSince} AND ${dateTo})`);
    }

    if (formData.actor) {
      dorks.push(`name:~"${formData.actor}"`);
    }

    if (formData.regions?.length) {
      dorks.push(`(${formData.regions.map((region) => `targets:"${region}"`).join(' OR ')})`);
    }

    if (formData.industries?.length) {
      dorks.push(`(${formData.industries.map((industry) => `targets:"${industry}"`).join(' OR ')})`);
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
      sinceDate: null,
      toDate: null,
      from: '',
      to: '',
      actor: '',
      industries: [],
      regions: []
    };
  }

  function countFilters(formData: ActorsForm) {
    let num = 0;
    if (formData.sinceDate) num++;
    if (formData.actor) num++;
    if (formData.regions.length) num++;
    if (formData.industries.length) num++;
    return num;
  }
</script>

<div class="flex justify-between">
  <div>
    <h4>Latest Ransomware Attacks</h4>
  </div>
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

        <Search bind:value={newFormData.actor} placeholder="Threat actor name" />

        <MultiSelect
          filterable
          selectionFeedback="top"
          bind:selectedIds={newFormData.regions}
          titleText="Regions"
          label="label"
          placeholder={actorRegionPlaceholder}
          items={REGIONS.map((region) => ({ id: region, text: region }))}
        />

        <MultiSelect
          filterable
          selectionFeedback="top"
          bind:selectedIds={newFormData.industries}
          titleText="Industries"
          label="label"
          placeholder={actorIndustryPlaceholder}
          items={INDUSTRIES.map((industry) => ({ id: industry, text: industry }))}
        />
      </div>
    </FilterWrapper>
  </div>
</div>

<div class="overflow-x-auto custom-scrollbar">
  {#if loading}
    <DataTableSkeleton
      --cds-spacing-03="0"
      --cds-spacing-04="0.25rem"
      --cds-spacing-05="0.75rem"
      size="compact"
      {headers}
      showToolbar={false}
      showHeader={false}
      rows={pageSize}
    />
  {:else}
    <DataTable
      --cds-spacing-03="0"
      --cds-spacing-04="0.25rem"
      --cds-spacing-05="0.75rem"
      size="compact"
      {headers}
      rows={data}
    />
  {/if}
</div>
