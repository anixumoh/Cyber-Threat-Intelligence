<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { MapData, MapLegend } from './types';
  import darkMode from '$stores/darkMode';

  export let mapData: MapData[] = [];
  export let mapType: 'country_dotted' | 'country_area' = 'country_dotted';
  export let height = '500px';
  export let width = '100%';
  export let legend: MapLegend[] = [];

  onMount(() => {
    window.am4core.useTheme(window.am4themes_animated);
    window.am4core.options.commercialLicense = true;
    mounted = true;
    return () => {
      map?.dispose();
    };
  });

  type MapChart = import('@amcharts/amcharts4/maps').MapChart;

  const dispatch = createEventDispatcher<{ hit: { latitude: number; longitude: number } }>();

  let map: MapChart;
  let mapEl: HTMLElement;
  let mounted = false;

  $: mounted && mapData && drawMap();

  function drawMap() {
    map?.dispose();
    if (mapType === 'country_dotted') {
      map = drawCountryDotted();
    } else if (mapType === 'country_area') {
      map = drawCountryArea();
    }
  }

  function createMapChart() {
    const chart = window.am4core.create(mapEl, window.am4maps.MapChart);
    chart.geodata = window.am4geodata_worldLow;
    chart.projection = new window.am4maps.projections.Mercator();
    chart.zoomControl = new window.am4maps.ZoomControl();
    chart.zoomControl.align = 'left';
    chart.zoomControl.valign = 'top';
    const homeButton = new window.am4core.Button();
    homeButton.events.on('hit', () => chart.goHome());
    homeButton.icon = new window.am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);
    return chart;
  }

  function drawWorldSeries(chart: MapChart, excludedCountries = ['AQ']) {
    const worldSeries = chart.series.push(new window.am4maps.MapPolygonSeries());
    worldSeries.name = 'world';
    worldSeries.useGeodata = true;
    worldSeries.exclude = excludedCountries;
    worldSeries.fillOpacity = 0.8;
    worldSeries.hiddenInLegend = true;
    worldSeries.mapPolygons.template.nonScalingStroke = true;
    return worldSeries;
  }

  function drawCountryArea() {
    const chart = createMapChart();
    const excludedCountries = ['AQ'];

    legend.forEach((legend) => {
      const includedCountries = [];
      const data = mapData
        .filter((data) => data.color === legend.color)
        .map((data) => ({
          id: data.id,
          title: data.title
        }));
      data.forEach((country) => {
        includedCountries.push(country.id);
        excludedCountries.push(country.id);
      });

      const series = chart.series.push(new window.am4maps.MapPolygonSeries());
      series.name = legend.title;
      series.useGeodata = true;
      series.include = includedCountries;
      series.fill = window.am4core.color(legend.color);
      series.setStateOnChildren = true;
      series.calculateVisualCenter = true;

      const mapPolygonTemplate = series.mapPolygons.template;
      mapPolygonTemplate.fill = window.am4core.color(legend.color);
      mapPolygonTemplate.fillOpacity = 0.8;
      mapPolygonTemplate.nonScalingStroke = true;
      mapPolygonTemplate.tooltipPosition = 'pointer';
      mapPolygonTemplate.tooltipText = '{title}';

      const hoverState = mapPolygonTemplate.states.create('hover');
      hoverState.properties.fill = series.fill.lighten(0.2);

      series.data = [...data];
    });

    chart.legend = new window.am4maps.Legend();
    chart.legend.labels.template.truncate = false;
    chart.legend.position = 'left';
    chart.legend.align = 'left';
    chart.legend.valign = 'bottom';
    if ($darkMode) {
      chart.legend.labels.template.fill = window.am4core.color('white');
    }
    chart.legend.itemContainers.template.interactionsEnabled = false;

    drawWorldSeries(chart, excludedCountries);
    return chart;
  }

  function drawCountryDotted() {
    const chart = createMapChart();
    const worldSeries = drawWorldSeries(chart);
    worldSeries.fill = window.am4core.color('#07272d');
    worldSeries.mapPolygons.template.fill = window.am4core.color('#07272d');

    const data = mapData.filter((d) => d.latitude || d.longitude);

    const series = chart.series.push(new window.am4maps.MapImageSeries());
    series.propertyFields.fill = 'color';

    const originImageTemplate = series.mapImages.template;
    originImageTemplate.propertyFields.latitude = 'latitude';
    originImageTemplate.propertyFields.longitude = 'longitude';
    originImageTemplate.propertyFields.fill = 'color';

    originImageTemplate.events.on('hit', (e) =>
      dispatch('hit', {
        latitude: e.target.properties.latitude,
        longitude: e.target.properties.longitude
      })
    );

    originImageTemplate.cursorOverStyle = window.am4core.MouseCursorStyle.pointer;
    originImageTemplate.nonScaling = true;
    originImageTemplate.tooltipHTML = '{title}';
    originImageTemplate.horizontalCenter = 'middle';
    originImageTemplate.verticalCenter = 'middle';

    const originTargetIcon = originImageTemplate.createChild(window.am4core.Sprite);
    originTargetIcon.propertyFields.fill = 'color';
    originTargetIcon.propertyFields.path = 'svgPath';
    originTargetIcon.strokeWidth = 0;
    originTargetIcon.scale = 1.3;
    originTargetIcon.horizontalCenter = 'middle';
    originTargetIcon.verticalCenter = 'middle';

    series.data = [...data];
    return chart;
  }
</script>

<div bind:this={mapEl} style="width: {width}; height: {height}" />
