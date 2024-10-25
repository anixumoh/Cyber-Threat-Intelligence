<script lang="ts">
  import Client from '$lib/client';
  import EmptyData from '$lib/components/EmptyData/EmptyData.svelte';
  import { pageSizes } from '$lib/constants/pagination';
  import type { AccessLog, AccessLogQuery } from '$lib/types/admin';
  import { getHumanReadableDate, getPageOptions, getSinceOrToDate, scrollToTop } from '$lib/utils/functions';
  import preferencesStore from '$stores/preferences';
  import { validator } from '@felte/validator-yup';
  import {
    Button,
    DataTable,
    DatePicker,
    DatePickerInput,
    InlineLoading,
    Pagination,
    Search
  } from 'carbon-components-svelte';
  import type { DataTableHeader, DataTableProps } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { CaretUp, Filter, FilterRemove } from 'carbon-icons-svelte';
  import { createForm } from 'felte';
  import { tick } from 'svelte';
  import * as yup from 'yup';

  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'createdAt', value: 'DATE', sort: () => 0, display: getHumanReadableDate },
    { key: 'ipaddress', value: 'IP', sort: () => 0 },
    { key: 'action', value: 'ACTION', sort: () => 0 },
    { key: 'username', value: 'USER', sort: () => 0 },
    { key: 'section', value: 'WEB RESOURCE', sort: () => 0 }
  ];

  const SORT_KEY_MAP = {
    createdAt: 'D',
    ipaddress: 'IP',
    action: 'A',
    username: 'U',
    section: 'R'
  };

  const schema = yup.object({
    user: yup.string(),
    webResource: yup.string(),
    startDate: yup.number().nullable(),
    endDate: yup.number().nullable()
  });

  const { handleSubmit, data, setData, reset } = createForm<yup.InferType<typeof schema>>({
    extend: validator({ schema }),
    onSubmit: async (values) => {
      getLogs(
        page,
        pageSize,
        sortKey,
        sortDirection,
        values.user,
        values.webResource,
        values.startDate,
        values.endDate
      );
    }
  });

  let loading = false;
  let rows: AccessLog[] = [];
  let totalItems = 0;
  let page = 1;
  let pageSize = $preferencesStore?.defaultRows || 10;
  let sortKey: string = 'createdAt';
  let sortDirection: DataTableProps['sortDirection'] = 'descending';
  let resetDate = false;

  $: watchVars(page, pageSize, sortKey, sortDirection);

  function watchVars(..._: any) {
    handleSubmit();
  }

  async function getLogs(
    page: number,
    pageSize: number,
    sortKey: string,
    sortDirection: DataTableProps['sortDirection'],
    user = '',
    webResource = '',
    since: number,
    to: number
  ) {
    loading = true;
    const ascending = sortDirection === 'ascending';

    let o = '';
    if (sortKey) {
      o = `${SORT_KEY_MAP[sortKey]},${ascending ? 'ASC' : 'DESC'}`;
    }

    const query: AccessLogQuery = {
      p: true,
      page,
      maxRows: pageSize
    };
    if (o) {
      query.o = o;
    }
    if (webResource) {
      query.resource = webResource;
    }
    if (user) {
      query.user = user;
    }
    if (since && to) {
      query.since = since;
      query.to = to;
    }

    const response = await client.admin.getLogs(query);
    totalItems = response.totalRegistres;
    rows = response.accessLogs;
    loading = false;
  }

  function pickDate(event) {
    if (event.detail.selectedDates?.length === 2) {
      $data.startDate = +getSinceOrToDate(event.detail.selectedDates[0]);
      $data.endDate = +getSinceOrToDate(event.detail.selectedDates[1], false);
    }
  }

  async function clearFilters() {
    reset();
    resetDate = !resetDate;
    await tick();
    handleSubmit();
  }
</script>

<h4>Access Logs</h4>

<div class="relative overflow-x-auto">
  <div class="flex gap-4 flex-wrap bg-ctip-ui justify-end">
    <form
      on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
      on:submit|preventDefault={handleSubmit}
      class="flex gap-4 flex-wrap items-center"
    >
      <div class="flex items-center gap-1">
        <label for="search-user" class="m-0 whitespace-nowrap">User:</label>
        <Search id="search-user" placeholder="User" bind:value={$data.user} />
      </div>

      <div class="flex items-center gap-1">
        <label for="web-resource" class="m-0 whitespace-nowrap"> Web Resource: </label>
        <Search id="web-resource" placeholder="Web Resource" bind:value={$data.webResource} />
      </div>

      {#key resetDate}
        <DatePicker on:change={pickDate} dateFormat="d/m/y" datePickerType="range">
          <DatePickerInput placeholder="Start date" />
          <DatePickerInput placeholder="End date" />
        </DatePicker>
      {/key}

      <Button on:click={handleSubmit} icon={Filter} iconDescription="Filter" />

      <Button
        on:click={clearFilters}
        tooltipAlignment="end"
        kind="danger-tertiary"
        icon={FilterRemove}
        iconDescription="Clear Filters"
      />
    </form>
  </div>
  <DataTable
    class="pb-5 {loading ? '[&>table]:opacity-20 select-none' : ''}"
    size="compact"
    rows={rows.map((row, i) => ({ id: i, ...row }))}
    sortable
    bind:sortKey
    bind:sortDirection
    {headers}
    --cds-spacing-03="0"
    --cds-spacing-04="0.25rem"
    --cds-spacing-05="0.75rem"
  />

  {#if loading}
    <div class="absolute inset-0 flex pointer-events-none">
      <InlineLoading class="flex items-center justify-center" />
    </div>
  {/if}
</div>

{#if rows.length}
  <div class="sticky bottom-0 -mt-12">
    <div>
      <Pagination
        class="mb-10"
        bind:pageSize
        bind:page
        pageInputDisabled
        {totalItems}
        {pageSizes}
        itemRangeText={(min, max, total) => `${min}–${max}`}
      />
      <div class="absolute bottom-1 right-24 flex items-center gap-4">
        <Button
          on:click={scrollToTop}
          size="small"
          tooltipPosition="top"
          iconDescription="Scroll to top"
          kind="primary"
          icon={CaretUp}
        />

        <div class="text-base">
          <select bind:value={page}>
            {#each getPageOptions(page, totalItems, pageSize) as o}
              <option disabled={o.disabled} value={o.value}>{o.text}</option>
            {/each}
          </select>
          of {new Intl.NumberFormat().format(Math.ceil(totalItems / pageSize))} pages
        </div>
      </div>
    </div>
  </div>
{:else if !loading}
  <EmptyData />
{/if}
