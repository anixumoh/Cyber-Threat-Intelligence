import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldLow from '@amcharts/amcharts4-geodata/worldLow';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() dataImages;
  @Input() mapType = 'country_dotted';
  @Input() placeholder = 'mapdiv';
  @Input() height = '500px';
  @Input() width = '100%';
  @Input() legend: any = {};

  @ViewChild('mapDiv') mapDiv: ElementRef;
  private map: am4maps.MapChart;

  onChanges = new ReplaySubject(1);

  ngOnInit() {
    am4core.useTheme(am4themes_animated);
    am4core.options.commercialLicense = true;
  }

  ngAfterViewInit() {
    this.onChanges.subscribe(() => this.drawMap());
  }

  ngOnDestroy() {
    this.onChanges.complete();
    if (this.map) {
      this.map.dispose();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dataImages) {
      this.onChanges.next();
    }
  }

  private drawMap() {
    if (this.mapType === 'country_dotted') {
      this.map = this.drawCountryDotted();
    } else if (this.mapType === 'country_area') {
      this.map = this.drawCountryArea();
    }
  }

  private createMapChart(): am4maps.MapChart {
    const chart = am4core.create(this.mapDiv.nativeElement, am4maps.MapChart);
    chart.geodata = am4geodata_worldLow;
    chart.projection = new am4maps.projections.Mercator();
    chart.zoomControl = new am4maps.ZoomControl();
    chart.zoomControl.align = 'left';
    chart.zoomControl.valign = 'top';
    const homeButton = new am4core.Button();
    homeButton.events.on('hit', () => chart.goHome());
    homeButton.icon = new am4core.Sprite();
    homeButton.padding(7, 5, 7, 5);
    homeButton.width = 30;
    homeButton.icon.path = 'M16,8 L14,8 L14,16 L10,16 L10,10 L6,10 L6,16 L2,16 L2,8 L0,8 L8,0 L16,8 Z M16,8';
    homeButton.marginBottom = 10;
    homeButton.parent = chart.zoomControl;
    homeButton.insertBefore(chart.zoomControl.plusButton);
    return chart;
  }

  private drawWorldSeries(chart, excludedCountries = ['AQ']): am4maps.MapPolygonSeries {
    const worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
    worldSeries.name = 'world';
    worldSeries.useGeodata = true;
    worldSeries.exclude = excludedCountries;
    worldSeries.fillOpacity = 0.8;
    worldSeries.hiddenInLegend = true;
    worldSeries.mapPolygons.template.nonScalingStroke = true;
    return worldSeries;
  }

  private drawCountryArea(): am4maps.MapChart {
    const chart = this.createMapChart();
    const excludedCountries = ['AQ'];

    this.legend.data.forEach((legend) => {
      const includedCountries = [];
      const data = this.dataImages
        .filter((data: any) => data.color === legend.color)
        .map((data: any) => ({
          id: data.id,
          title: data.title
        }));
      data.forEach((country) => {
        includedCountries.push(country.id);
        excludedCountries.push(country.id);
      });

      const series = chart.series.push(new am4maps.MapPolygonSeries());
      series.name = legend.title;
      series.useGeodata = true;
      series.include = includedCountries;
      series.fill = am4core.color(legend.color);
      series.setStateOnChildren = true;
      series.calculateVisualCenter = true;

      const mapPolygonTemplate = series.mapPolygons.template;
      mapPolygonTemplate.fill = am4core.color(legend.color);
      mapPolygonTemplate.fillOpacity = 0.8;
      mapPolygonTemplate.nonScalingStroke = true;
      mapPolygonTemplate.tooltipPosition = 'pointer';
      mapPolygonTemplate.tooltipText = '{title}';

      const hoverState = mapPolygonTemplate.states.create('hover');
      hoverState.properties.fill = series.fill.lighten(0.2);

      series.data = [...data];
    });

    chart.legend = new am4maps.Legend();
    chart.legend.labels.template.truncate = false;
    chart.legend.position = 'left';
    chart.legend.align = 'left';
    chart.legend.valign = 'bottom';
    chart.legend.itemContainers.template.interactionsEnabled = false;

    this.drawWorldSeries(chart, excludedCountries);
    return chart;
  }

  private drawCountryDotted(): am4maps.MapChart {
    const chart = this.createMapChart();
    const worldSeries = this.drawWorldSeries(chart);
    worldSeries.fill = am4core.color('#07272d');
    worldSeries.mapPolygons.template.fill = am4core.color('#07272d');

    const data = this.dataImages.map((data: any) => ({
      color: am4core.color(data.color),
      svgPath: data.svgPath,
      latitude: data.latitude,
      longitude: data.longitude,
      title: data.title
    }));

    const series = chart.series.push(new am4maps.MapImageSeries());
    series.propertyFields.fill = 'color';

    const originImageTemplate = series.mapImages.template;
    originImageTemplate.propertyFields.latitude = 'latitude';
    originImageTemplate.propertyFields.longitude = 'longitude';
    originImageTemplate.propertyFields.fill = 'color';

    originImageTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    originImageTemplate.nonScaling = true;
    originImageTemplate.tooltipHTML = '{title}';
    originImageTemplate.horizontalCenter = 'middle';
    originImageTemplate.verticalCenter = 'middle';

    const originTargetIcon = originImageTemplate.createChild(am4core.Sprite);
    originTargetIcon.propertyFields.fill = 'color';
    originTargetIcon.propertyFields.path = 'svgPath';
    originTargetIcon.strokeWidth = 0;
    originTargetIcon.scale = 1.3;
    originTargetIcon.horizontalCenter = 'middle';
    originTargetIcon.verticalCenter = 'middle';

    series.data = [...data];
    return chart;
  }
}
