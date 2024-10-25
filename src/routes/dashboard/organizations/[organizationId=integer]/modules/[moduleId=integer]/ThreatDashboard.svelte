<script lang="ts">
  import Client from '$lib/client';
  import type { ThreatDashboardItem } from '$lib/client/services/threats';
  import { currentModuleId } from '$stores/module';
  import { currentOrganizationId } from '$stores/organization';
  import type { ThreatSearchType } from '$lib/types/threat';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { InlineLoading } from 'carbon-components-svelte';
  import { cloneDeep, isEqual } from 'lodash';
  import userStore from '$stores/user';
  import dayjs from 'dayjs';
  import { COLORS } from '$lib/constants/colors';
  import darkMode from '$stores/darkMode';

  export let filters: ThreatSearchType;

  const client = new Client();
  const { primary, lightBlue } = COLORS;

  onMount(() => {
    initAmChart(generateEmptyGraph());
    return () => {
      client.abort();
      amchart?.dispose();
    };
  });

  if (browser) {
    window.am4core.useTheme(window.am4themes_animated);
    window.am4core.options.commercialLicense = true;
  }

  let loading = false;
  let transparent = false;
  let exportButton: HTMLDivElement;
  let chartDiv: HTMLDivElement;
  let amchart: import('@amcharts/amcharts4/charts').XYChart;
  let lastFilters: ThreatSearchType;

  $: browser && filters && onFilterChange($currentOrganizationId, $currentModuleId, filters);

  async function onFilterChange(organizationId: number, moduleId: number, filters: ThreatSearchType) {
    const currentFilters = cloneDeep(filters);
    delete currentFilters.q;
    delete currentFilters.page;
    delete currentFilters.o;

    if (isEqual(lastFilters, currentFilters)) return;

    loading = true;
    lastFilters = currentFilters;
    const items = await client.threats.getThreatsDashboard(organizationId, moduleId, filters, $userStore.timezone);
    loading = false;
    initAmChart(items);
  }

  function initAmChart(items: ThreatDashboardItem[]) {
    amchart?.dispose();

    const chart = window.am4core.create(chartDiv, window.am4charts.XYChart);
    chart.data = items.map((item) => ({ ...item, endDate: item.endDate.format() }));

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

    chart.exporting.menu = new window.am4core.ExportMenu();
    chart.exporting.menu.container = exportButton;
    chart.exporting.timeoutDelay = 10000;
    chart.plugins.push(new window.am4plugins_annotation.Annotation());

    chart.colors.list = [window.am4core.color($darkMode ? lightBlue : primary)];

    // Create series
    const series = chart.series.push(new window.am4charts.LineSeries());
    series.dataFields.valueY = 'value';
    series.dataFields.dateX = 'endDate';
    series.strokeWidth = 2;
    series.minBulletDistance = 10;
    series.tooltipText = '{valueY}';
    series.tooltip.pointerOrientation = 'vertical';
    series.tooltip.background.cornerRadius = 20;
    series.tooltip.background.fillOpacity = 0.5;
    series.tooltip.label.padding(12, 12, 12, 12);

    // Bullets
    const interfaceColors = new window.am4core.InterfaceColorSet();
    const bullet = series.bullets.push(new window.am4charts.CircleBullet());
    bullet.circle.stroke = interfaceColors.getFor('background');
    bullet.circle.strokeWidth = 2;
    bullet.circle.fill = window.am4core.color($darkMode ? lightBlue : primary);

    chart.scrollbarX = new window.am4core.Scrollbar();
    chart.scrollbarX.parent = chart.bottomAxesContainer;

    // Add cursor
    chart.cursor = new window.am4charts.XYCursor();
    chart.cursor.xAxis = dateAxis;
    chart.cursor.snapToSeries = series;

    amchart = chart;
  }

  function generateEmptyGraph() {
    const items: ThreatDashboardItem[] = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date(new Date().setDate(new Date().getDate() - i));
      items.push({
        id: i,
        endDate: dayjs(date),
        startDate: dayjs(date),
        value: 0
      });
    }
    return items;
  }

  function setTransparent() {
    transparent = true;
  }
  function setVisible() {
    transparent = false;
  }
</script>

<div class="relative p-2">
  <div
    bind:this={exportButton}
    class="relative -top-6"
    on:mouseover={setTransparent}
    on:focus={setTransparent}
    on:mouseout={setVisible}
    on:blur={setVisible}
    on:click={setVisible}
  />
  <div bind:this={chartDiv} class="w-full h-52 {transparent ? 'opacity-10' : ''} {loading ? 'opacity-40' : ''}" />

  {#if loading}
    <InlineLoading class="absolute top-0 left-0 flex items-center justify-center w-full h-full" />
  {/if}
</div>
