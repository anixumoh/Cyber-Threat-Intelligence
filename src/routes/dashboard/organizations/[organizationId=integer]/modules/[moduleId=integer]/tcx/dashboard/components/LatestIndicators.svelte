<script lang="ts">
  import { browser } from '$app/environment';
  import Client from '$lib/client';
  import ScoreCve from '$lib/components/ScoreCve.svelte';
  import { getHumanReadableDate } from '$lib/utils/functions';
  import darkMode from '$stores/darkMode';
  import { currentModuleId } from '$stores/module';
  import notifications from '$stores/notification';
  import { currentOrganizationId } from '$stores/organization';
  import {
    Button,
    DataTable,
    DataTableSkeleton,
    InlineLoading,
    Toolbar,
    ToolbarBatchActions
  } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { Copy, Report } from 'carbon-icons-svelte';
  import dayjs from 'dayjs';
  import { onMount, tick } from 'svelte';

  interface IndicatorsResponse {
    data: IndicatorData[];
    meta: { pagination: { count: number; limit: number; offset: number } };
  }

  interface IndicatorData {
    type: string;
    id: string;
    attributes: IndicatorAttributes;
  }

  interface IndicatorAttributes {
    value: string;
    ioc_types: any[];
    slugs_tags: any[];
    type: IndicatorType;
    created_at: string;
    updated_at: string;
    first_seen: string;
    last_seen: string;
    tags: any[];
  }

  type Indicator = Omit<IndicatorData, 'attributes'> & IndicatorAttributes & { risk?: number };

  type IndicatorType = 'IP' | 'Malware' | 'FQDN' | 'CrimeServer';

  const INDICATOR_TYPE_MAP: Record<IndicatorType, string> = {
    IP: 'ip',
    Malware: 'malware',
    FQDN: 'fqdn',
    CrimeServer: 'crime-server'
  };

  if (browser) {
    window.am4core.useTheme(window.am4themes_animated);
    window.am4core.options.commercialLicense = true;
  }

  export let columns = 1;
  export let rows = 1;

  const ITEMS_PER_ROW = 5;
  const client = new Client();
  const headers: DataTableHeader[] = [
    { key: 'value', value: 'INDICATOR' },
    { key: 'type', value: 'TYPE' },
    { key: 'risk', value: 'SCORE' },
    { key: 'last_seen', value: 'LAST SEEN', display: (row) => getHumanReadableDate(row.last_seen) }
  ];

  let indicators: Indicator[] = [];
  let loadingChart = false;
  let loading = false;
  let selectedRowIds = [];
  let unmounted = false;

  let chartDiv: HTMLDivElement;
  let amchart: import('@amcharts/amcharts4/charts').XYChart;

  $: numItems = rows * ITEMS_PER_ROW;
  $: if (columns === 2) initAmChart();
  $: getIndicators(numItems);

  onMount(() => {
    return () => {
      unmounted = true;
      client.abort();
      amchart?.dispose();
    };
  });

  async function getIndicators(num: number) {
    loading = true;
    const url = `/api/v1/indicator/?page[limit]=${num}&sort=-first_seen`;
    const response = await client.gateway.get<IndicatorsResponse>('THIAPP', url);
    const data: Indicator[] = response.data.data.map((row) => ({
      id: row.id,
      ...row.attributes
    }));

    const promises = data.map(async (indicator) => {
      try {
        const type = INDICATOR_TYPE_MAP[indicator.type];
        const url = `/api/v1/${type}/${indicator.value}/`;
        const response = await client.gateway.get<{ data: { attributes: { risk: number } } }>('THIAPP', url);
        indicator.risk = response.data.data.attributes.risk;
      } catch (error) {}
      return indicator;
    });

    await Promise.all(promises);

    indicators = data;
    loading = false;
  }

  async function fetchGraphData() {
    const batches: ReturnType<typeof getGraphDataRange>[] = [];
    for await (const i of [0, 7, 14, 71, 28]) {
      if (unmounted) continue;
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      batches.push(getGraphDataRange(i, i - 6));
    }

    const result = await Promise.all(batches);
    return result;
  }

  async function getGraphDataRange(from: number, to: number) {
    const fromStr = dayjs().subtract(from, 'day').format('YYYY-MM-DD');
    const toStr = dayjs().subtract(to, 'day').format('YYYY-MM-DD');
    const range = `${fromStr} - ${toStr}`;
    const queries = [
      {
        name: 'New indicators',
        dork: `first_seen:>=${fromStr} AND first_seen:<=${toStr}`
      },
      {
        name: 'New malware',
        dork: `first_seen:>=${fromStr} AND first_seen:<=${toStr} AND type:"Malware"`
      },
      {
        name: 'New IPs',
        dork: `first_seen:>=${fromStr} AND first_seen:<=${toStr} AND type:"IP"`
      },
      {
        name: 'New domains',
        dork: `first_seen:>=${fromStr} AND first_seen:<=${toStr} AND type:"FQDN"`
      },
      {
        name: 'New crimeservers',
        dork: `first_seen:>=${fromStr} AND first_seen:<=${toStr} AND type:"CrimeServer"`
      }
    ] as const;

    type Result = {
      range: string;
      date: Date;
    } & Record<(typeof queries)[number]['name'], number>;

    const promises = queries.map(async (query) => {
      const params = {
        'page[limit]': '1',
        dork: query.dork
      };
      const searchParams = new URLSearchParams(params);
      const url = `/api/v1/indicator/?${searchParams}`;
      const response = await client.gateway.get<IndicatorsResponse>('THIAPP', url);
      const count = response.data.meta.pagination.count;
      return [query.name, count];
    });

    const results = await Promise.all(promises);
    const result: Result = {
      range,
      date: dayjs().subtract(from, 'day').toDate(),
      ...Object.fromEntries(results)
    };
    return result;
  }

  async function initAmChart() {
    loadingChart = true;
    await tick();
    amchart?.dispose();

    const items = await fetchGraphData();
    const keys: (keyof (typeof items)[number])[] = [
      'New indicators',
      'New malware',
      'New IPs',
      'New domains',
      'New crimeservers'
    ];

    const chart = window.am4core.create(chartDiv, window.am4charts.XYChart);
    chart.data = items;

    const dateAxis = chart.xAxes.push(new window.am4charts.DateAxis());
    const valueAxis = new window.am4charts.ValueAxis();
    valueAxis.min = 0;
    chart.yAxes.push(valueAxis);

    if ($darkMode) {
      dateAxis.renderer.labels.template.fill = window.am4core.color('white');
      valueAxis.renderer.labels.template.fill = window.am4core.color('white');
      dateAxis.renderer.grid.template.stroke = window.am4core.color('white');
      valueAxis.renderer.grid.template.stroke = window.am4core.color('white');
    }

    keys.forEach((key) => {
      // Create series
      if (key === 'New indicators') {
        const series = chart.series.push(new window.am4charts.LineSeries());
        series.dataFields.valueY = key;
        series.dataFields.dateX = 'date';
        series.strokeWidth = 2;
        series.minBulletDistance = 10;
        series.zIndex = 1;
      } else {
        const series = chart.series.push(new window.am4charts.ColumnSeries());
        series.dataFields.valueY = key;
        series.dataFields.dateX = 'date';
        series.strokeWidth = 2;
        series.minBulletDistance = 10;

        series.sequencedInterpolation = true;
        series.stacked = true;

        const labelBullet = series.bullets.push(new window.am4charts.LabelBullet());
        labelBullet.label.text = '{valueY}';
        labelBullet.locationY = 0.5;
        labelBullet.label.hideOversized = true;
        if ($darkMode) {
          labelBullet.label.fill = window.am4core.color('white');
        }
      }
    });

    const tooltipColumns = Math.ceil(chart.series.length / 15);
    const seriesArray = Array.from(chart.series);
    const tooltipHtml =
      seriesArray
        .slice(1)
        .map((serie) => {
          const key = serie.dataFields.valueY;
          const color = serie.realFill.toString();
          return `
        <div>
          <span style="color: ${color}">●</span>
          <span>${chart.series.length > 1 ? `${key}:` : ''} {${key}}</span>
        </div>`;
        })
        .join('\n') +
      `<div style="border-top: 1px solid #ccc;">
          <span style="color: ${seriesArray[0].realFill.toString()}">●</span>
          <span>TOTAL: {${seriesArray[0].dataFields.valueY}}</span>
        </div>`;

    // Only first serie have tooltip with all data
    const firstSerie = chart.series.getIndex(0);
    firstSerie.tooltipHTML = `
    <div>
      <strong>{range}</strong>
    </div>
    <div style="display: grid;grid-template-columns: repeat(${tooltipColumns}, 1fr);">
      ${tooltipHtml}
    </div>`;
    firstSerie.tooltip.getFillFromObject = false;
    if (chart.series.length > 10) {
      firstSerie.tooltip.fontSize = 12;
    }
    firstSerie.tooltip.background.fill = window.am4core.color('#fff');
    firstSerie.tooltip.label.fill = window.am4core.color('#000');

    // Add cursor
    chart.cursor = new window.am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;

    amchart = chart;
    loadingChart = false;
  }

  async function downloadReport() {
    notifications.notify({ title: 'Not implemented 🙂', kind: 'info' });
    selectedRowIds = [];
  }
</script>

<div class="grid gap-2" class:grid-cols-3={columns === 2}>
  {#if columns === 2}
    <div class="relative z-10">
      <div bind:this={chartDiv} class="w-full h-full" class:opacity-40={loadingChart} />
      {#if loadingChart}
        <InlineLoading class="absolute top-0 left-0 flex items-center justify-center w-full h-full" />
      {/if}
    </div>
  {/if}

  <div
    class="w-full"
    class:col-span-2={columns === 2}
    style:--cds-spacing-03="0"
    style:--cds-spacing-04="0.25rem"
    style:--cds-spacing-05="0.75rem"
  >
    <h4 class="absolute z-10">Latest Indicators</h4>

    {#if loading}
      <DataTableSkeleton size="compact" rows={numItems} columns={headers.length} showHeader={false} />
    {:else}
      <DataTable batchSelection bind:selectedRowIds size="compact" {headers} rows={indicators.slice(0, numItems)}>
        <Toolbar class="z-10-if-ToolbarBatchActions">
          <ToolbarBatchActions>
            <Button on:click={downloadReport} icon={Report} class="flex gap-1 text-xs px-1">Download as CSV</Button>
            <Button on:click={downloadReport} icon={Report} class="flex gap-1 text-xs px-1">Download as JSON</Button>
            <Button on:click={downloadReport} icon={Copy} class="flex gap-1 text-xs px-1">Copy to clipboard</Button>
          </ToolbarBatchActions>
        </Toolbar>
        <svelte:fragment slot="cell" let:row let:cell>
          {#if cell.key === 'value'}
            <div title={cell.value} class="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
              {cell.value}
            </div>
          {:else if cell.key === 'risk'}
            <div class="text-center">
              <ScoreCve score={cell.value?.toFixed(2)} size="sm" />
            </div>
          {:else}
            <div class="text-center">
              {cell.display ? cell.display(row) : cell.value}
            </div>
          {/if}
        </svelte:fragment>
      </DataTable>
    {/if}
  </div>
</div>

<div class="flex flex-row-reverse">
  <Button
    kind="ghost"
    size="small"
    href="/dashboard/organizations/{$currentOrganizationId}/modules/{$currentModuleId}/tcx/global-search?display=all-indicators"
  >
    See all indicators
  </Button>
</div>
