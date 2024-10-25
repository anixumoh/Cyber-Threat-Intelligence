<script lang="ts">
  import { browser } from '$app/environment';
  import modalTeleport from '$lib/actions/modalTeleport';
  import Client from '$lib/client';
  import type { Actor } from '$lib/client/services/actors';
  import ExportableDataTable from '$lib/components/ExportableDataTable/ExportableDataTable.svelte';
  import darkMode from '$stores/darkMode';
  import { Button, InlineLoading, Modal } from 'carbon-components-svelte';
  import type { DataTableHeader } from 'carbon-components-svelte/types/DataTable/DataTable.svelte';
  import { List } from 'carbon-icons-svelte';
  import { onMount, tick } from 'svelte';

  if (browser) {
    window.am4core.useTheme(window.am4themes_animated);
    window.am4core.options.commercialLicense = true;
  }

  const client = new Client();

  export let columns = 1;
  export let rows = 1;

  const headers: DataTableHeader[] = [
    { key: 'region', value: 'REGION' },
    { key: 'count', value: 'COUNT' }
  ];
  let open = false;

  type ChartData = {
    region: string;
    count: number;
  };

  let actors: Actor[] = [];
  let loading = false;

  let chartDiv: HTMLDivElement;
  let amchart: import('@amcharts/amcharts4/charts').PieChart;

  $: getActors();
  $: chartData = groupByRegion(actors);
  $: initAmChart(chartData);

  onMount(() => {
    return () => {
      client.abort();
      amchart?.dispose();
    };
  });

  async function initAmChart(items: ChartData[]) {
    await tick();
    amchart?.dispose();

    const chart = window.am4core.create(chartDiv, window.am4charts.PieChart);
    chart.data = items;
    chart.innerRadius = window.am4core.percent(50);

    const pieSeries = chart.series.push(new window.am4charts.PieSeries());
    pieSeries.dataFields.category = 'region';
    pieSeries.dataFields.value = 'count';

    pieSeries.labels.template.adapter.add('fill', function (color, target) {
      if (target.dataItem && target.dataItem.values.value.percent < 10) {
        return window.am4core.color('#00000000'); // transparent
      }
      return color;
    });

    pieSeries.slices.template.tooltipText = '{category}: {count}';

    pieSeries.ticks.template.disabled = true;
    pieSeries.alignLabels = false;
    pieSeries.labels.template.text = '{count}';
    pieSeries.labels.template.radius = window.am4core.percent(-20);
    if ($darkMode) {
      pieSeries.labels.template.fill = window.am4core.color('white');
    }

    chart.legend = new window.am4charts.Legend();
    chart.legend.valueLabels.template.text = '{count}';
    if ($darkMode) {
      chart.legend.labels.template.fill = window.am4core.color('white');
      chart.legend.valueLabels.template.fill = window.am4core.color('white');
    }

    amchart = chart;
  }

  async function getActors() {
    loading = true;
    actors = await client.actors.getActors();
    loading = false;
  }

  // I have no "region", so I'll use "actor.types[]"
  function groupByRegion(actors: Actor[]): ChartData[] {
    const tmp: Record<string, number> = {};
    actors.forEach((actor) => {
      actor.types.forEach((alias) => {
        if (!tmp[alias]) {
          tmp[alias] = 1;
        } else {
          tmp[alias]++;
        }
      });
    });
    const data: ChartData[] = Object.entries(tmp).map(([sophistication, count]) => ({ region: sophistication, count }));
    data.sort((a, b) => b.count - a.count);
    return data;
  }
</script>

<div class="relative h-full" style:min-height="{250 * rows}px">
  <div class="absolute z-10 flex justify-between w-full">
    <h4>Actors by Industry</h4>
    <Button
      on:click={() => (open = true)}
      kind="ghost"
      icon={List}
      iconDescription="Show data"
      tooltipAlignment="end"
    />
  </div>
  <div bind:this={chartDiv} class="w-full h-full" class:opacity-40={loading} />
  {#if loading}
    <InlineLoading class="absolute top-0 left-0 flex items-center justify-center w-full h-full" />
  {/if}
</div>

<div use:modalTeleport>
  <Modal
    modalHeading="Actors by Industry"
    bind:open
    primaryButtonText="Close"
    on:click:button--primary={() => (open = false)}
  >
    <ExportableDataTable
      {headers}
      rows={chartData.map((row) => ({ ...row, id: row.region }))}
      fileName="actors-by-industry"
    />
  </Modal>
</div>
